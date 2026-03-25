"""
amoCRM Integration Service

Handles creating leads and contacts in amoCRM via their REST API v4.
All credentials are read from environment variables — no hardcoded secrets.

Required env vars:
  AMO_SUBDOMAIN              — your amoCRM subdomain (e.g. "cartoonvideo")
  AMO_ACCESS_TOKEN           — full OAuth2 access token (if fits in one var)
  AMO_ACCESS_TOKEN_PART1     — first half of the token  (if split)
  AMO_ACCESS_TOKEN_PART2     — second half of the token (if split)

Optional env vars:
  AMO_PIPELINE_ID            — pipeline (воронка) ID where leads are created
  AMO_STATUS_ID              — status (этап) ID for new leads inside the pipeline
  AMO_RESPONSIBLE_USER_ID    — responsible user ID in amoCRM

Token is stored WITHOUT the "Bearer " prefix.
The "Authorization: Bearer <token>" header is constructed at request time.
"""

import os
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


def _get_env(key: str) -> Optional[str]:
    return os.environ.get(key)


def _require_env(key: str) -> str:
    val = os.environ.get(key)
    if not val:
        raise EnvironmentError(
            f"Missing required environment variable: {key}. "
            f"Please set it in your .env or deployment secrets."
        )
    return val


def _get_access_token() -> str:
    """
    Assemble the amoCRM access token from environment variables.

    Supports two modes:
    1. Single variable:  AMO_ACCESS_TOKEN  (if platform allows long values)
    2. Split variables:  AMO_ACCESS_TOKEN_PART1 + AMO_ACCESS_TOKEN_PART2
       (use when platform limits env var length to ~500 chars)

    The token must NOT contain the "Bearer " prefix — that is added in headers.
    """
    # Try split mode first (more specific)
    part1 = os.environ.get("AMO_ACCESS_TOKEN_PART1", "")
    part2 = os.environ.get("AMO_ACCESS_TOKEN_PART2", "")

    if part1 and part2:
        token = part1 + part2
        logger.info(
            "amoCRM token assembled from PART1 (%d chars) + PART2 (%d chars) = %d chars",
            len(part1), len(part2), len(token),
        )
        return token

    # Fallback to single variable
    token = os.environ.get("AMO_ACCESS_TOKEN", "")
    if token:
        # Strip "Bearer " prefix if someone accidentally included it
        if token.startswith("Bearer "):
            token = token[7:]
        logger.info("amoCRM token from AMO_ACCESS_TOKEN (%d chars)", len(token))
        return token

    raise EnvironmentError(
        "Missing amoCRM access token. Set either AMO_ACCESS_TOKEN or "
        "AMO_ACCESS_TOKEN_PART1 + AMO_ACCESS_TOKEN_PART2 in deployment secrets."
    )


class AmoCRMService:
    """Stateless service — every call reads env vars fresh."""

    @staticmethod
    def _base_url() -> str:
        subdomain = _require_env("AMO_SUBDOMAIN")
        return f"https://{subdomain}.amocrm.ru"

    @staticmethod
    def _headers() -> dict:
        token = _get_access_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    @classmethod
    async def create_lead_with_contact(
        cls,
        name: str,
        phone: str,
        topic: str = "",
    ) -> dict:
        """
        Create a lead in amoCRM and attach a contact with the given phone.

        Steps:
        1. Create (or find) a contact with the phone number.
        2. Create a lead and link the contact to it.

        Returns a dict with lead_id and contact_id.
        """
        base_url = cls._base_url()
        headers = cls._headers()

        pipeline_id = _get_env("AMO_PIPELINE_ID")
        status_id = _get_env("AMO_STATUS_ID")
        responsible_user_id = _get_env("AMO_RESPONSIBLE_USER_ID")

        async with httpx.AsyncClient(timeout=15) as client:
            # ── Step 1: Create contact ──────────────────────────────
            contact_payload = [
                {
                    "name": name,
                    "custom_fields_values": [
                        {
                            "field_code": "PHONE",
                            "values": [{"value": phone, "enum_code": "MOB"}],
                        }
                    ],
                }
            ]
            if responsible_user_id:
                contact_payload[0]["responsible_user_id"] = int(responsible_user_id)

            logger.info("Creating contact in amoCRM for %s", name)
            contact_resp = await client.post(
                f"{base_url}/api/v4/contacts",
                headers=headers,
                json=contact_payload,
            )
            contact_resp.raise_for_status()
            contact_data = contact_resp.json()
            contact_id = contact_data["_embedded"]["contacts"][0]["id"]
            logger.info("Contact created: %s", contact_id)

            # ── Step 2: Create lead ─────────────────────────────────
            lead_name = f"Заявка с сайта CARTON — {name}"
            if topic:
                lead_name = f"Заявка: {topic} — {name}"

            lead_body: dict = {
                "name": lead_name,
                "_embedded": {
                    "contacts": [{"id": contact_id}],
                },
            }

            # Optional: set pipeline / status / responsible user
            if pipeline_id:
                lead_body["pipeline_id"] = int(pipeline_id)
            if status_id:
                lead_body["status_id"] = int(status_id)
            if responsible_user_id:
                lead_body["responsible_user_id"] = int(responsible_user_id)

            # Add topic as a note-style text in the lead
            # amoCRM stores custom text in custom_fields or we attach a note after.
            # For simplicity we put topic into the lead name above and also
            # add it as a note right after creation.

            logger.info("Creating lead in amoCRM: %s", lead_name)
            lead_resp = await client.post(
                f"{base_url}/api/v4/leads",
                headers=headers,
                json=[lead_body],
            )
            lead_resp.raise_for_status()
            lead_data = lead_resp.json()
            lead_id = lead_data["_embedded"]["leads"][0]["id"]
            logger.info("Lead created: %s", lead_id)

            # ── Step 3 (optional): Attach a note with topic details ─
            if topic:
                note_payload = [
                    {
                        "note_type": "common",
                        "params": {
                            "text": (
                                f"Тематика видео: {topic}\n"
                                f"Имя: {name}\n"
                                f"Телефон: {phone}"
                            ),
                        },
                    }
                ]
                try:
                    await client.post(
                        f"{base_url}/api/v4/leads/{lead_id}/notes",
                        headers=headers,
                        json=note_payload,
                    )
                except Exception as note_err:
                    # Non-critical — lead already created
                    logger.warning("Failed to attach note to lead %s: %s", lead_id, note_err)

        return {"lead_id": lead_id, "contact_id": contact_id}
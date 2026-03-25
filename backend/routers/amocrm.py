"""
Router: amoCRM lead creation endpoint.

POST /api/v1/amocrm/create-lead
  Body: { name: str, phone: str, topic?: str }

The endpoint validates input, calls AmoCRMService, and returns a result.
Returns user-friendly JSON responses (never raw technical errors).
"""

import logging
import os

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.amocrm_service import AmoCRMService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/amocrm", tags=["amocrm"])


class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Имя клиента")
    phone: str = Field(..., min_length=5, max_length=30, description="Номер телефона")
    topic: str = Field("", max_length=1000, description="Тематика видео")


class LeadResponse(BaseModel):
    success: bool
    message: str
    lead_id: int | None = None
    contact_id: int | None = None


@router.post("/create-lead", response_model=LeadResponse)
async def create_lead(data: LeadRequest):
    """
    Accept a form submission from the landing page and create
    a lead + contact in the connected amoCRM account.

    Always returns 200 with success=True/False to avoid
    platform/proxy layers swallowing non-200 responses.
    """
    name = data.name.strip()
    phone = data.phone.strip()
    topic = data.topic.strip()

    if not name:
        return LeadResponse(success=False, message="Имя обязательно для заполнения")

    if not phone:
        return LeadResponse(success=False, message="Телефон обязателен для заполнения")

    amo_sub = os.environ.get("AMO_SUBDOMAIN", "")
    amo_token = os.environ.get("AMO_ACCESS_TOKEN", "")
    amo_token_part1 = os.environ.get("AMO_ACCESS_TOKEN_PART1", "")
    amo_token_part2 = os.environ.get("AMO_ACCESS_TOKEN_PART2", "")

    logger.info(
        "Incoming lead request: name_len=%s, phone_len=%s, topic_len=%s",
        len(name),
        len(phone),
        len(topic),
    )

    logger.info(
        "amoCRM env check: AMO_SUBDOMAIN=%s, AMO_ACCESS_TOKEN=%s, PART1=%s, PART2=%s",
        f"{amo_sub[:4]}..." if amo_sub else "<MISSING>",
        f"{amo_token[:6]}..." if amo_token else "<MISSING>",
        f"{len(amo_token_part1)} chars" if amo_token_part1 else "<MISSING>",
        f"{len(amo_token_part2)} chars" if amo_token_part2 else "<MISSING>",
    )

    try:
        result = await AmoCRMService.create_lead_with_contact(
            name=name,
            phone=phone,
            topic=topic,
        )

        return LeadResponse(
            success=True,
            message="Заявка успешно отправлена!",
            lead_id=result["lead_id"],
            contact_id=result["contact_id"],
        )

    except EnvironmentError as env_err:
        logger.error("amoCRM env not configured: %s", env_err)
        return LeadResponse(
            success=False,
            message=(
                "CRM временно недоступна — не настроены ключи доступа. "
                "Пожалуйста, напишите в WhatsApp, мы обработаем вашу заявку вручную."
            ),
        )

    except Exception as exc:
        logger.error("amoCRM lead creation failed: %s", exc, exc_info=True)
        return LeadResponse(
            success=False,
            message="Не удалось отправить заявку. Попробуйте ещё раз или напишите в WhatsApp.",
        )
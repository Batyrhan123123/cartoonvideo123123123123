"""
Public video URLs endpoint.
Returns download URLs for videos in the public 'videos' bucket.
No authentication required since the bucket is public.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from services.storage import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/public", tags=["public"])

# Map of video filenames to their metadata
VIDEO_CATALOG = [
    {"key": "predlozhenie.mp4", "title": "Предложение", "category": "Love Story", "duration": "4 мин"},
    {"key": "godovshhina-30-let.mp4", "title": "Годовщина 30 лет", "category": "Love Story", "duration": "4 мин"},
    {"key": "dlya-zheny.mp4", "title": "Для жены", "category": "Love Story", "duration": "4 мин"},
    {"key": "15-let-v-brake.mp4", "title": "15 лет в браке", "category": "Love Story", "duration": "2 мин"},
    {"key": "1-min-bez-ozvuchki.mp4", "title": "1 минута без озвучки", "category": "Love Story", "duration": "1 мин"},
    {"key": "1-5-min-bez-ozvuchki.mp4", "title": "1.5 минуты без озвучки", "category": "Love Story", "duration": "1.5 мин"},
]

BUCKET_NAME = "videos"


@router.get("/videos")
async def get_video_urls():
    """
    Return download URLs for all portfolio videos.
    Public endpoint — no auth required.
    """
    try:
        service = StorageService()
        videos = []

        for item in VIDEO_CATALOG:
            try:
                from schemas.storage import FileUpDownRequest
                request = FileUpDownRequest(bucket_name=BUCKET_NAME, object_key=item["key"])
                result = await service.create_download_url(request)
                videos.append({
                    "key": item["key"],
                    "title": item["title"],
                    "category": item["category"],
                    "duration": item["duration"],
                    "url": result.download_url or "",
                })
            except Exception as e:
                logger.warning(f"Failed to get URL for {item['key']}: {e}")
                videos.append({
                    "key": item["key"],
                    "title": item["title"],
                    "category": item["category"],
                    "duration": item["duration"],
                    "url": "",
                })

        return {"success": True, "videos": videos}
    except Exception as e:
        logger.error(f"Failed to get video URLs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load videos: {str(e)}",
        )
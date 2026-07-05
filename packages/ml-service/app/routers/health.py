from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "up",
        "service": "sellwise-ml",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
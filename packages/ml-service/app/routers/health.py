from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "up",
        "service": "sellwise-ml",
        "timestamp": datetime.utcnow().isoformat()
    }
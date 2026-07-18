import logging
from fastapi import APIRouter, HTTPException
from ..models.schemas import ChurnRequest, ChurnResponse, TrainChurnRequest
from ..services.churn_service import predict_churn, train_churn_model

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/churn", response_model=ChurnResponse)
def calculate_churn(request: ChurnRequest):
    try:
        predictions = predict_churn(request.store_id, request.customers)
        return ChurnResponse(
            store_id=request.store_id,
            predictions=predictions
        )
    except Exception as e:
        logger.exception("Churn prediction failed")
        raise HTTPException(status_code=500, detail="Churn prediction failed. Please try again later.")

@router.post("/churn/train")
def train_churn(request: TrainChurnRequest):
    try:
        success = train_churn_model(request.store_id, request.customers)
        if not success:
            raise HTTPException(status_code=400, detail="Insufficient data or variance to train churn model.")
        return {"status": "success", "message": "Churn model trained and persisted successfully."}
    except Exception as e:
        logger.exception("Churn training failed")
        raise HTTPException(status_code=500, detail="Churn training failed. Please try again later.")
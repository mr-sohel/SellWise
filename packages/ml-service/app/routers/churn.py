from fastapi import APIRouter, HTTPException
from ..models.schemas import ChurnRequest, ChurnResponse
from ..services.churn_service import predict_churn

router = APIRouter()

@router.post("/churn", response_model=ChurnResponse)
async def calculate_churn(request: ChurnRequest):
    try:
        predictions = predict_churn(request.customers)

        return ChurnResponse(
            store_id=request.store_id,
            predictions=predictions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Churn prediction failed: {str(e)}")
from fastapi import APIRouter, HTTPException
from ..models.schemas import ForecastRequest, ForecastResponse
from ..services.prophet_service import generate_forecast

router = APIRouter()

@router.post("/forecast", response_model=ForecastResponse)
async def create_forecast(request: ForecastRequest):
    try:
        # Generate forecast using the prophet service
        predictions = generate_forecast(request.history, request.periods)

        return ForecastResponse(
            store_id=request.store_id,
            product_id=request.product_id,
            forecast=predictions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")
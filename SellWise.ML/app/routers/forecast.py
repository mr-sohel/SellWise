import logging
from fastapi import APIRouter, HTTPException
from ..models.schemas import ForecastRequest, ForecastResponse
from ..services.prophet_service import generate_forecast

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/forecast", response_model=ForecastResponse)
def create_forecast(request: ForecastRequest):
    try:
        # Generate forecast using the prophet service
        predictions = generate_forecast(
            request.history,
            request.periods
        )

        return ForecastResponse(
            store_id=request.store_id,
            product_id=request.product_id,
            forecast=predictions
        )
    except Exception as e:
        logger.exception("Forecast generation failed")
        raise HTTPException(status_code=500, detail="Forecast generation failed. Please try again later.")

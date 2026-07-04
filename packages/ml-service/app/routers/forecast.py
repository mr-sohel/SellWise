import logging
from fastapi import APIRouter, HTTPException
from ..models.schemas import ForecastRequest, ForecastResponse, BacktestResponse
from ..services.prophet_service import generate_forecast, backtest_forecast

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/forecast", response_model=ForecastResponse)
async def create_forecast(request: ForecastRequest):
    try:
        # Generate forecast using the prophet service with business-type-aware seasonality
        predictions = generate_forecast(
            request.history,
            request.periods,
            business_type=request.business_type,
        )

        return ForecastResponse(
            store_id=request.store_id,
            product_id=request.product_id,
            forecast=predictions
        )
    except Exception as e:
        logger.exception("Forecast generation failed")
        raise HTTPException(status_code=500, detail="Forecast generation failed. Please try again later.")

@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(request: ForecastRequest):
    try:
        metrics = backtest_forecast(
            request.history,
            business_type=request.business_type,
        )
        return BacktestResponse(
            store_id=request.store_id,
            product_id=request.product_id,
            metrics=metrics
        )
    except Exception as e:
        logger.exception("Backtest failed")
        raise HTTPException(status_code=500, detail=str(e))
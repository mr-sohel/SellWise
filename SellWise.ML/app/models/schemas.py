from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class SalesHistoryPoint(BaseModel):
    ds: date = Field(..., description="Date of the sales record")
    y: float = Field(..., description="Quantity sold or revenue on this date")

class ForecastRequest(BaseModel):
    store_id: str
    product_id: str
    history: List[SalesHistoryPoint] = Field(..., min_length=7, description="At least 7 data points needed")
    periods: int = Field(30, ge=1, le=365, description="Number of days to forecast (1-365)")
    business_type: Optional[str] = Field(None, description="Business type for seasonality tuning")

class ForecastResultPoint(BaseModel):
    ds: date
    yhat: float
    yhat_lower: float
    yhat_upper: float

class ForecastResponse(BaseModel):
    store_id: str
    product_id: str
    forecast: List[ForecastResultPoint]

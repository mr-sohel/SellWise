from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class SalesHistoryPoint(BaseModel):
    ds: date = Field(..., description="Date of the sales record")
    y: float = Field(..., description="Quantity sold or revenue on this date")

class ForecastRequest(BaseModel):
    store_id: str
    product_id: str
    history: List[SalesHistoryPoint] = Field(..., min_length=30, description="At least 30 data points needed for Prophet")
    periods: int = Field(30, description="Number of days to forecast into the future")

class ForecastResultPoint(BaseModel):
    ds: date
    yhat: float
    yhat_lower: float
    yhat_upper: float

class ForecastResponse(BaseModel):
    store_id: str
    product_id: str
    forecast: List[ForecastResultPoint]

class CustomerDataPoint(BaseModel):
    customer_id: str
    recency_days: int
    frequency_count: int
    monetary_value: float
    avg_gap_between_orders: float

class ChurnRequest(BaseModel):
    store_id: str
    customers: List[CustomerDataPoint]

class ChurnResultPoint(BaseModel):
    customer_id: str
    churn_probability: float

class ChurnResponse(BaseModel):
    store_id: str
    predictions: List[ChurnResultPoint]
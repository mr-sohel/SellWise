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

class BacktestMetrics(BaseModel):
    horizon: str
    mse: float
    rmse: float
    mae: float
    mape: float
    mdape: float
    smape: float
    coverage: float

class BacktestResponse(BaseModel):
    store_id: str
    product_id: str
    metrics: List[BacktestMetrics]

class CustomerDataPoint(BaseModel):
    customer_id: str
    recency_days: int = Field(ge=0)
    frequency_count: int = Field(ge=0)
    monetary_value: float = Field(ge=0)
    avg_gap_between_orders: float = Field(ge=0)

class LabeledCustomerDataPoint(CustomerDataPoint):
    churned: int = Field(description="1 if churned, 0 if retained")

class TrainChurnRequest(BaseModel):
    store_id: str
    customers: List[LabeledCustomerDataPoint] = Field(..., max_length=10000)

class ChurnRequest(BaseModel):
    store_id: str
    customers: List[CustomerDataPoint] = Field(..., max_length=10000)

class ChurnResultPoint(BaseModel):
    customer_id: str
    churn_probability: float

class ChurnResponse(BaseModel):
    store_id: str
    predictions: List[ChurnResultPoint]
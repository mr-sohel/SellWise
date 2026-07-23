import pandas as pd
from prophet import Prophet
from typing import List
from ..models.schemas import SalesHistoryPoint, ForecastResultPoint

def generate_forecast(
    history: List[SalesHistoryPoint],
    periods: int = 30
) -> List[ForecastResultPoint]:
    """
    Generates a demand forecast using Facebook Prophet.
    """
    if len(history) < 2:
        return []

    # Convert input to DataFrame
    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])

    # Initialize basic Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False
    )

    # Fit model
    try:
        model.fit(df)
    except Exception as e:
        # In case prophet fails to fit (e.g. not enough data points with variance)
        print(f"Prophet fitting failed: {e}")
        return []

    # Create future dataframe and predict
    future = model.make_future_dataframe(periods=periods)
    forecast_df = model.predict(future)

    # Extract only the future predictions
    future_forecast = forecast_df.tail(periods)

    # Map back to result schema
    results = []
    for _, row in future_forecast.iterrows():
        # Prophet can predict negative values, clamp to 0 for quantities
        results.append(ForecastResultPoint(
            ds=row['ds'].date(),
            yhat=max(0, float(row['yhat'])),
            yhat_lower=max(0, float(row['yhat_lower'])),
            yhat_upper=max(0, float(row['yhat_upper']))
        ))

    return results

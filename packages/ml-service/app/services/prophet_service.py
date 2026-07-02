import pandas as pd
from prophet import Prophet
from typing import List
from ..models.schemas import SalesHistoryPoint, ForecastResultPoint

def generate_forecast(history: List[SalesHistoryPoint], periods: int = 30) -> List[ForecastResultPoint]:
    """
    Generates a demand forecast using Facebook Prophet.
    """
    # Convert input to DataFrame
    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])

    # Initialize Prophet model
    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.80 # 80% confidence interval
    )

    # Add Bangladesh Holidays (builtin in Prophet)
    model.add_country_holidays(country_name='BD')

    # Fit model
    model.fit(df)

    # Create future dataframe
    future = model.make_future_dataframe(periods=periods)

    # Predict
    forecast_df = model.predict(future)

    # Extract only the future predictions
    future_forecast = forecast_df.tail(periods)

    # Map back to result schema
    results = []
    for _, row in future_forecast.iterrows():
        # Prophet can predict negative values, clamp to 0 for quantities
        yhat = max(0, float(row['yhat']))
        yhat_lower = max(0, float(row['yhat_lower']))
        yhat_upper = max(0, float(row['yhat_upper']))

        results.append(ForecastResultPoint(
            ds=row['ds'].date(),
            yhat=yhat,
            yhat_lower=yhat_lower,
            yhat_upper=yhat_upper
        ))

    return results
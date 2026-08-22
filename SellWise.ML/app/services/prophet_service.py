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

    # Convert input to DataFrame (sorted, deduplicated by date)
    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])
    df = df.groupby("ds", as_index=False)["y"].sum().sort_values("ds").reset_index(drop=True)

    # Yearly seasonality needs at least a full year of signal; fitting it on
    # shorter histories produces unidentifiable Fourier terms that ramp the
    # forecast wildly (e.g. 5 units/day input -> 45 units/day on day 30).
    # Only enable it once we actually have >= 1 year of data.
    span_days = (df["ds"].max() - df["ds"].min()).days
    has_yearly_signal = span_days >= 365

    model = Prophet(
        yearly_seasonality=has_yearly_signal,
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

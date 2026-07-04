import pandas as pd
from prophet import Prophet
from typing import List, Optional
from ..models.schemas import SalesHistoryPoint, ForecastResultPoint

# Business-type-specific seasonality configs
SEASONALITY_CONFIGS = {
    'facebook_seller': {
        'yearly_seasonality': True,
        'weekly_seasonality': True,
        'daily_seasonality': False,
        'extra_regressors': [],
        'custom_seasonalities': [
            {'name': '11_11_sale', 'period': 365.25, 'fourier_order': 3},
            {'name': '12_12_sale', 'period': 365.25, 'fourier_order': 3},
        ],
    },
    'small_shop': {
        'yearly_seasonality': True,
        'weekly_seasonality': True,
        'daily_seasonality': False,
        'extra_regressors': [],
        'custom_seasonalities': [],
    },
    'online_store': {
        'yearly_seasonality': True,
        'weekly_seasonality': True,
        'daily_seasonality': False,
        'extra_regressors': [],
        'custom_seasonalities': [],
    },
    'wholesaler': {
        'yearly_seasonality': True,
        'weekly_seasonality': True,
        'daily_seasonality': False,
        'extra_regressors': [],
        'custom_seasonalities': [],
    },
}

DEFAULT_CONFIG = {
    'yearly_seasonality': True,
    'weekly_seasonality': True,
    'daily_seasonality': False,
    'extra_regressors': [],
    'custom_seasonalities': [],
}


def generate_forecast(
    history: List[SalesHistoryPoint],
    periods: int = 30,
    business_type: Optional[str] = None,
) -> List[ForecastResultPoint]:
    """
    Generates a demand forecast using Facebook Prophet.
    Supports business-type-aware seasonality tuning.
    """
    # Convert input to DataFrame
    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])

    # Get config for business type
    config = SEASONALITY_CONFIGS.get(business_type, DEFAULT_CONFIG) if business_type else DEFAULT_CONFIG

    # Initialize Prophet model with business-type-aware settings
    model = Prophet(
        yearly_seasonality=config['yearly_seasonality'],
        weekly_seasonality=config['weekly_seasonality'],
        daily_seasonality=config['daily_seasonality'],
        interval_width=0.80,
        changepoint_prior_scale=0.05,  # Regularize to prevent overfitting
    )

    # Add Bangladesh Holidays
    model.add_country_holidays(country_name='BD')

    # Add custom seasonalities based on business type
    for custom in config.get('custom_seasonalities', []):
        model.add_seasonality(
            name=custom['name'],
            period=custom['period'],
            fourier_order=custom['fourier_order'],
        )

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

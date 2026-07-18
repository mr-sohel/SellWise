import pandas as pd
import numpy as np
from prophet import Prophet
from typing import List, Optional
from prophet.diagnostics import cross_validation, performance_metrics
from ..models.schemas import SalesHistoryPoint, ForecastResultPoint, BacktestMetrics

# Business-type-specific seasonality configs
SEASONALITY_CONFIGS = {
    'facebook_seller': {
        'yearly_seasonality': True,
        'weekly_seasonality': True,
        'daily_seasonality': False,
        'extra_regressors': [],
        # Single e-commerce sale seasonality (covers 11.11, 12.12, and similar events)
        'custom_seasonalities': [
            {'name': 'ecommerce_sale_season', 'period': 365.25, 'fourier_order': 5},
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

    For sparse data (< 90 days), uses more conservative parameters
    to avoid overfitting on limited observations.
    """
    # Convert input to DataFrame
    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])

    # Get config for business type
    config = SEASONALITY_CONFIGS.get(business_type, DEFAULT_CONFIG) if business_type else DEFAULT_CONFIG

    # Count non-zero days to assess data density
    non_zero_days = (df['y'] > 0).sum()
    total_days = len(df)
    sparsity = 1 - (non_zero_days / total_days) if total_days > 0 else 1

    # Adjust parameters based on data characteristics
    # - Sparse data: more regularization, fewer changepoints
    # - Dense data: less regularization, more changepoints
    if sparsity > 0.7:
        # Very sparse: strong regularization
        changepoint_prior = 0.01
        seasonality_prior = 10.0
    elif sparsity > 0.4:
        # Moderately sparse
        changepoint_prior = 0.03
        seasonality_prior = 5.0
    else:
        # Dense data: standard parameters
        changepoint_prior = 0.05
        seasonality_prior = 3.0

    # Initialize Prophet model
    model = Prophet(
        yearly_seasonality=config['yearly_seasonality'],
        weekly_seasonality=config['weekly_seasonality'],
        daily_seasonality=config['daily_seasonality'],
        interval_width=0.80,
        changepoint_prior_scale=changepoint_prior,
        seasonality_prior_scale=seasonality_prior,
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

        # For very sparse data, tighten confidence intervals
        # (Prophet tends to produce overly wide intervals with lots of zeros)
        if sparsity > 0.7:
            # Bring bounds closer to point estimate
            yhat_lower = yhat_lower + (yhat - yhat_lower) * 0.3
            yhat_upper = yhat_upper - (yhat_upper - yhat) * 0.3

        results.append(ForecastResultPoint(
            ds=row['ds'].date(),
            yhat=yhat,
            yhat_lower=yhat_lower,
            yhat_upper=yhat_upper
        ))

    return results

def backtest_forecast(
    history: List[SalesHistoryPoint],
    business_type: Optional[str] = None,
    initial_days: int = 60,
    horizon_days: int = 15,
    period_days: int = 15,
) -> List[BacktestMetrics]:
    """
    Evaluates the Prophet model using historical cross-validation.
    """
    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])
    
    if len(df) < initial_days + horizon_days:
        raise ValueError(f"Not enough data for backtesting. Need at least {initial_days + horizon_days} days.")

    config = SEASONALITY_CONFIGS.get(business_type, DEFAULT_CONFIG) if business_type else DEFAULT_CONFIG

    model = Prophet(
        yearly_seasonality=config['yearly_seasonality'],
        weekly_seasonality=config['weekly_seasonality'],
        daily_seasonality=config['daily_seasonality'],
    )
    
    for custom in config.get('custom_seasonalities', []):
        model.add_seasonality(
            name=custom['name'],
            period=custom['period'],
            fourier_order=custom['fourier_order'],
        )
        
    model.fit(df)
    
    # Run cross-validation
    df_cv = cross_validation(
        model, 
        initial=f'{initial_days} days', 
        period=f'{period_days} days', 
        horizon=f'{horizon_days} days'
    )
    
    # Calculate performance metrics
    df_p = performance_metrics(df_cv)
    
    metrics = []
    for _, row in df_p.iterrows():
        metrics.append(BacktestMetrics(
            horizon=str(row['horizon']),
            mse=float(row['mse']),
            rmse=float(row['rmse']),
            mae=float(row['mae']),
            mape=float(row['mape']),
            mdape=float(row['mdape']),
            smape=float(row['smape']),
            coverage=float(row['coverage'])
        ))
        
    return metrics

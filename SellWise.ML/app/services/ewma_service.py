import pandas as pd
import numpy as np
from typing import List
from datetime import timedelta
from ..models.schemas import SalesHistoryPoint, ForecastResultPoint

def generate_ewma_forecast(
    history: List[SalesHistoryPoint],
    periods: int = 30,
) -> List[ForecastResultPoint]:
    """
    Generates a demand forecast using Exponential Weighted Moving Average (EWMA).
    Used for Tier 1 (< 30 days history) or as a fallback.
    Alpha is auto-selected based on data variance.
    """
    if not history:
        return []

    df = pd.DataFrame([{"ds": point.ds, "y": point.y} for point in history])
    df = df.sort_values(by='ds')
    
    # Calculate variance to determine alpha (smoothing factor)
    # High variance -> lower alpha (more smoothing)
    # Low variance -> higher alpha (more responsive)
    variance = df['y'].var() if len(df) > 1 else 0
    mean = df['y'].mean()
    cv = np.sqrt(variance) / mean if mean > 0 else 0
    
    if cv > 1.5:
        alpha = 0.1  # High noise
    elif cv > 0.5:
        alpha = 0.3  # Moderate noise
    else:
        alpha = 0.5  # Stable
        
    # Calculate EWMA
    ewma = df['y'].ewm(alpha=alpha, adjust=False).mean().iloc[-1]
    
    # Calculate std for confidence intervals
    std = df['y'].std() if len(df) > 1 else 0
    
    # Generate future dates
    last_date = df['ds'].iloc[-1]
    
    results = []
    for i in range(1, periods + 1):
        future_date = last_date + timedelta(days=i)
        
        # Simple flat forecast for EWMA
        yhat = max(0, float(ewma))
        
        # Expanding confidence intervals over time
        uncertainty_multiplier = 1 + (i * 0.05)
        margin = std * uncertainty_multiplier
        
        yhat_lower = max(0, float(yhat - margin))
        yhat_upper = max(0, float(yhat + margin))
        
        results.append(ForecastResultPoint(
            ds=future_date,
            yhat=yhat,
            yhat_lower=yhat_lower,
            yhat_upper=yhat_upper
        ))
        
    return results

import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import os
import re
import joblib
from datetime import datetime, timedelta
from typing import List
from ..models.schemas import CustomerDataPoint, ChurnResultPoint, LabeledCustomerDataPoint

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def sanitize_store_id(store_id: str) -> str:
    # Remove any characters that are not alphanumeric or dashes to prevent path traversal
    return re.sub(r'[^a-zA-Z0-9-]', '', store_id)

def predict_churn(store_id: str, customers: List[CustomerDataPoint]) -> List[ChurnResultPoint]:
    """
    Predicts churn probability using an ensemble of heuristic + logistic regression.

    Approach:
    1. Primary: Gap-ratio based heuristic (robust, no training needed)
    2. Secondary: If sufficient data, LR model adds frequency/monetary signals
    3. Ensemble: Weighted average of heuristic + LR probabilities

    This avoids the tautological problem of training LR on its own heuristic labels.
    """
    if not customers:
        return []

    store_id = sanitize_store_id(store_id)
    df = pd.DataFrame([c.model_dump() for c in customers])

    # Feature Engineering
    df['gap_ratio'] = df['recency_days'] / (df['avg_gap_between_orders'] + 1)

    # Primary: Heuristic probability (always available, robust)
    # Sigmoid-like curve centered at gap_ratio = 2.5
    heuristic_probs = 1 / (1 + np.exp(-1.5 * (df['gap_ratio'] - 2.5)))

    # Secondary: LR model (only if we have enough diversity in the data)
    lr_probs = None
    if len(customers) >= 10:
        model_path = os.path.join(MODEL_DIR, f"lr_churn_{store_id}.joblib")
        
        # Load existing model if it exists
        model_data = None
        if os.path.exists(model_path):
            try:
                model_data = joblib.load(model_path)
            except Exception:
                pass
                
        if model_data:
            model, scaler = model_data
            try:
                features = ['recency_days', 'frequency_count', 'monetary_value', 'avg_gap_between_orders']
                X = df[features].fillna(0)
                X_scaled = scaler.transform(X)
                lr_probs = model.predict_proba(X_scaled)[:, 1]
            except Exception:
                # Ignore if prediction fails
                pass

    # Ensemble: combine heuristic + LR if available
    if lr_probs is not None:
        # Weight LR based on how much it agrees with heuristic (consistency check)
        lr_agreement = 1 - abs(heuristic_probs.values - lr_probs).mean()
        lr_weight = max(0.2, min(0.5, lr_agreement))  # LR gets 20-50% weight
        final_probs = (1 - lr_weight) * heuristic_probs.values + lr_weight * lr_probs
    else:
        final_probs = heuristic_probs.values

    results = [
        ChurnResultPoint(
            customer_id=customer_id,
            churn_probability=float(np.clip(prob, 0.0, 1.0))
        )
        for customer_id, prob in zip(df['customer_id'], final_probs)
    ]

    return results


def train_churn_model(store_id: str, customers: List[LabeledCustomerDataPoint]) -> bool:
    """
    Trains and persists a logistic regression model using explicit historical labels.
    Returns True if successful, False otherwise.
    """
    if len(customers) < 10:
        return False

    store_id = sanitize_store_id(store_id)
    df = pd.DataFrame([c.model_dump() for c in customers])
    
    # Need at least 2 classes to fit LR
    if df['churned'].nunique() <= 1:
        return False
        
    features = ['recency_days', 'frequency_count', 'monetary_value', 'avg_gap_between_orders']
    X = df[features].fillna(0)
    y = df['churned']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = LogisticRegression(class_weight='balanced', max_iter=200)
    try:
        model.fit(X_scaled, y)
        model_path = os.path.join(MODEL_DIR, f"lr_churn_{store_id}.joblib")
        joblib.dump((model, scaler), model_path)
        return True
    except Exception:
        return False

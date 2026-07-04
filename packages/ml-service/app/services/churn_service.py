import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import os
import joblib
from datetime import datetime, timedelta
from typing import List
from ..models.schemas import CustomerDataPoint, ChurnResultPoint, LabeledCustomerDataPoint

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

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
                # Fallback to refitting if loading/predicting fails
                lr_probs = _fit_lr_model(df, model_path)
        else:
            lr_probs = _fit_lr_model(df, model_path)

    # Ensemble: combine heuristic + LR if available
    if lr_probs is not None:
        # Weight LR based on how much it agrees with heuristic (consistency check)
        lr_agreement = 1 - abs(heuristic_probs.values - lr_probs).mean()
        lr_weight = max(0.2, min(0.5, lr_agreement))  # LR gets 20-50% weight
        final_probs = (1 - lr_weight) * heuristic_probs.values + lr_weight * lr_probs
    else:
        final_probs = heuristic_probs.values

    results = []
    for i, row in df.iterrows():
        results.append(ChurnResultPoint(
            customer_id=row['customer_id'],
            churn_probability=float(np.clip(final_probs[i], 0, 1))
        ))

    return results


def _fit_lr_model(df: pd.DataFrame, model_path: str) -> np.ndarray | None:
    """
    Fit a logistic regression model with synthetic labels derived from
    multiple signals (not just gap_ratio) to reduce tautological bias.

    Returns predicted probabilities or None if fitting fails.
    """
    try:
        # Create pseudo-labels using MULTIPLE features (reduces tautology)
        # A customer is "churned" if they meet 2+ of these conditions:
        #   1. gap_ratio > 3.0 (far past their usual cadence)
        #   2. recency > median recency AND frequency < median frequency
        #   3. monetary < 25th percentile (low lifetime value)
        median_recency = df['recency_days'].median()
        median_frequency = df['frequency_count'].median()
        q25_monetary = df['monetary_value'].quantile(0.25)

        conditions = (
            (df['gap_ratio'] > 3.0).astype(int) +
            ((df['recency_days'] > median_recency) & (df['frequency_count'] < median_frequency)).astype(int) +
            (df['monetary_value'] < q25_monetary).astype(int)
        )
        df['pseudo_target'] = (conditions >= 2).astype(int)

        # Need at least 2 classes to fit LR
        if df['pseudo_target'].nunique() <= 1:
            return None

        features = ['recency_days', 'frequency_count', 'monetary_value', 'avg_gap_between_orders']
        X = df[features].fillna(0)
        y = df['pseudo_target']

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = LogisticRegression(class_weight='balanced', max_iter=200)
        model.fit(X_scaled, y)

        probs = model.predict_proba(X_scaled)[:, 1]
        
        # Save model and scaler
        try:
            joblib.dump((model, scaler), model_path)
        except Exception:
            pass

        return probs

    except Exception:
        return None

def train_churn_model(store_id: str, customers: List[LabeledCustomerDataPoint]) -> bool:
    """
    Trains and persists a logistic regression model using explicit historical labels.
    Returns True if successful, False otherwise.
    """
    if len(customers) < 10:
        return False
        
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

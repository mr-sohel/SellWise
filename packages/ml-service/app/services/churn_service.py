import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from typing import List
from ..models.schemas import CustomerDataPoint, ChurnResultPoint


def predict_churn(customers: List[CustomerDataPoint]) -> List[ChurnResultPoint]:
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
        lr_probs = _fit_lr_model(df)

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


def _fit_lr_model(df: pd.DataFrame) -> np.ndarray | None:
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
        return probs

    except Exception:
        return None

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from typing import List
from ..models.schemas import CustomerDataPoint, ChurnResultPoint

def predict_churn(customers: List[CustomerDataPoint]) -> List[ChurnResultPoint]:
    """
    Predicts churn probability using a simple Logistic Regression model.
    In a real-world scenario, this model would be pre-trained and loaded via joblib/pickle.
    For this implementation, we use an unsupervised heuristic or a dynamically fit baseline.
    """
    if not customers:
        return []

    # Convert to DataFrame
    df = pd.DataFrame([c.model_dump() for c in customers])

    # Feature Engineering
    # Simple heuristic: If recency > 2 * avg_gap, high risk of churn
    df['gap_ratio'] = df['recency_days'] / (df['avg_gap_between_orders'] + 1) # Add 1 to avoid div by zero

    # Let's mock a training target based on the heuristic to fit a LR model
    # 1 = Churned, 0 = Active
    df['mock_target'] = (df['gap_ratio'] > 2.5).astype(int)

    # If all targets are the same, LR will fail. Fall back to heuristic probabilities.
    if df['mock_target'].nunique() <= 1:
        results = []
        for _, row in df.iterrows():
            prob = min(1.0, float(row['gap_ratio']) / 5.0) # Scale heuristic to 0-1
            results.append(ChurnResultPoint(
                customer_id=row['customer_id'],
                churn_probability=prob
            ))
        return results

    # Features for the model
    features = ['recency_days', 'frequency_count', 'monetary_value', 'avg_gap_between_orders']
    X = df[features]
    y = df['mock_target']

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Logistic Regression
    model = LogisticRegression(class_weight='balanced')
    model.fit(X_scaled, y)

    # Predict probabilities (Probability of class 1 / Churn)
    probs = model.predict_proba(X_scaled)[:, 1]

    results = []
    for i, row in df.iterrows():
        results.append(ChurnResultPoint(
            customer_id=row['customer_id'],
            churn_probability=float(probs[i])
        ))

    return results
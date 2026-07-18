import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_churn_endpoint():
    payload = {
        "store_id": "test_store",
        "customers": [
            {
                "customer_id": "cust_1",
                "recency_days": 10,
                "frequency_count": 5,
                "monetary_value": 500.0,
                "avg_gap_between_orders": 15.0
            },
            {
                "customer_id": "cust_2",
                "recency_days": 120, # High recency = high churn risk
                "frequency_count": 2,
                "monetary_value": 100.0,
                "avg_gap_between_orders": 30.0
            }
        ]
    }

    response = client.post("/churn", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["store_id"] == "test_store"
    assert "predictions" in data
    assert len(data["predictions"]) == 2

    # Verify predictions are between 0 and 1
    for pred in data["predictions"]:
        assert "customer_id" in pred
        assert "churn_probability" in pred
        assert 0.0 <= pred["churn_probability"] <= 1.0
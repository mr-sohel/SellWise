import pytest
from fastapi.testclient import TestClient
from app.main import app
from datetime import date, timedelta

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "up"

def test_forecast_endpoint():
    # Generate 35 days of dummy historical data
    start_date = date.today() - timedelta(days=35)
    history = [
        {
            "ds": (start_date + timedelta(days=i)).isoformat(),
            "y": 10.0 + (i % 7) # Add some weekly variation
        }
        for i in range(35)
    ]

    payload = {
        "store_id": "test_store",
        "product_id": "test_product",
        "history": history,
        "periods": 7
    }

    response = client.post("/forecast", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["store_id"] == "test_store"
    assert data["product_id"] == "test_product"
    assert "forecast" in data

    # We requested 7 periods
    assert len(data["forecast"]) == 7

    # Check shape of first prediction
    first_pred = data["forecast"][0]
    assert "ds" in first_pred
    assert "yhat" in first_pred
    assert "yhat_lower" in first_pred
    assert "yhat_upper" in first_pred
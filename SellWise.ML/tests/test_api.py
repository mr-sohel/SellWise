from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def make_history(days: int, units_per_day: float = 5.0):
    start = date(2026, 1, 1)
    return [
        {"ds": (start + timedelta(days=i)).isoformat(), "y": units_per_day + (i % 7)}
        for i in range(days)
    ]


def test_health():
    response = client.get("/api/v1/ml/health")
    assert response.status_code == 200
    assert response.json()["status"] == "up"


def test_forecast_returns_requested_number_of_future_days():
    history = make_history(90)
    response = client.post(
        "/api/v1/ml/forecast",
        json={"store_id": "s1", "product_id": "p1", "history": history, "periods": 30},
    )

    assert response.status_code == 200
    forecast = response.json()["forecast"]
    assert len(forecast) == 30
    assert forecast[0]["ds"] == (date(2026, 1, 1) + timedelta(days=90)).isoformat()
    assert all(point["yhat"] >= 0 and point["yhat_lower"] >= 0 for point in forecast)


def test_forecast_rejects_too_little_history():
    response = client.post(
        "/api/v1/ml/forecast",
        json={"store_id": "s1", "product_id": "p1", "history": make_history(3), "periods": 30},
    )
    assert response.status_code == 422


def test_forecast_rejects_out_of_range_periods():
    response = client.post(
        "/api/v1/ml/forecast",
        json={"store_id": "s1", "product_id": "p1", "history": make_history(30), "periods": 1000},
    )
    assert response.status_code == 422

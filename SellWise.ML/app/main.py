import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import health, forecast

app = FastAPI(
    title="SellWise ML Service",
    description="Machine Learning service for demand forecasting",
    version="1.0.0"
)

# CORS — restrict origins via CORS_ORIGINS env var
allowed_origins_raw = os.environ.get("CORS_ORIGINS", "http://localhost:5000,https://localhost:7288,http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

allow_credentials = os.environ.get("CORS_ALLOW_CREDENTIALS", "true").lower() in ("true", "1", "yes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health.router, prefix="/api/v1/ml", tags=["Health"])
app.include_router(forecast.router, prefix="/api/v1/ml", tags=["Forecast"])

@app.get("/")
async def root():
    return {"message": "Welcome to SellWise ML Service API"}

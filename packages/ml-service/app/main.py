import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import health, forecast, churn

app = FastAPI(
    title="SellWise ML Service",
    description="Machine Learning service for demand forecasting and churn prediction",
    version="1.0.0"
)

# CORS — in production, restrict origins via CORS_ORIGINS env var
allowed_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(forecast.router, tags=["Forecast"])
app.include_router(churn.router, tags=["Churn"])

@app.get("/")
async def root():
    return {"message": "Welcome to SellWise ML Service API"}
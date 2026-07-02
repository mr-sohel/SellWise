from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import health, forecast, churn

app = FastAPI(
    title="SellWise ML Service",
    description="Machine Learning service for demand forecasting and churn prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
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
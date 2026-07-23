# ML Architecture Explanation: SellWise.ML (Defense Guide)

This document provides a deep dive into the Machine Learning Microservice and how it integrates with the ASP.NET Core application. Use this guide during your university defense to explain the AI integration.

## 1. Microservice Architecture (Decoupling)

We did not build the ML models in C#. Machine learning is best handled by Python libraries. Therefore, we used a **Microservice Architecture**:
1.  **The Web App (C#):** Handles the UI, database, security, and constructs the historical datasets.
2.  **The ML Service (Python/FastAPI):** A standalone, lightweight web server (`SellWise.ML/app/main.py`) running on `localhost:8000` that listens for JSON payloads, runs predictions, and returns results.

*Defense Tip:* Explain that this is how modern companies (like Netflix or Uber) scale. If the ML algorithm takes 100% of the CPU, it won't slow down the website because they run on entirely different processes.

## 2. Demand Forecasting Workflow (Facebook Prophet)

The core AI feature is predicting how many units of a product will sell in the next 30 days.

*   **How it works in the code:**
    1.  **Data Gathering:** Open `AnalyticsService.cs` in the C# app. In `GetProductForecastAsync()`, the app fetches up to 90 days of past orders for a product. It pads days with zero sales using `PadHistoryWithZeros()` to ensure the dataset is contiguous.
    2.  **HTTP Request:** It calls `ForecastService.cs` (`GetForecastAsync`), which uses an `HttpClient` to `POST` the data as JSON to Python.
    3.  **Python Processing:** In the Python service (`prophet_service.py`), we use the **Facebook Prophet** algorithm. Prophet is specifically designed for time-series data. It automatically detects weekly and yearly seasonality (e.g., "sales spike on weekends").
    4.  **Display:** Python returns a 30-day array of predictions (`yhat`). C# maps this to `ProductForecastCard` and draws a Sparkline graph on the dashboard.

## 3. Caching for High Performance

Running a Machine Learning model takes time (hundreds of milliseconds). We cannot run this every time the user refreshes the dashboard.

*   **Implementation:** Look at `AnalyticsService.cs`. Before making an HTTP request to Python, it checks the database:
    ```csharp
    var allCached = await _db.Forecasts.Where(f => ... && f.CreatedAt > now.AddHours(-24))
    ```
    If a forecast was generated in the last 24 hours, the C# app uses the cached data from SQL Server, entirely skipping the Python ML service. This makes the dashboard load instantly.

## 4. High Availability & Fallback Mechanisms

A classic university defense question is: *"What happens if your Python ML server crashes? Does the whole application break?"*

*   **The Answer is NO.** We implemented a **Graceful Degradation / Fallback Mechanism**.
*   **Implementation:** Inside `AnalyticsService.cs`, the HTTP call to the ML service is wrapped in a `try/catch` block. If the Python server is offline, times out, or if the product is too new (less than 7 days of data), the system catches the exception and routes to `GetFallbackForecast()`.
*   **The Fallback:** It instantly switches to a **Simple Moving Average**. It calculates the average daily sales from the limited history we have and projects that forward. The user still gets a chart, and the app never crashes.

## 5. Churn Prediction (Customer Retention)

Alongside product forecasting, we analyze customer behavior to prevent churn (customers abandoning the store).
*   **Connection to Web App:** In the C# app (`RfmService.cs`), we calculate a customer's **Recency** (days since last order) and **Frequency** (total orders). 
*   **Logistic Regression:** By feeding these metrics into a Logistic Regression model, we can calculate the probability of churn. If a historically frequent buyer suddenly goes quiet (high recency), the algorithm flags them as "At Risk" so the store owner can intervene with a targeted discount.
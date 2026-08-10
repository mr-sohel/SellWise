# ML Architecture Explanation: SellWise.ML (Defense Guide)

This document provides a deep dive into the Machine Learning Microservice and how it integrates with the ASP.NET Core application. Use this guide during your university defense to explain the AI integration.

## 1. Microservice Architecture (Decoupling)

We did not build the ML models in C#. Machine learning is best handled by Python libraries. Therefore, we used a **Microservice Architecture**:
1. **The Web App (C#):** Handles the UI, database, security, and constructs the historical datasets.
2. **The ML Service (Python/FastAPI):** A standalone, lightweight web server (`SellWise.ML/app/main.py`) running on `localhost:8000` that listens for JSON payloads, runs predictions, and returns results.

*Defense Tip:* Explain that this is how modern companies (like Netflix or Uber) scale. If the ML algorithm takes 100% of the CPU, it won't slow down the website because they run on entirely different processes.

## 2. How Prophet Predicts Future Demand

The core AI feature is predicting how many units of a product will sell in the next 30 days using **Facebook Prophet** — an open-source forecasting tool developed by Facebook's Core Data Science team and released in 2017.

### The Problem Prophet Solved

Before Prophet, forecasting time-series meant using classical methods like **ARIMA** or **Exponential Smoothing**. These required you to manually:
- Difference the series until it's stationary (the Dickey-Fuller dance)
- Pick p, d, q parameters by staring at ACF/PACF plots
- Handle missing data and outliers by hand
- Specify seasonality periods manually

At Facebook scale (thousands of forecasts running daily for business metrics), this was impossible. They needed something **automated, robust, and interpretable** — a business analyst should be able to use it, not just PhDs.

### The Core Insight: Decomposition with Bayesian Priors

Prophet reframes forecasting as a **curve-fitting problem** with three components:

```
y(t) = g(t) + s(t) + h(t) + ε(t)
```

Each component is a simple parametric model with **Bayesian priors** — soft constraints that prevent overfitting.

---

#### Trend `g(t)` — Piecewise Linear with Automatic Change Points

Most time series have a direction. But the direction can change (a product launches, a competitor appears, seasonal shifts).

**How it works:**
- Prophet places `S` potential **change points** uniformly across the first 80% of the data
- Each change point has a `δ` (delta) — how much the trend changes at that point
- Instead of estimating `δ` with least squares, Prophet uses a **Laplace prior**: `δ ∼ Laplace(0, τ)`
- The hyperparameter `τ` (changepoint_prior_scale, default 0.05) controls flexibility:
  - `τ = 0.05` — mild trend changes (default, prevents overfitting)
  - `τ = 0.5` — very flexible, may overfit to noise
  - `τ = 0.001` — nearly linear, ignores trend changes

**The math**: The trend at time `t` is:

```
g(t) = k·t + m + Σ[δⱼ · (t − sⱼ) · 1(t ≥ sⱼ)]
```

Where `k` is the base growth rate, `sⱼ` are change point locations, and the sum adds the cumulative effect of all change points before `t`.

**Why Bayesian?** The Laplace prior pushes most `δ` values to exactly zero (sparse solution) — change points only "activate" if the data strongly supports them. This prevents the model from chasing random noise.

---

#### Seasonality `s(t)` — Fourier Series

Seasonal patterns (weekly, yearly) are modeled as a sum of sine and cosine waves:

```
s(t) = Σ[aₙ · cos(2πnt / P) + bₙ · sin(2πnt / P)]
```

Where `P` is the period (7 for weekly, 365.25 for yearly) and `n` is the number of Fourier terms:
- For yearly seasonality: `n = 10` (default) — 10 sin + 10 cos = 20 parameters
- For weekly seasonality: `n = 3` (default) — 3 sin + 3 cos = 6 parameters

In our code (`prophet_service.py:19`), we enable `yearly_seasonality=True` (holiday spikes, seasonal trends) and `weekly_seasonality=True` (weekend vs weekday patterns).

**Why Fourier?** Because real-world seasonality isn't a perfect square wave. A few Fourier terms can approximate any smooth periodic function. The low number of terms acts as a **low-pass filter** — captures the broad seasonal shape without overfitting to random weekly noise.

Each seasonality component also has a Bayesian prior: `β ∼ Normal(0, σ²)`, controlled by `seasonality_prior_scale` (default 10 — fairly unconstrained since seasonality is usually real).

---

#### Holidays/Events `h(t)`

Not used in our code (we set no custom holidays), but useful in practice. Each holiday gets an indicator variable (1 if date matches, 0 otherwise) with a prior `κ ∼ Normal(0, ν²)`. This allows Prophet to mark Black Friday, Christmas, etc. as special days that deviate from the normal seasonal pattern.

---

### The Fitting Process — STAN (Bayesian Inference)

This is the engine behind the scenes. Prophet doesn't use gradient descent or backpropagation. It uses **STAN** — a probabilistic programming language that implements **Hamiltonian Monte Carlo** (HMC) sampling.

**In simple terms, the fitting works like this:**

1. Prophet defines the model as a probabilistic graph with priors:
   - Trend parameters: `k`, `m`, `δ`s (Laplace priors)
   - Seasonality parameters: `aₙ`, `bₙ` (Normal priors)
   - Noise: `σ` (standard deviation of `ε`)

2. Each parameter has a **prior distribution** (what we believe before seeing data)

3. STAN runs HMC — think of it as a physics simulation:
   - Start at random parameter values
   - Compute how well they explain the data (the likelihood)
   - Propose new values using gradient information, biased toward higher likelihood
   - Use Hamiltonian dynamics (adding a "momentum" term) to explore efficiently and escape local optima
   - Accept or reject the proposal based on the Metropolis-Hastings criterion
   - Repeat thousands of times, collecting all accepted samples

4. The result: a **posterior distribution** for every parameter — not just "the trend is 2.5" but a whole range: "the trend is most likely 2.5, with a 90% probability of being between 2.1 and 2.9"

**For performance**, Prophet uses MAP estimation by default (`model.fit(df)` calls STAN's optimizer) — it finds the single best parameter set rather than running full MCMC sampling. Full MCMC is available but ~100x slower. MAP gives you the point estimate; MCMC gives you the uncertainty intervals.

---

### Making Predictions — The Uncertainty Interval

When we call `model.predict(future)`:

1. **Point forecast** (`yhat`): Plug the best-fit parameters into `g(t) + s(t) + h(t)` for each future date
2. **Uncertainty** (`yhat_lower`, `yhat_upper`): Given the posterior distribution of parameters and the noise `σ`, Prophet simulates **1000 possible future paths** (by default) by:
   - Drawing different parameter values from their posteriors
   - Adding random noise ∼ Normal(0, σ) at each step
   - Taking the 5th, 50th, and 95th percentiles across all simulations

This is why we can say: *"We expect to sell 15 units, but it could be as low as 10 or as high as 20."* The uncertainty widens the further out you forecast — tomorrow's prediction is tighter than day 30's.

### Negative Value Clamping

Prophet can predict negative values (the model doesn't know sales can't be negative). In `prophet_service.py:42`, we clamp all predictions with `max(0, value)` — a simple domain knowledge fix.

---

### Why Prophet Over Traditional Methods?

| Method | Handling Missing Data | Seasonality | Uncertainty Intervals | Outlier Handling | Setup Effort |
|--------|----------------------|-------------|----------------------|------------------|-------------|
| ARIMA | Poor | Manual | Complex | Poor | High |
| Exponential Smoothing | Poor | Limited | Limited | Poor | Medium |
| Deep Learning (LSTM, TFT) | Good | Automatic | Complex | Good | Very High |
| **Prophet** | **Robust** | **Automatic** | **Built-in (Bayesian)** | **Robust** | **Minimal** |

### Why It Works for Our Use Case

| Property | Why It Matters for SellWise |
|----------|----------------------------|
| **Handles missing days** | We pad with zeros, Prophet doesn't break |
| **Robust to outliers** | One massive order won't derail the trend |
| **Weekly seasonality** | Catches weekend vs weekday sales patterns |
| **Yearly seasonality** | Catches holiday season spikes |
| **Uncertainty intervals** | Store owner sees the range, not a false-precision number |
| **Low data requirement** | Works with as few as 2 data points (we require 7+) |
| **Automatic fitting** | No manual tuning per product — we forecast 6 products per dashboard load |

### The One Trade-Off

Prophet is **not** the most accurate model possible. Deep learning models (DeepAR, N-BEATS, Temporal Fusion Transformer) often beat Prophet in accuracy benchmarks.

But Prophet wins on **three practical criteria** that matter for a SaaS product:
- **Speed**: Fits in milliseconds, runs 6 forecasts per dashboard load
- **Interpretability**: You can plot trend and seasonality components separately (explainable AI)
- **Robustness**: No preprocessing, no hyperparameter tuning, works on 90% of time series out of the box

For a real-world B2B SaaS product forecasting dozens of products per store, this is the right trade-off. Perfect accuracy is useless if the system is too slow or fragile to run in production.

## 3. Demand Forecasting Workflow (End to End)

The full journey from dashboard load to displayed chart:

```
┌─────────────────────────────────────────────────────────────────┐
│  ASP.NET Core Web App (C#)         Python ML Service (FastAPI) │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Dashboard loads                                              │
│     ↓                                                            │
│  2. AnalyticsService.GetOverview()                               │
│     ↓                                                            │
│  3. Find top 6 products by quantity sold                         │
│     ↓                                                            │
│  4. Check Forecasts DB table — cached < 24h?                    │
│     ├─ Yes → Reuse (no ML call, instant load)                    │
│     └─ No  → Continue to step 5                                  │
│     ↓                                                            │
│  5. Gather 90 days of OrderItems from SQL Server                 │
│     ↓                                                            │
│  6. PadHistoryWithZeros() — fills missing days with 0            │
│     (ensures contiguous time series for Prophet)                 │
│     ↓                                                            │
│  7. Model selection:                                             │
│     ├─ ≥30 data points → use Prophet (ML, accurate)              │
│     ├─ 7–29 data points → use EWMA (simple weighted avg)         │
│     └─ <7 data points → skip to fallback                         │
│     ↓                                                            │
│  8. ForecastService.GetForecastAsync()                           │
│     └─ POST JSON to http://localhost:8000/api/v1/ml/forecast     │
│        {                                                         │
│          "store_id": "abc",                                      │
│          "product_id": "prod-123",                               │
│          "history": [{"ds":"2026-04-28","y":12}, ...],           │
│          "periods": 30                                           │
│        }                                                         │
│                          │  HTTP POST (5s timeout)               │
│                          ▼                                       │
│                     9. FastAPI validates request                 │
│                        (Pydantic: min 7 points, periods 1-365)   │
│                        ↓                                        │
│                    10. prophet_service.generate_forecast()       │
│                        └─ Convert to pandas DataFrame            │
│                        └─ Prophet(yearly=True, weekly=True)      │
│                        └─ model.fit(df) — STAN Bayesian fitting  │
│                        └─ model.make_future_dataframe(30 days)   │
│                        └─ model.predict(future)                  │
│                        └─ Extract last 30 rows (future only)     │
│                        └─ Clamp negatives to 0                   │
│                        ↓                                        │
│                    11. Returns JSON:                             │
│                        {                                         │
│                          "store_id": "...",                      │
│                          "product_id": "...",                    │
│                          "forecast": [                           │
│                            {"ds":"2026-07-28","yhat":15.3,       │
│                             "yhat_lower":10.1,"yhat_upper":20.5} │
│                          ]                                       │
│                        }                                         │
│                          │                                       │
│                          ▼                                       │
│  12. Store results in Forecasts table (cache for 24h)           │
│      ↓                                                           │
│  13. Map to ProductForecastCard with SparklineData              │
│      ↓                                                           │
│  14. Render dashboard chart: 30-day projected sales per product │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Code Files

| Layer | File | Responsibility |
|-------|------|---------------|
| C# Controller | `AnalyticsService.cs` | Orchestrates data gathering, caching, model selection, fallback |
| C# HTTP Bridge | `ForecastService.cs` | Sends HTTP request to Python, deserializes response |
| C# ViewModel | `DashboardViewModel.cs` | Carries forecast data to Razor view |
| Python Router | `routers/forecast.py` | Validates request, calls prophet service |
| Python Model | `services/prophet_service.py` | Prophet fitting + prediction logic |
| Python Schema | `models/schemas.py` | Pydantic request/response models |

## 4. Caching for High Performance

Running an ML model takes time (hundreds of milliseconds). We cannot run this every time the user refreshes the dashboard.

**Implementation:** Look at `AnalyticsService.cs:138`. Before making an HTTP request to Python, it checks the database:

```csharp
var allCached = await _db.Forecasts
    .Where(f => f.StoreId == storeId && topProductIds.Contains(f.ProductId)
                && f.CreatedAt > now.AddHours(-24))
    .ToListAsync();
```

If a forecast was generated in the last 24 hours, the C# app uses the cached data from SQL Server, entirely skipping the Python ML service. This makes the dashboard load instantly.

## 5. High Availability & Fallback Mechanisms

A classic university defense question is: *"What happens if your Python ML server crashes? Does the whole application break?"*

**The Answer is NO.** We implemented a **Graceful Degradation / Fallback Mechanism**.

**Three levels of fallback:**

| Condition | Behavior | Code Location |
|-----------|----------|---------------|
| ML service offline or timeout (>5s) | Falls back to **moving average** of recent sales | `AnalyticsService.cs` catch block → `GetFallbackForecast()` |
| Product has 7–29 days of history | Uses **EWMA** instead of Prophet (flagged in DB as `"ewma"`) | `AnalyticsService.cs:233` — `ModelUsed` field |
| Product has <7 days of history | Uses simple **average** with sinusoidal noise for visual effect | `AnalyticsService.cs` — `GetFallbackForecast()` |

The user still gets a chart, and the app never crashes.

## 6. Customer Segmentation (RFM)

Alongside product forecasting, we analyze customer behavior to help store owners understand their audience.

**What is RFM?**
- **Recency** — Days since the customer's last order (scored 1–5)
- **Frequency** — Total number of orders (scored 1–5 by percentile)
- **Monetary** — Total amount spent (scored 1–5 by percentile)

**Implementation:** The `RfmService.cs` recalculates RFM scores for all customers in a store. It uses percentile-based scoring:
- Top 10% → score 5
- Top 25% → score 4
- Top 50% → score 3
- Bottom 25% → score 2
- Bottom 10% → score 1

These scores are combined into segments:

| Segment | R | F | M | Meaning |
|---------|---|---|---|---------|
| Champion | ≥4 | ≥4 | ≥4 | Best customers — reward them |
| Loyal | ≥3 | ≥3 | ≥3 | Regulars — maintain relationship |
| At Risk | ≤2 | ≥3 | ≥3 | Used to buy, stopped — re-engage |
| Lost | ≤2 | ≤2 | ≤2 | Almost certainly gone |
| New Customer | ≥4 | ≤2 | any | Just started buying — nurture |
| Can't Lose Them | ≤2 | ≥4 | ≥4 | High value, about to leave — urgent |

*Defense Tip:* Note that we chose a **rule-based RFM model** over a trained ML model for churn. This is intentional — RFM is explainable, requires no training data, and works immediately for new stores. The churn ML endpoint (logistic regression) was experimental and removed because the heuristic approach proved more reliable for small stores with limited customer history.

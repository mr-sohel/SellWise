# 🎓 SellWise: Presentation & Defense Script (Easy English)

This guide gives you a simple, step-by-step script to present **SellWise** to your teacher. It uses clear and easy English so you can speak confidently during your project defense.

---

## ⏱️ Time Plan (10 to 15 Minutes)

| Part | Topic | Time |
| :--- | :--- | :--- |
| **Part 1** | Welcome & What Problem We Solve | 2 mins |
| **Part 2** | System Architecture (How it is built) | 2 mins |
| **Part 3** | Main Features & How They Work | 4 mins |
| **Part 4** | Live App Demo (Showing the screen) | 4 mins |
| **Part 5** | Conclusion & Answering Teacher Questions | 2 mins |

---

## Part 1: Welcome & Problem Statement (2 Mins)

### 🗣️ What to Say:
> *"Good morning / afternoon, Professor.*
>
> *Today, I am excited to present our project: **SellWise**.*
>
> *SellWise is an AI-powered sales analytics and inventory management platform designed for small and medium store owners.*
>
> *Many small shop owners face three main problems:*
> 1. **Inventory Problems:** Buying too much stock wastes money, while running out of stock means losing customers.
> 2. **Losing Customers:** Store owners do not know which customers stopped buying until it is too late.
> 3. **Manual Records:** Using spreadsheets takes time and causes mistakes.
>
> *We built **SellWise** to solve these problems in one place. It helps store owners track sales, group customers automatically, and predict future 30-day demand using AI."*

### 💻 What to Show:
* Open the **Homepage / Login Screen** of SellWise.

---

## Part 2: How SellWise is Built (Architecture) (2 Mins)

### 🗣️ What to Say:
> *"SellWise uses a **two-service design**. We separated the web application from the AI engine so the website stays fast.*
>
> *Here are the two main parts:*
> 
> *1. **The Web Application (C# & ASP.NET Core 10):** Handles daily operations like login, store selection, creating orders, and saving data in **SQL Server**.*
>
> *2. **The AI Service (Python & FastAPI):** Runs on port 8000. It uses an AI model called **Facebook Prophet** to forecast future sales.*
>
> *Because Python handles the heavy AI math in the background, our C# web application always loads pages instantly without lagging."*

### 💻 What to Show:
* Show this simple diagram:

```text
┌──────────────────────────────────────────────────────────┐
│                     User's Web Browser                   │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│          SellWise Web App (C# ASP.NET Core 10)           │
│  • Manages users, stores, orders, and expenses           │
│  • Saves data securely in SQL Server                     │
└────────────────────────────┬─────────────────────────────┘
                             │ Calls AI API
┌────────────────────────────▼─────────────────────────────┐
│             SellWise AI Service (Python FastAPI)         │
│  • Facebook Prophet Model                                │
│  • Predicts 30-day product demand                        │
└──────────────────────────────────────────────────────────┘
```

---

## Part 3: Deep-Dive into Main Features (4 Mins)

Explain **how** each key feature works inside the code.

---

### Feature 1: AI Demand Prediction (Facebook Prophet)
* **Code Location:** `SellWise.ML/app/services/prophet_service.py` & `SellWise.Web/Services/AnalyticsService.cs`

#### 🗣️ What to Say:
> *"Our main AI feature is 30-day demand prediction using **Facebook Prophet**."*

#### 💡 How it works (Easy explanation for your teacher):
1. **Smart Pattern Finding:** Prophet splits sales history into 3 parts:
   - **Sales Trend:** Is sales growing or going down over time?
   - **Weekly Habits:** Do sales jump on weekends or weekdays?
   - **Yearly Seasons:** Do sales spike during holidays?
2. **24-Hour Cache:** Running AI math takes time. So after calculating a prediction, SellWise saves (caches) the result in SQL Server for 24 hours. This makes the dashboard load instantly.
3. **Backup Plan (Fallback):** If the Python AI service goes offline, C# automatically calculates a simple Moving Average. The website never crashes.

---

### Feature 2: Safe Order Creation (ACID Transactions)
* **Code Location:** `SellWise.Web/Services/OrderService.cs` (`CreateOrderAsync`)

#### 🗣️ What to Say:
> *"When a store creates an order, two things happen at the exact same time: an order is saved, and item stock is deducted."*

#### 💡 How it works (Easy explanation for your teacher):
> *"We use **Database Transactions** (`BeginTransactionAsync()`). If a product is out of stock, or if the system crashes midway, the database **rolls back** (cancels) everything. Stock counts never get wrong or corrupted."*

---

### Feature 3: Customer Groups (RFM Analysis)
* **Code Location:** `SellWise.Web/Services/RfmService.cs`

#### 🗣️ What to Say:
> *"SellWise uses **RFM Analysis** to automatically categorize customers."*

#### 💡 How it works (Easy explanation for your teacher):
> *"RFM stands for:
> - **Recency (R):** How many days ago did the customer buy?
> - **Frequency (F):** How many total orders did they place?
> - **Monetary (M):** How much money did they spend in total?
>
> SellWise scores each customer from 1 to 5 and puts them into groups like **Champions**, **Loyal Customers**, **At Risk**, or **Lost**. Store managers can quickly send special offers to 'At Risk' customers before losing them."*

---

### Feature 4: Multi-Store Security (Multi-Tenancy)
* **Code Location:** `SellWise.Web/Controllers/BaseController.cs`

#### 🗣️ What to Say:
> *"SellWise supports multiple stores under one system, but keeps their data completely separate."*

#### 💡 How it works (Easy explanation for your teacher):
> *"When a user logs in, their store ID is stored in a secure session (`ActiveStoreId`). `BaseController` automatically filters all database queries by `StoreId`. Store A can never see Store B’s data."*

---

## Part 4: Live Application Demo (4 Mins)

Do these exact steps during your live demo.

```powershell
# Before the presentation, run this script to start everything:
.\start.ps1
```

### Step 1: Login & Store Selection
1. Open browser to `http://localhost:5000`.
2. Log in with:
   - **Email:** `admin@sellwise.com`
   - **Password:** `Admin123!`
3. **Say:** *"When we log in, ASP.NET Core Identity authenticates us and loads our specific store."*

### Step 2: Dashboard & AI Predictions
1. Point to **Revenue, Net Profit, Orders, and Low Stock Alerts**.
2. Scroll down to **AI Demand Forecast**.
3. **Say:** *"Here on the dashboard, we see our sales numbers and the AI forecast graph showing expected sales for the next 30 days."*

### Step 3: Create an Order (Watch Stock Change)
1. Go to **Orders** -> **Create New Order**.
2. Pick a customer and select 2 items of a product (check stock first, e.g., 25 units).
3. Click **Submit Order**.
4. **Say:** *"Our C# backend runs a transaction: it creates the order and deducts stock safely."*
5. Open **Products** to show stock dropped from 25 to 23.

### Step 4: Low Stock Alerts
1. Open **Alerts**.
2. **Say:** *"If stock drops below the threshold, SellWise creates an alert to remind the owner to reorder."*

### Step 5: Customer RFM Segments
1. Open **Customers**.
2. Filter by segment: Choose **At Risk** or **Champion**.
3. **Say:** *"Here we see our customers automatically grouped so shop owners can plan marketing easily."*

### Step 6: Expenses & Net Profit
1. Open **Expenses** and **Reports**.
2. **Say:** *"SellWise subtracts store expenses from sales to show true Net Profit and generates PDF reports."*

---

## Part 5: Conclusion & Teacher Questions (2 Mins)

### 🗣️ Concluding Words:
> *"In conclusion, SellWise combines ASP.NET Core for web speed, SQL Server for data safety, and Python AI for smart demand forecasting. It turns manual store keeping into smart, data-driven decisions. Thank you, Professor! I am happy to answer any questions."*

---

## 🛡️ Simple Q&A Answer Sheet (Teacher Defense Questions)

Here are simple, easy-to-remember answers for common teacher questions:

---

### ❓ Question 1: "Why did you use Python for AI instead of C# (ML.NET)?"
> **Easy Answer:**
> *"Python has the best data science tools, and Facebook Prophet is built for Python. Running Python as a separate service on port 8000 keeps our main C# website fast because the heavy AI math runs in its own process."*

---

### ❓ Question 2: "What happens if your Python AI server crashes?"
> **Easy Answer:**
> *"We built a backup plan in C#. If the Python service goes offline or takes longer than 5 seconds, C# catches the error and calculates a Moving Average fallback instead. The website keeps working and never crashes."*

---

### ❓ Question 3: "Why did you choose Facebook Prophet over Deep Learning (LSTM) or ARIMA?"
> **Easy Answer:**
> *"Prophet has 3 big advantages:
> 1. It handles missing sales days easily.
> 2. It predicts upper and lower ranges (confidence bounds).
> 3. It is very fast and works well without complex manual tuning."*

---

### ❓ Question 4: "How do you stop Store A from seeing Store B's data?"
> **Easy Answer:**
> *"When a user logs in, we save their `StoreId` in the session. `BaseController` automatically adds `.Where(p => p.StoreId == storeId)` to every database query so data is always filtered safely."*

---

### ❓ Question 5: "Why did you use Razor Views and Bootstrap instead of React or Vue?"
> **Easy Answer:**
> *"Razor Views with Bootstrap are fast, light, and easy to connect directly to our C# backend. It keeps the architecture clean and simple for deployment."*

---

### ❓ Question 6: "What happens if the power goes out right while placing an order?"
> **Easy Answer:**
> *"We use database transactions (`BeginTransactionAsync`). If anything stops midway, the database automatically cancels (rolls back) the order so stock numbers remain accurate."*

---

## 📋 Pre-Presentation Checklist

- [ ] Run `.\start.ps1` to launch SQL Server, Python AI (port 8000), and C# Web App (port 5000).
- [ ] Log in once before starting to make sure sample data is loaded.
- [ ] Open these key C# / Python files in VS Code to show if requested:
  - `SellWise.Web/Services/AnalyticsService.cs` (AI Orchestration & Fallback)
  - `SellWise.ML/app/services/prophet_service.py` (Prophet AI Code)
  - `SellWise.Web/Services/OrderService.cs` (Transaction & Stock Deduction)
  - `SellWise.Web/Services/RfmService.cs` (Customer Grouping)
  - `SellWise.Web/Controllers/BaseController.cs` (Multi-Store Security)

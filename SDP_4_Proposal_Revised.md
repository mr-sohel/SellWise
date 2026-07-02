# Bangladesh University of Business and Technology
## Department of Computer Science and Engineering
### CSE 400: Software Development IV

# PROPOSAL

**Semester:** Summer 2026
**Title:** SellWise — An AI-Powered Sales Analytics and Inventory Management System for Small Online Businesses
**Submission Date:** 16th June, 2026

**TEAM MEMBERS**
- 22235103083 — Md. Sohel Rana (51/03)
- 22235103215 — Md. Labu Miah (51/03)
- 22235103133 — Faysal Islam Fahad (51/03)
- 22235103203 — Naushin Sultana Mim (51/03)
- 22235103125 — Mst. Milhan Jannat Jerin (51/03)

**SUPERVISOR’S SIGNATURE WITH DATE**
________________________________
Humayra Ahmed
Assistant Professor
Department of CSE, BUBT

---

## 1. Introduction

In the last few years, online shopping has grown significantly. Many small business owners have started selling products online through their own websites or platforms like Shopify and Facebook Marketplace. These businesses deal with products like clothing, electronics, accessories, and household items on a daily basis.

However, most of these small sellers do not have access to expensive business tools. They manage everything manually — tracking orders in Excel sheets, estimating how much stock to buy, and having limited visibility into which products are performing well or which customers are becoming inactive. This approach works when the business is small, but as the number of orders increases, it becomes very difficult to keep up.

SellWise is a web-based system designed to address this problem. It provides small business owners with an intelligent dashboard where they can view their sales data, receive predictions about future demand, and manage their inventory properly. In essence, it serves as a virtual business analyst that helps sellers make better decisions without requiring any technical skills.

The main idea behind this project is straightforward — instead of just presenting raw numbers and charts, the system uses machine learning to tell the owner what is happening, why it is happening, and what they should do next.

## 2. Existing Model

Currently, small business owners use a number of different tools to manage their stores. Some of the common ones are discussed below.

**Shopify Analytics** — Shopify has a built-in analytics section that displays basic statistics such as total sales, number of orders, and returning customers. However, it is mostly limited to showing what has already happened. It does not offer predictive capabilities or intelligent recommendations. Additionally, a Shopify subscription is required to access these features.

**Google Analytics** — This tool is primarily used for tracking website traffic. It can show how many people visited a site and where they came from, but it does not provide insight into inventory, products, or customer purchase history. It is not designed for e-commerce management.

**Excel / Google Sheets** — This is what most small sellers rely on in practice. They manually enter orders, calculate profits, and attempt to track stock levels. While it is free and flexible, it is also very time-consuming and offers no automation or prediction capabilities. A single formula error can lead to significant inaccuracies.

**Zoho Inventory** — This is a dedicated inventory management tool, but it is designed primarily for medium to large businesses. The interface can be complex for someone who sells only a few products online, and the paid plans can become expensive.

**Inventory Planner** — This tool focuses specifically on demand forecasting and inventory planning. It performs well in this area, but it costs $249/month or more, which is not affordable for a small business owner with limited monthly revenue.

In summary, the existing tools are either too basic (such as Shopify or Google Analytics), too expensive (such as Inventory Planner), or too manual (such as Excel). There is no affordable, all-in-one solution that combines analytics, forecasting, and inventory management — and that is precisely the gap SellWise aims to fill.

## 3. Problem Statement

Small online business owners face several significant problems when it comes to managing their sales and inventory:
- **Products go out of stock without warning.** A product may be selling at a high rate, but the owner does not realize this until the stock reaches zero. By that point, sales have already been lost and customers are left dissatisfied. There is no system in place to warn them in advance.
- **Too much capital gets tied up in unsold inventory.** Conversely, owners sometimes purchase too much of a product that does not sell well. That capital remains locked in the form of unsold stock, which is particularly damaging for small businesses with limited working capital.
- **No way to predict future demand.** Most sellers have no reliable method for estimating what will sell next week or next month. They typically look at recent sales and make rough estimates. If those estimates are wrong, they either overstock or understock.
- **No understanding of customer behavior.** Sellers often do not know which customers are their most valuable buyers, which ones are likely to stop purchasing, or which ones have been inactive for an extended period. Without this information, they cannot run targeted promotions or take steps to retain customers.
- **Data exists but insights do not.** These businesses generate a considerable amount of data every order, every product sold, every customer purchase. However, that data remains in spreadsheets without being properly analyzed. The seller has data but lacks the insights needed to act on it.

These problems may seem minor individually, but together they can significantly harm a small business. SellWise aims to address all of these issues within a single platform by using data analysis and machine learning to convert raw business data into practical, useful recommendations.

## 4. Objectives

The main objectives of this project are:
- To develop a web-based application where small business owners can manage their products, orders, and inventory from a single dashboard.
- To implement a sales analytics dashboard that shows key metrics like total revenue, number of orders, top-selling products, and growth trends in an easy-to-understand visual format.
- To build a demand forecasting module using time-series analysis (Facebook Prophet) that predicts product-level sales for the next 7, 14, and 30 days.
- To create an automated inventory alert system that detects low stock and dead stock situations and provides reorder recommendations based on predicted demand.
- To develop a customer intelligence module that segments customers using RFM (Recency, Frequency, Monetary) analysis and identifies customers who are at risk of churning.
- To provide a report generation feature that creates downloadable daily, weekly, and monthly business reports.
- To design the system with a clean, user-friendly interface that doesn’t require any technical knowledge to use.

## 5. Existing System Analysis

To better understand where SellWise fits in, the following table provides a comparison of what the existing systems offer versus what the proposed system aims to deliver:

| Feature | Excel | Shopify Analytics | Google Analytics | Zoho Inventory | Inventory Planner | SellWise |
|---------|-------|-------------------|------------------|----------------|-------------------|----------|
| Product Management | Manual | Built-in | No | Yes | No | Yes |
| Order Tracking | Manual | Built-in | No | Yes | No | Yes |
| Sales Dashboard | Manual charts | Basic | Traffic only | Yes | No | Yes |
| Demand Forecasting | No | No | No | No | Yes | Yes |
| Inventory Alerts | No | Basic | No | Yes | Yes | Yes |
| Customer Segmentation | No | Basic | No | No | No | Yes |
| Cost | Free | $39+/mo | Free | $24+/mo | $249+/mo | Free |
| Target User | Anyone | Shopify sellers | Webmasters | Mid-size business | Retailers | Small business |

**Key observations from the analysis:**
- None of the existing affordable tools offer demand forecasting. The only tool that does (Inventory Planner) costs $249+/month.
- Customer segmentation and churn prediction are not available in any of these tools in a meaningful way.
- Most tools address only one or two of the identified problems. SellWise combines analytics, forecasting, inventory management, and customer intelligence in a single platform.

The primary advantage of SellWise is that it provides small businesses with access to the kind of analytics and forecasting capabilities that are typically only available to larger enterprises, but in a simpler and more affordable format.

## 6. Features

The main features of SellWise are described below:

**6.1 User Authentication**
- Sign up and login system with email and password
- Password encryption using bcrypt
- JWT-based session management for secure access
- Role-based access (Owner and Manager roles)

**6.2 Product Management**
- Add, edit, and delete products with details like name, SKU, category, cost price, selling price, and stock quantity
- Bulk import products through CSV file upload
- Set low-stock thresholds for each product

**6.3 Order Management**
- Create new orders manually by selecting products and quantities
- Import orders in bulk via CSV
- **Webhook Integration (PoC):** Basic API endpoints to automatically ingest orders from platforms like WooCommerce or Shopify in real-time
- Automatic stock deduction when an order is confirmed
- Order history with search and filter options

**6.4 Analytics Dashboard**
- Revenue overview (daily, weekly, monthly)
- Total orders count
- Average order value
- Top-selling and worst-selling products
- Revenue trend charts (line and bar charts)
- Sales breakdown by category (pie chart)
- A Business Health Score (0-100) that gives an overall picture of how the business is doing. This score will be calculated as a weighted average of key metrics such as Inventory Turnover Rate (30%), Revenue Growth Rate (40%), and Customer Retention Rate (30%)

**6.5 Demand Forecasting**
- **Dual-Layer Forecasting System:**
  - *Tier 1 (Heuristics):* For new products or sparse data (< 30 days of history), uses Simple Moving Average (SMA) to provide immediate value
  - *Tier 2 (Machine Learning):* Uses Facebook Prophet algorithm to predict future sales per product once sufficient historical data is available
- Generates forecasts for the next 7, 14, and 30 days
- Shows confidence intervals (best case and worst case)
- Visual forecast charts on the dashboard

**6.6 Inventory Alerts & Recommendations**
- Automatic low-stock warnings when a product’s stock is below the predicted demand
- Dead stock detection (products with no sales for 60+ days)
- Smart reorder quantity calculation based on predicted demand + safety buffer
- Example: “Wireless Mouse — current stock: 35, predicted demand: 120 in 30 days. Restock recommended: 100 units”

**6.7 Customer Intelligence**
- RFM Analysis that scores customers on Recency, Frequency, and Monetary value
- Automatic customer segments: Champions, Loyal, At Risk, Lost, New Customers
- Churn risk prediction using a logistic regression model
- Customers with high churn probability are flagged so the owner can take action

**6.8 Report Generation**
- Daily, weekly, and monthly reports summarizing business performance
- Reports include revenue, orders, top products, inventory status, and customer insights
- Downloadable as PDF files

## 7. Feasibility Study

Before starting development, it is important to evaluate whether this project is feasible from different perspectives.

**7.1 Technical Feasibility**
The technology needed to build SellWise is well-established and freely available:
- **Frontend**: React.js with Vite — a popular and well-documented JavaScript framework for building modern web interfaces
- **Main Backend API**: Node.js with Express.js — a lightweight and widely-used framework for building REST APIs
- **ML Microservice**: A separate lightweight Python service (using FastAPI or Flask) dedicated exclusively to ML tasks (forecasting and churn prediction). The Node.js API will communicate with this microservice via HTTP requests
- **Database**: PostgreSQL — a powerful open-source relational database that can handle the data we need. The database will be designed with a **multi-tenant architecture** (using `tenant_id` foreign keys) to ensure complete data isolation between different business users
- **ML/Forecasting**: Python with Facebook Prophet and scikit-learn — both are open-source and well-documented with lots of tutorials and community support
- **Charts**: Recharts or Chart.js — open-source charting libraries for React

All of these technologies have large communities and extensive documentation, so if any issues arise during development, there are sufficient resources available. The team has prior experience with React, Node.js, and Python from university coursework, so the learning curve should be manageable.
*Verdict: Technically feasible.*

**7.2 Economic Feasibility**
Since this is a university project, the budget is effectively zero. Fortunately, almost all of the required tools and technologies are available free of charge:

| Resource | Cost |
|----------|------|
| React, Node.js, Express | Free (open source) |
| PostgreSQL | Free (open source) |
| Python, FastAPI, Prophet, scikit-learn | Free (open source) |
| GitHub | Free for students |
| Deployment (VPS like DigitalOcean) | Covered by GitHub Student Developer Pack credits |
| VS Code | Free |

Using the GitHub Student Developer Pack will provide enough cloud credits to host a basic Virtual Private Server (VPS). This is crucial because Python data science libraries are memory-heavy and typically exceed the limits of serverless free tiers (like Render or Vercel). There are no external API costs required for the core forecasting and analytics features.
*Verdict: Economically feasible.*

**7.3 Operational Feasibility**
The target users of SellWise are small business owners who may not have strong technical backgrounds. Therefore, the system needs to be simple and intuitive. The following design decisions support this:
- The interface will be clean and visual, avoiding complicated menus or technical jargon.
- The dashboard will present key information at a glance through cards, charts, and color-coded alerts.
- CSV import functionality ensures that sellers do not need to manually enter every individual order.
- Alerts and recommendations are proactive — the system notifies the user about what needs attention rather than waiting for them to discover issues on their own.

The system is designed to minimize complexity, making it accessible to users with basic computer literacy.
*Verdict: Operationally feasible.*

**7.4 Schedule Feasibility**
The estimated development timeline is around 10 weeks, which fits within a single-semester final year project schedule:

| Phase | Duration | What Gets Done |
|-------|----------|----------------|
| Phase 1: Planning & Design | 1 week | Requirements gathering, system design, database schema, wireframes |
| Phase 2: Core Development | 4 weeks | Authentication, product management, order management, analytics dashboard |
| Phase 3: AI & ML Features | 4 weeks | Demand forecasting, customer segmentation, churn prediction |
| Phase 4: Testing & Polish | 1 week | Bug fixes, testing, PDF reports, deployment, documentation |

This timeline gives us enough buffer for unexpected issues and revision cycles.
*Verdict: Schedule feasible.*

## 8. Conclusion

SellWise is a web-based platform designed to help small online business owners manage their sales, inventory, and customer relationships more effectively. Instead of relying on spreadsheets and guesswork, sellers will be able to use an intelligent dashboard that not only shows them what is happening in their business but also predicts what will happen next.

The project combines several areas of computer science including web development, database design, and machine learning — making it a well-rounded final year project that demonstrates both technical proficiency and practical problem-solving ability.

Through the feasibility study, it has been confirmed that the project is technically possible with freely available tools, economically viable with minimal budget, operationally practical for non-technical users, and achievable within the available timeline.

The system addresses a real gap in the market where existing solutions are either too expensive, too basic, or too complicated for small business owners who simply need to know: “What is selling, what is running out, who are my best customers, and what should I do next?”
SellWise has the potential to help small businesses make more informed decisions and achieve sustainable growth.

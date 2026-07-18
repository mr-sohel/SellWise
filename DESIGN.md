# SellWise UI Design System

## Overview
SellWise utilizes a clean, professional, and standard enterprise UI design. By migrating to **ASP.NET Core MVC** and **Bootstrap 5**, the application sheds complex CSS-in-JS frameworks in favor of a highly readable, widely understood styling system.

This approach was chosen specifically for the university defense to demonstrate an understanding of classic web development patterns without sacrificing aesthetic quality.

## Layout & Architecture

The application uses a standard dashboard layout defined in `Views/Shared/_Layout.cshtml`:

1. **Sidebar Navigation:** A persistent left-hand sidebar with inline SVG icons (Lucide-style) for Dashboard, Products, Orders, Customers, Expenses, Reports, and Alerts. The active route is highlighted.
2. **Top Bar:** Houses a search widget and a user profile dropdown (with My Profile, Settings, and Logout links).
3. **Main Content Area:** A spacious central container where the main Razor Views are rendered.
4. **Footer:** Copyright notice and links (Help & Support, FAQ, Privacy, Terms).

### Auth Layout
Login and Signup pages use a separate layout (`_AuthLayout.cshtml`) with a centered card design.

## UI Components (Bootstrap 5)

We rely on native Bootstrap 5 classes to build responsive, robust components:

- **Cards (`.card.shadow-sm.border-0`):** Used extensively to group information. The subtle shadow and removed border create a modern "floating" aesthetic.
- **Tables (`.table.table-hover`):** Used for listing Products, Orders, and Customers. The hover effect provides immediate user feedback.
- **Buttons (`.btn.btn-primary`):** Standardized, easily tappable buttons for all primary actions.
- **Forms (`.form-control`, `.form-select`):** Clean, standard input fields with built-in ASP.NET validation styling (`.text-danger` for validation summary messages).
- **Badges (`.badge`):** Used for status indicators (order status, stock levels, employee roles).
- **Pagination:** Server-side pagination for large data tables.
- **Alerts (`.alert`):** Success/error feedback messages after actions.

## Data Visualization

- **Chart.js:** Used on the Dashboard (`Views/Dashboard/Index.cshtml`) to render Revenue Trends, AI Demand Forecasts, Category Sales, and Product Sparklines. The C# `AnalyticsService` fetches real predictions from the Python ML service, caches them in the `Forecasts` table, and passes the data to the view for Chart.js rendering.

## Pages

| Page | Controller | Description |
|------|-----------|-------------|
| Dashboard | `DashboardController` | KPI cards, revenue chart, AI demand forecast, top products, category breakdown, low stock alerts |
| Products | `ProductController` | Product CRUD, search, low stock filtering |
| Orders | `OrderController` | Order list, create new order (POS), status management |
| Customers | `CustomerController` | Customer list, recalculate totals |
| Expenses | `ExpenseController` | Expense tracking by category |
| Reports | `ReportController` | Revenue/expense reports with date range picker |
| Alerts | `AlertController` | Inventory alerts (low stock), scan for new alerts |
| Settings | `SettingsController` | Profile (email, store name, language), password change, staff management (invite/remove employees) |
| Auth | `AuthController` | Login, Signup, Logout |

## CSS

All custom styles live in `wwwroot/css/site.css` (~400 lines). The layout-scoped CSS file (`_Layout.cshtml.css`) is intentionally empty to avoid conflicting default styles.

## Philosophy

The design philosophy for SellWise is **"Function over Flash"**.
By utilizing standard Bootstrap utility classes and Razor partial views, the frontend codebase remains incredibly small, easy to read, and lightning-fast to render on the server.

# SellWise UI Design System

## Overview
SellWise utilizes a clean, professional, and standard enterprise UI design. By migrating to **ASP.NET Core MVC** and **Bootstrap 5**, the application sheds complex CSS-in-JS frameworks in favor of a highly readable, widely understood styling system.

This approach was chosen specifically for the university defense to demonstrate an understanding of classic web development patterns without sacrificing aesthetic quality.

## Layout & Architecture

The application uses a standard dashboard layout defined in `Views/Shared/_Layout.cshtml`:

1. **Sidebar Navigation:** A persistent left-hand sidebar allows quick switching between Dashboard, POS/Orders, Inventory, Customers, and Expenses.
2. **Top Bar:** Houses the active Store context and User Profile/Logout controls.
3. **Main Content Area:** A spacious central container where the main Razor Views are rendered.

## UI Components (Bootstrap 5)

We rely on native Bootstrap 5 classes to build responsive, robust components:

- **Cards (`.card.shadow-sm.border-0`):** Used extensively to group information. The subtle shadow and removed border create a modern "floating" aesthetic.
- **Tables (`.table.table-hover`):** Used for listing Products, Orders, and Customers. The hover effect provides immediate user feedback.
- **Buttons (`.btn.btn-primary`):** Standardized, easily tappable buttons for all primary actions.
- **Forms (`.form-control`, `.form-select`):** Clean, standard input fields with built-in ASP.NET validation styling (`.text-danger` for validation summary messages).

## Data Visualization

- **Chart.js:** Used on the Dashboard (`Views/Dashboard/Index.cshtml`) to render the Revenue Trends and AI Forecasts. The C# `AnalyticsService` generates the JSON data, which is parsed by a small script in the view to render beautiful, interactive charts.

## Philosophy

The design philosophy for SellWise is **"Function over Flash"**. 
By utilizing standard Bootstrap utility classes and Razor partial views, the frontend codebase remains incredibly small, easy to read, and lightning-fast to render on the server.

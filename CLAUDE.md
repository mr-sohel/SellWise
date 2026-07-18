# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) or other AI agents when working with code in this repository.

## SellWise
AI Sales Analytics & Inventory SaaS. 

The project is an **ASP.NET Core 8/10 MVC** application with a standalone **Python FastAPI** microservice.

## Project Structure
- `SellWise.sln`: The master solution file.
- `SellWise.Web/`: The ASP.NET Core MVC application.
- `SellWise.ML/`: The Python ML forecasting service.
- `start.sh`: The master startup script.

## Commands
- **Start Everything:** `./start.sh`
- **Build C# App:** `cd SellWise.Web && dotnet build`
- **Run C# App Manually:** `cd SellWise.Web && dotnet run`
- **Run Database Migrations:** `cd SellWise.Web && dotnet ef migrations add <Name>` and `dotnet ef database update`

## Architecture & Rules
- **C# Framework:** ASP.NET Core MVC.
- **Database:** Entity Framework (EF) Core with SQL Server.
- **Views:** Razor Views (`.cshtml`) styled with Bootstrap 5.
- **Data Passing:** Always use strictly typed `ViewModels` (e.g., `ProductFormViewModel`) when passing data from Controllers to Views, especially for forms.
- **Transactions:** Complex operations (like creating an Order and deducting stock) MUST use EF Core transactions (`Db.Database.BeginTransactionAsync()`).
- **Python Integration:** The C# app communicates with the Python ML service via `HttpClient`. The Python service runs on port `8000`.

## Design Pattern
- Keep Controllers thin. 
- Do not introduce complex front-end frameworks (like React or Vue) into the `SellWise.Web` project. Stick to vanilla JavaScript and Bootstrap 5 inside the Razor views to maintain the simplicity required for the university defense.
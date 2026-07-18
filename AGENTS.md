# AGENTS.md

SellWise: AI Sales Analytics & Inventory SaaS. 

The project has been migrated to **ASP.NET Core MVC** for simplicity and readability for university defense.

## Architecture

| Component | Path | Stack |
|-----------|------|-------|
| Web App | `SellWise.Web/` | ASP.NET Core 8/10 MVC, Entity Framework Core, SQL Server, Razor Views |
| ML Service | `SellWise.ML/` | Python, FastAPI, Prophet, scikit-learn |

## Getting Started (Defense Mode)

To run the entire project with a single command (starts SQL Server Docker, runs ML service, runs EF migrations, and boots ASP.NET app):

```bash
./start.sh
```

**URL**: `http://localhost:5000`

## ASP.NET Core Architecture

The monolithic Node.js/React architecture has been replaced with a classic MVC pattern:
- **Models**: Simple C# POCOs in `SellWise.Web/Models`.
- **Database**: Entity Framework Core with SQL Server (`AppDbContext`).
- **Auth**: ASP.NET Core Identity (replaces JWT/cookies).
- **Controllers**: Thin controllers handling routing and minimal logic. 
- **Views**: Razor Views styled with Bootstrap 5.

## ML Service Integration

The Python FastAPI service remains untouched in `SellWise.ML/` running on port `8000`. 
The ASP.NET backend communicates with it natively via `HttpClient` in `ForecastService.cs`.

## Commands

```bash
# Full automated run
./start.sh

# Individual ASP.NET run
cd SellWise.Web
dotnet run

# Individual ML service run
cd SellWise.ML
uv run uvicorn app.main:app --port 8000 --reload
```

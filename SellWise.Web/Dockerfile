# ── Build ────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY SellWise.Web.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Folder for the Data Protection key ring (mounted as a volume in docker-compose).
RUN mkdir -p /keys && chown $APP_UID /keys

# Run as the image's built-in non-root user.
USER $APP_UID

EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Hosting platforms like Railway inject $PORT; default to 8080.
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet SellWise.Web.dll"]

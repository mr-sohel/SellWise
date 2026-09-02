FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Prophet and psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app

USER appuser

ENV PYTHONPATH=/app
ENV MPLCONFIGDIR=/tmp/matplotlib

EXPOSE 8000

# Railway injects $PORT at runtime; fall back to 8000 locally
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
# Multi-stage build for Django + React Application

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Backend with embedded frontend
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update -o Acquire::Retries=3 \
    && apt-get install -y --fix-missing -o Acquire::Retries=3 \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project files
COPY . .

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

# Create staticfiles directory
RUN mkdir -p /app/staticfiles /app/media

# Expose port
EXPOSE 8000

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Waiting for postgres at $DB_HOST:$DB_PORT..."\n\
TIMEOUT=60\n\
while ! nc -z -w 2 $DB_HOST $DB_PORT; do\n\
  TIMEOUT=$((TIMEOUT-1))\n\
  if [ $TIMEOUT -le 0 ]; then\n\
    echo "ERROR: PostgreSQL unreachable at $DB_HOST:$DB_PORT after 60s"\n\
    exit 1\n\
  fi\n\
  sleep 1\n\
done\n\
echo "PostgreSQL started"\n\
\n\
echo "Running migrations..."\n\
python manage.py migrate --noinput\n\
\n\
echo "Seeding default admin user..."\n\
python manage.py seed_admin\n\
\n\
echo "Collecting static files..."\n\
python manage.py collectstatic --noinput --clear || true\n\
\n\
echo "Starting server..."\n\
exec python manage.py runserver 0.0.0.0:8000\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Run entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

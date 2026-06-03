# Hafif similarity servisi (numpy tabanli; agir ML bagimliligi yok)
FROM python:3.12-slim

# Daha hizli/temiz pip ciktilari icin ortam degiskenleri
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Once bagimliliklar (katman onbellegi icin)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodu
COPY app ./app

EXPOSE 8200

# Servisi baslat
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8200"]

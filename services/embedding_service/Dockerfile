FROM python:3.12-slim

# HuggingFace/FlagEmbedding model onbellegi (model ilk istekte buraya iner).
ENV HF_HOME=/models \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Bazi ML kutuphaneleri icin temel sistem paketleri.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# Once bagimliliklar (katman onbellegi icin).
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Uygulama kodu.
COPY app ./app

EXPOSE 8100

# Model lazy yuklenir; konteyner acilisinda inmez, ilk embedding isteginde iner.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]

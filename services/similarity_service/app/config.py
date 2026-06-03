"""Similarity Service yapilandirmasi.

Tum ayarlar ortam degiskenleri (env) veya .env dosyasindan okunur.
Varsayilanlar bagimsiz (DB'siz) calismaya gore secilmistir.
"""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Servis ayarlari (pydantic-settings ile env'den yuklenir)."""

    # --- Skorlama ---
    # Hangi yontemle tek skora indirilecegi: coverage | maxsim | topk
    SCORING_METHOD: str = "coverage"
    # coverage yonteminde bir hedef chunk'in "eslesmis" sayilmasi icin esik (0..1)
    SIM_THRESHOLD: float = 0.85
    # topk yonteminde ortalamasi alinacak en yuksek benzerlik sayisi
    TOP_K: int = 10

    # --- Kapsam (sadece DB/postgres modunda anlamli) ---
    # Adaylarin hangi kumeden secilecegi: all | same_report | same_term_lesson
    SCOPE: str = "same_report"

    # --- Hibrit (dense + opsiyonel sparse) agirliklari ---
    # Sparse kapaliyken SPARSE_WEIGHT=0.0 birakin; dense skor tek basina kullanilir.
    HYBRID_DENSE_WEIGHT: float = 1.0
    HYBRID_SPARSE_WEIGHT: float = 0.0

    # --- Depolama (DB) ---
    # null  -> hic DB baglantisi kurulmaz; servis sadece request body ile calisir
    # postgres -> psycopg + pgvector ile DB'den okur/yazar
    STORAGE_BACKEND: str = "null"
    # postgres modunda kullanilacak baglanti dizesi (DSN)
    DATABASE_DSN: str = ""

    # --- Sunucu ---
    SERVICE_PORT: int = 8200

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


def get_settings() -> Settings:
    """Ayar nesnesini olusturup dondurur (basit fabrika)."""
    return Settings()

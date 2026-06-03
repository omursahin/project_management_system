"""Servis yapilandirmasi.

Tum ayarlar ortam degiskenleri (env) ile gecersiz kilinabilir.
pydantic-settings v2 kullanir; degerler tip donusumu ve dogrulamadan gecer.
"""

from __future__ import annotations

from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Embedding servisinin tum ayar bayraklari (knob).

    Ortam degiskeni adlari alan adlari ile aynidir (buyuk/kucuk harf
    duyarsiz). Ornegin ``MODEL_NAME`` -> ``model_name``.
    """

    # --- Model ---
    model_name: str = "BAAI/bge-m3"  # Kullanilacak embedding modeli
    device: str = "cpu"  # "cpu" veya "cuda"
    use_fp16: bool = False  # GPU'da yari hassasiyet (CPU'da kapali tutun)
    batch_size: int = 12  # Tek seferde model'e verilen metin sayisi

    # --- Chunking ---
    chunk_size: int = 512  # Hedef chunk token butcesi
    chunk_overlap: int = 64  # Ardisik chunk'lar arasi token ortusmesi
    chunk_strategy: Literal["paragraph", "fixed"] = "paragraph"

    # --- Embedding davranisi ---
    use_sparse: bool = False  # Sparse (lexical) agirliklari da uret
    normalize: bool = True  # Dense vektorleri L2-normalize et

    # --- Token sayimi ---
    # "hf": AutoTokenizer ile gercek token sayimi (lazy indirilir).
    # "heuristic": token ~= kelime*1.3 yaklasimi (cevrimdisi calisir).
    # hf yuklenemezse otomatik olarak heuristic'e duser.
    tokenizer_mode: Literal["hf", "heuristic"] = "hf"

    # --- Depolama ---
    # "null": HIC DB baglantisi kurulmaz, servis bagimsiz calisir.
    # "postgres": pgvector tablosuna yazar (DATABASE_DSN gerekli).
    storage_backend: Literal["null", "postgres"] = "null"
    database_dsn: str = ""  # Ornek: postgresql://user:pass@host:5432/db

    # --- Servis ---
    service_port: int = 8100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        # "model_" ile baslayan alanlar pydantic'in korumali ad uzayina
        # girmesin diye uyarilari susturuyoruz.
        protected_namespaces=(),
    )


# Modul seviyesinde tekil ayar nesnesi.
settings = Settings()

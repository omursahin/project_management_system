"""Depolama katmani fabrikasi.

STORAGE_BACKEND degerine gore uygun store ornegini dondurur. Varsayilan
"null" oldugu icin import sirasinda HIC DB baglantisi kurulmaz.
"""
from __future__ import annotations

from ..config import Settings
from .base import BaseStore


def get_store(settings: Settings) -> BaseStore:
    """Ayara gore store secimi (null | postgres)."""
    backend = (settings.STORAGE_BACKEND or "null").lower().strip()
    if backend == "null":
        from .null_store import NullStore

        return NullStore()
    if backend == "postgres":
        # psycopg importu store icinde tembel yapilir; burada baglanti kurulmaz.
        from .postgres_store import PostgresStore

        return PostgresStore(settings)
    raise ValueError(f"Gecersiz STORAGE_BACKEND: {settings.STORAGE_BACKEND}")

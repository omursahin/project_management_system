"""PostgreSQL + pgvector depolama arka ucu (HAZIR ama varsayilanda PASIF).

Bu modul import edildiginde DB'ye baglanmaz; psycopg importu ve baglanti
yalnizca ``save_chunks`` cagrildiginda yapilir. Boylece STORAGE_BACKEND="null"
iken bu dosyanin varligi servisi etkilemez.

Beklenen tablo (bkz. README'deki SQL):

    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE report_chunk_embedding (
        id            BIGSERIAL PRIMARY KEY,
        project_report_id INTEGER NOT NULL,
        chunk_index   INTEGER NOT NULL,
        text          TEXT NOT NULL,
        token_count   INTEGER NOT NULL,
        embedding     vector(1024) NOT NULL,
        sparse        JSONB NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
"""

from __future__ import annotations

import json
import logging

from .base import Store

logger = logging.getLogger("embedding_service.storage.postgres")


class PostgresStore(Store):
    """pgvector tablosuna chunk embedding'leri yazan idempotent arka uc."""

    def __init__(self, dsn: str) -> None:
        if not dsn:
            raise ValueError("PostgresStore icin DATABASE_DSN bos olamaz.")
        self._dsn = dsn

    def _vector_literal(self, embedding: list[float]) -> str:
        """Python float listesini pgvector metin literaline cevirir."""
        return "[" + ",".join(repr(float(x)) for x in embedding) + "]"

    def save_chunks(self, project_report_id: int, chunks: list[dict]) -> int:
        """Ayni project_report_id kayitlarini silip yeniden yazar (idempotent).

        Donus: yazilan satir sayisi.
        """
        # psycopg importu fonksiyon icinde: modul import edilince DB gerekmesin.
        import psycopg

        if not chunks:
            # Yine de eski kayitlari temizleyelim (idempotent davranis).
            with psycopg.connect(self._dsn) as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "DELETE FROM report_chunk_embedding WHERE project_report_id = %s",
                        (project_report_id,),
                    )
                conn.commit()
            return 0

        written = 0
        with psycopg.connect(self._dsn) as conn:
            with conn.cursor() as cur:
                # Idempotent: bu rapora ait onceki chunk'lari sil.
                cur.execute(
                    "DELETE FROM report_chunk_embedding WHERE project_report_id = %s",
                    (project_report_id,),
                )
                insert_sql = (
                    "INSERT INTO report_chunk_embedding "
                    "(project_report_id, chunk_index, text, token_count, embedding, sparse) "
                    "VALUES (%s, %s, %s, %s, %s::vector, %s::jsonb)"
                )
                for ch in chunks:
                    sparse = ch.get("sparse")
                    sparse_json = json.dumps(sparse) if sparse is not None else None
                    cur.execute(
                        insert_sql,
                        (
                            project_report_id,
                            ch["index"],
                            ch["text"],
                            ch["token_count"],
                            self._vector_literal(ch["embedding"]),
                            sparse_json,
                        ),
                    )
                    written += 1
            conn.commit()

        logger.info(
            "PostgresStore: %d chunk yazildi (project_report_id=%s).",
            written,
            project_report_id,
        )
        return written

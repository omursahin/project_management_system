"""Postgres + pgvector store (HAZIR ama VARSAYILANDA PASIF).

STORAGE_BACKEND=postgres olmadan bu sinif hic ornek edilmez. psycopg importu
fonksiyon ICINDE yapilir; boylece null modda paket yuklu olmasa bile servis
sorunsuz baslar.

Beklenen sema (ileriye donuk):
  report_chunk_embedding(
    id, project_report_id, chunk_index, chunk_text, token_count,
    embedding vector(1024), term_lesson_id
  )
  project_report(id, plagiarism_rate, most_similar_project_report_id)
  similarity_match(
    id, project_report_id, candidate_project_report_id,
    target_index, candidate_index, similarity
  )
"""
from __future__ import annotations

from typing import Any

from ..config import Settings
from .base import BaseStore


class PostgresStore(BaseStore):
    """pgvector tabanli okuma/yazma. Tum baglanti islemleri tembeldir."""

    def __init__(self, settings: Settings) -> None:
        self._dsn = settings.DATABASE_DSN
        if not self._dsn:
            raise ValueError(
                "STORAGE_BACKEND=postgres icin DATABASE_DSN bos olamaz."
            )

    # --- ic yardimcilar ---------------------------------------------------

    def _connect(self):
        """psycopg baglantisi acar (import fonksiyon icinde, tembel)."""
        import psycopg  # noqa: PLC0415  (tembel import: null modda gerekmez)

        return psycopg.connect(self._dsn)

    @staticmethod
    def _row_to_chunk(row: tuple[Any, ...]) -> dict:
        """(chunk_index, chunk_text, embedding) -> chunk dict."""
        index, text, embedding = row
        # pgvector degeri psycopg'de string olabilir; list'e cevrilmesi
        # uygulama tarafinda (register_vector) ya da burada yapilabilir.
        if isinstance(embedding, str):
            embedding = [float(x) for x in embedding.strip("[]").split(",") if x]
        return {
            "index": int(index),
            "embedding": list(embedding),
            "text": text,
            "sparse": None,
        }

    # --- okuma -------------------------------------------------------------

    def read_target_chunks(self, project_report_id: int) -> list[dict]:
        """Hedef raporun tum chunk embedding'lerini sirayla okur."""
        sql = (
            "SELECT chunk_index, chunk_text, embedding "
            "FROM report_chunk_embedding "
            "WHERE project_report_id = %s "
            "ORDER BY chunk_index"
        )
        with self._connect() as conn, conn.cursor() as cur:
            cur.execute(sql, (project_report_id,))
            return [self._row_to_chunk(r) for r in cur.fetchall()]

    def read_candidate_chunks(self, scope: str, exclude_id: int) -> list[dict]:
        """Kapsama gore aday raporlari ve chunk'larini okur (hedef haric).

        scope:
          all              -> tum raporlar
          same_report      -> hedefle ayni report_id'ye sahip raporlar
          same_term_lesson -> hedefle ayni term_lesson'a sahip raporlar
        """
        scope = (scope or "same_report").lower().strip()

        # Hedefin report_id / term_lesson_id bilgisini cek (filtre icin)
        meta_sql = (
            "SELECT pr.report_id, rce.term_lesson_id "
            "FROM project_report pr "
            "LEFT JOIN report_chunk_embedding rce "
            "  ON rce.project_report_id = pr.id "
            "WHERE pr.id = %s LIMIT 1"
        )

        base = (
            "SELECT rce.project_report_id, rce.chunk_index, rce.chunk_text, rce.embedding "
            "FROM report_chunk_embedding rce "
        )

        with self._connect() as conn, conn.cursor() as cur:
            cur.execute(meta_sql, (exclude_id,))
            meta = cur.fetchone()
            target_report_id = meta[0] if meta else None
            target_term_lesson = meta[1] if meta else None

            params: list[Any] = [exclude_id]
            if scope == "all":
                where = "WHERE rce.project_report_id <> %s "
            elif scope == "same_term_lesson":
                where = (
                    "WHERE rce.project_report_id <> %s "
                    "AND rce.term_lesson_id = %s "
                )
                params.append(target_term_lesson)
            else:  # same_report (varsayilan)
                where = (
                    "WHERE rce.project_report_id <> %s "
                    "AND rce.project_report_id IN "
                    "  (SELECT id FROM project_report WHERE report_id = %s) "
                )
                params.append(target_report_id)

            order = "ORDER BY rce.project_report_id, rce.chunk_index"
            cur.execute(base + where + order, tuple(params))
            rows = cur.fetchall()

        # project_report_id bazinda grupla
        grouped: dict[int, list[dict]] = {}
        for prid, index, text, embedding in rows:
            grouped.setdefault(int(prid), []).append(
                self._row_to_chunk((index, text, embedding))
            )
        return [
            {"project_report_id": prid, "chunks": chunks}
            for prid, chunks in grouped.items()
        ]

    # --- yazma -------------------------------------------------------------

    def write_result(
        self,
        project_report_id: int,
        plagiarism_rate: float,
        most_similar_id: int | None,
        matches: list[dict],
    ) -> None:
        """Intihal oranini gunceller ve eslesme satirlarini yeniden yazar."""
        with self._connect() as conn, conn.cursor() as cur:
            # ProjectReport.plagiarism_rate (+ varsa most_similar) guncelle
            cur.execute(
                "UPDATE project_report "
                "SET plagiarism_rate = %s, "
                "    most_similar_project_report_id = %s "
                "WHERE id = %s",
                (plagiarism_rate, most_similar_id, project_report_id),
            )

            # Eski eslesmeleri temizle, yenilerini ekle (idempotent)
            cur.execute(
                "DELETE FROM similarity_match WHERE project_report_id = %s",
                (project_report_id,),
            )
            if matches:
                cur.executemany(
                    "INSERT INTO similarity_match "
                    "(project_report_id, candidate_project_report_id, "
                    " target_index, candidate_index, similarity) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    [
                        (
                            project_report_id,
                            m["candidate_project_report_id"],
                            m["target_index"],
                            m["candidate_index"],
                            m["similarity"],
                        )
                        for m in matches
                    ],
                )
            conn.commit()

"""VARSAYILAN store: DB pasif.

Bu store hicbir baglanti kurmaz. read/write cagrilirsa anlamli bir hata
firlatir; cunku null modda servis SADECE request body'deki verilerle calisir.
"""
from __future__ import annotations

from .base import BaseStore

_MSG = (
    "DB pasif: STORAGE_BACKEND=postgres yapin veya istegi "
    "target_chunks+candidates ile gonderin"
)


class NullStore(BaseStore):
    """DB'siz mod; tum DB cagrilarini reddeder."""

    def read_target_chunks(self, project_report_id: int) -> list[dict]:
        raise RuntimeError(_MSG)

    def read_candidate_chunks(self, scope: str, exclude_id: int) -> list[dict]:
        raise RuntimeError(_MSG)

    def write_result(
        self,
        project_report_id: int,
        plagiarism_rate: float,
        most_similar_id: int | None,
        matches: list[dict],
    ) -> None:
        raise RuntimeError(_MSG)

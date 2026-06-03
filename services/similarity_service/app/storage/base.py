"""Depolama soyut arayuzu.

Tum store'lar bu sozlesmeyi uygular. read_* fonksiyonlari chunk JSON
sozlesmesine uygun dict'ler dondurur; write_result sonucu kalici hale getirir.
"""
from __future__ import annotations

import abc


class BaseStore(abc.ABC):
    """Hedef/aday chunk okuma ve sonuc yazma soyut arayuzu."""

    @abc.abstractmethod
    def read_target_chunks(self, project_report_id: int) -> list[dict]:
        """Hedef projenin chunk'larini dondurur.

        Donen her oge: {"index": int, "embedding": list[float],
        "text": str|None, "sparse": dict|None}.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def read_candidate_chunks(self, scope: str, exclude_id: int) -> list[dict]:
        """Kapsama (scope) gore aday projeleri ve chunk'larini dondurur.

        exclude_id hedefin kendisidir ve sonuca dahil edilmez. Donen her oge:
        {"project_report_id": int, "chunks": list[dict]}.
        """
        raise NotImplementedError

    @abc.abstractmethod
    def write_result(
        self,
        project_report_id: int,
        plagiarism_rate: float,
        most_similar_id: int | None,
        matches: list[dict],
    ) -> None:
        """Hesaplanan sonucu (intihal orani + eslesmeler) kalici hale getirir."""
        raise NotImplementedError

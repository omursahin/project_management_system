"""Depolama arka uclari icin soyut taban sinif."""

from __future__ import annotations

import abc


class Store(abc.ABC):
    """Chunk embedding'lerini kalici hale getiren arka uc sozlesmesi."""

    @abc.abstractmethod
    def save_chunks(self, project_report_id: int, chunks: list[dict]) -> int:
        """Verilen chunk'lari kaydeder ve yazilan satir sayisini dondurur.

        chunks: her oge {"index", "text", "token_count", "embedding", "sparse"}.
        """
        raise NotImplementedError

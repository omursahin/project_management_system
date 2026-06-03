"""VARSAYILAN depolama: hicbir DB baglantisi kurmaz (servis bagimsiz calisir)."""

from __future__ import annotations

import logging

from .base import Store

logger = logging.getLogger("embedding_service.storage.null")


class NullStore(Store):
    """DB pasif arka uc.

    ``save_chunks`` yalnizca log atar ve 0 doner. Hicbir DB importu/baglantisi
    yapmaz; bu sayede servis veritabani olmadan tamamen bagimsiz calisabilir.
    """

    def save_chunks(self, project_report_id: int, chunks: list[dict]) -> int:
        logger.info(
            "NullStore: DB pasif; %d chunk YAZILMADI (project_report_id=%s).",
            len(chunks),
            project_report_id,
        )
        return 0

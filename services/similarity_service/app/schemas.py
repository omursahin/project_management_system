"""Pydantic semalari (istek/yanit sozlesmeleri).

chunk JSON sozlesmesi embedding_service ile AYNIDIR; boylece embedding
ciktisi dogrudan bu servisin girdisi olabilir.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class ChunkIn(BaseModel):
    """Tek bir chunk girdisi (embedding zorunlu; text/sparse opsiyonel)."""

    index: int = Field(..., description="0-tabanli chunk sirasi")
    embedding: list[float] = Field(..., description="bge-m3 dense, 1024 boyut, L2-normalize")
    text: str | None = Field(None, description="Kanit/pasaj gostermek icin chunk metni")
    sparse: dict | None = Field(None, description="Opsiyonel sparse agirliklar {token: weight}")


class CandidateIn(BaseModel):
    """Karsilastirilacak bir aday projenin chunk'lari."""

    project_report_id: int
    chunks: list[ChunkIn]


class CompareRequest(BaseModel):
    """/compare istek govdesi.

    MOD A (DB pasif): target_chunks + candidates verilir.
    MOD B (DB aktif): sadece project_report_id verilir; veriler DB'den okunur.
    """

    project_report_id: int | None = None
    target_chunks: list[ChunkIn] | None = None
    candidates: list[CandidateIn] | None = None

    # Istek bazinda ayar gecersiz kilma (None ise config varsayilani kullanilir)
    method: str | None = None
    threshold: float | None = None
    top_k: int | None = None
    scope: str | None = None

    # Sadece DB modunda etkili; sonucu DB'ye geri yaz
    write_back: bool = False


class MatchEvidence(BaseModel):
    """Bir eslesme kaniti: hangi hedef chunk hangi aday chunk'a ne kadar benzedi."""

    target_index: int
    candidate_index: int
    similarity: float


class CandidateScore(BaseModel):
    """Tek bir aday icin hesaplanan skor ve kanitlar."""

    project_report_id: int
    score: float  # 0..1
    num_target_chunks: int
    num_candidate_chunks: int
    evidence: list[MatchEvidence]


class CompareResponse(BaseModel):
    """/compare yaniti."""

    project_report_id: int | None
    method: str
    threshold: float
    plagiarism_rate: float = Field(..., description="0-100 yuzde (max aday skoru * 100)")
    most_similar_project_report_id: int | None
    per_candidate: list[CandidateScore]
    wrote_to_db: bool

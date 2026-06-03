"""Istek/yanit icin Pydantic modelleri (paylasilan chunk sozlesmesi dahil)."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ChunkOut(BaseModel):
    """Tek bir chunk'in cikti gosterimi.

    Bu sozlesme embedding ve similarity servisleri arasinda AYNIDIR;
    bu sayede embedding ciktisi dogrudan similarity girdisi olabilir.
    """

    index: int = Field(..., description="0-tabanli sira")
    text: str = Field(..., description="Chunk metni (kanit/pasaj gostermek icin)")
    token_count: int = Field(..., description="Chunk'taki token sayisi")
    embedding: list[float] = Field(
        ..., description="bge-m3 dense, 1024 boyut, L2-normalize edilmis"
    )
    sparse: Optional[dict[str, float]] = Field(
        default=None,
        description="Opsiyonel sparse agirliklar; sadece USE_SPARSE acikken dolar",
    )


class EmbedRequest(BaseModel):
    """Ham metin gomme istegi."""

    project_report_id: Optional[int] = Field(
        default=None, description="Iliskili ProjectReport id (persist icin gerekli)"
    )
    text: str = Field(..., min_length=1, description="Gommulecek ham metin")
    persist: bool = Field(default=False, description="DB'ye yaz (storage=postgres ise)")
    use_sparse: Optional[bool] = Field(
        default=None,
        description="Bu istek icin sparse uretimini ac/kapat; None ise ayar varsayilani",
    )


class EmbedResponse(BaseModel):
    """Gomme islemi sonucu."""

    project_report_id: Optional[int]
    model: str
    dim: int
    num_chunks: int
    chunks: list[ChunkOut]
    persisted: bool = Field(default=False, description="DB'ye yazildiysa True")

"""FastAPI uygulamasi: metin/dosya -> chunk -> bge-m3 embedding -> yanit (+opsiyonel DB)."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from . import embedder, parsing
from .chunking import chunk_text
from .config import settings
from .schemas import ChunkOut, EmbedRequest, EmbedResponse
from .storage import get_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("embedding_service.main")

app = FastAPI(
    title="Embedding Service",
    description="Proje dokumani -> metin -> chunk -> bge-m3 embedding.",
    version="1.0.0",
)


def _resolve_use_sparse(request_value: Optional[bool]) -> bool:
    """Istek bazli sparse bayragini ayar varsayilani ile birlestirir."""
    return settings.use_sparse if request_value is None else bool(request_value)


def _build_chunks(text: str, use_sparse: bool) -> list[ChunkOut]:
    """Metni chunk'lar, gomer ve ChunkOut listesi uretir."""
    raw_chunks = chunk_text(
        text=text,
        size=settings.chunk_size,
        overlap=settings.chunk_overlap,
        strategy=settings.chunk_strategy,
        count_tokens_fn=embedder.count_tokens,
    )
    if not raw_chunks:
        raise HTTPException(status_code=400, detail="Metinden chunk uretilemedi (bos icerik).")

    texts = [c["text"] for c in raw_chunks]
    result = embedder.embed_texts(texts, use_sparse=use_sparse)
    dense = result["dense"]
    sparse_list = result["sparse"]

    chunks: list[ChunkOut] = []
    for i, c in enumerate(raw_chunks):
        chunks.append(
            ChunkOut(
                index=c["index"],
                text=c["text"],
                token_count=c["token_count"],
                embedding=dense[i].tolist(),
                sparse=(sparse_list[i] if sparse_list is not None else None),
            )
        )
    return chunks


def _maybe_persist(project_report_id: Optional[int], persist: bool, chunks: list[ChunkOut]) -> bool:
    """persist=True ve storage=postgres ise chunk'lari kaydeder; aksi halde no-op."""
    if not persist:
        return False
    if project_report_id is None:
        raise HTTPException(
            status_code=400, detail="persist=True icin project_report_id gereklidir."
        )
    store = get_store(settings)
    payload = [
        {
            "index": c.index,
            "text": c.text,
            "token_count": c.token_count,
            "embedding": c.embedding,
            "sparse": c.sparse,
        }
        for c in chunks
    ]
    try:
        written = store.save_chunks(project_report_id, payload)
    except Exception as exc:  # DB hatalarini anlamli HTTP 500'e cevir
        logger.exception("Kaydetme hatasi.")
        raise HTTPException(status_code=500, detail=f"Kaydetme hatasi: {exc}") from exc
    return written > 0


@app.get("/health")
def health() -> dict:
    """Saglik kontrolu. Model'i TETIKLEMEZ; sadece durum raporlar."""
    return {
        "status": "ok",
        "model": settings.model_name,
        "model_loaded": embedder.model_loaded(),
        "storage": settings.storage_backend,
    }


@app.post("/embed", response_model=EmbedResponse)
def embed(request: EmbedRequest) -> EmbedResponse:
    """Ham metni chunk'la, embedding uret ve dondur (opsiyonel DB kaydi)."""
    text = (request.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Bos metin gonderilemez.")

    use_sparse = _resolve_use_sparse(request.use_sparse)
    try:
        chunks = _build_chunks(text, use_sparse=use_sparse)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Embedding hatasi.")
        raise HTTPException(status_code=500, detail=f"Embedding hatasi: {exc}") from exc

    persisted = _maybe_persist(request.project_report_id, request.persist, chunks)

    return EmbedResponse(
        project_report_id=request.project_report_id,
        model=settings.model_name,
        dim=embedder.DENSE_DIM,
        num_chunks=len(chunks),
        chunks=chunks,
        persisted=persisted,
    )


@app.post("/embed-file", response_model=EmbedResponse)
async def embed_file(
    file: UploadFile = File(..., description="PDF/DOCX/TXT dosyasi"),
    project_report_id: Optional[int] = Form(default=None),
    persist: bool = Form(default=False),
    use_sparse: Optional[bool] = Form(default=None),
) -> EmbedResponse:
    """Yuklenen dosyadan metin cikar, chunk'la, embedding uret (opsiyonel DB kaydi)."""
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Bos dosya yuklendi.")

    # Metin cikarimi: desteklenmeyen uzanti/bos icerik -> 415/400.
    try:
        text = parsing.extract_text(data, file.filename or "")
    except ValueError as exc:
        message = str(exc)
        status = 415 if "Desteklenmeyen" in message else 400
        raise HTTPException(status_code=status, detail=message) from exc
    except Exception as exc:
        logger.exception("Dosya cozumleme hatasi.")
        raise HTTPException(status_code=500, detail=f"Dosya cozumleme hatasi: {exc}") from exc

    resolved_sparse = _resolve_use_sparse(use_sparse)
    try:
        chunks = _build_chunks(text, use_sparse=resolved_sparse)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Embedding hatasi.")
        raise HTTPException(status_code=500, detail=f"Embedding hatasi: {exc}") from exc

    persisted = _maybe_persist(project_report_id, persist, chunks)

    return EmbedResponse(
        project_report_id=project_report_id,
        model=settings.model_name,
        dim=embedder.DENSE_DIM,
        num_chunks=len(chunks),
        chunks=chunks,
        persisted=persisted,
    )


if __name__ == "__main__":
    # Yerel calistirma kolayligi (opsiyonel).
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.service_port, reload=False)

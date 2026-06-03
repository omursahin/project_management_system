"""bge-m3 sarmalayici: lazy model/tokenizer yukleme + embedding/token sayimi.

Onemli: Agir model (BAAI/bge-m3) yalnizca ilk gercek embedding isteginde
yuklenir. ``main.py`` import edildiginde veya ``/health`` cagrildiginda model
INMEZ. ``model_loaded()`` bunu yan etki olmadan raporlar.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

import numpy as np

from .config import settings

logger = logging.getLogger("embedding_service.embedder")

# Lazy singleton tutucular.
_model = None  # type: ignore[var-annotated]  # BGEM3FlagModel ornegi
_tokenizer = None  # type: ignore[var-annotated]  # transformers AutoTokenizer
_tokenizer_failed = False  # hf tokenizer yuklenemedi -> heuristic'e dus

DENSE_DIM = 1024  # bge-m3 dense boyutu


def model_loaded() -> bool:
    """Agir model bellege yuklendi mi? (yukleme TETIKLEMEZ)."""
    return _model is not None


def get_model():
    """bge-m3 modelini lazy yukler ve singleton olarak dondurur."""
    global _model
    if _model is None:
        logger.info("bge-m3 modeli yukleniyor: %s (device=%s, fp16=%s)",
                    settings.model_name, settings.device, settings.use_fp16)
        # Agir import burada; modul yuklenirken FlagEmbedding zorunlu olmasin.
        from FlagEmbedding import BGEM3FlagModel

        use_fp16 = settings.use_fp16 and settings.device != "cpu"
        _model = BGEM3FlagModel(
            settings.model_name,
            use_fp16=use_fp16,
            devices=settings.device,
        )
        logger.info("bge-m3 modeli yuklendi.")
    return _model


def get_tokenizer():
    """hf AutoTokenizer'i lazy yukler; basarisiz olursa None doner (heuristic'e dusulur)."""
    global _tokenizer, _tokenizer_failed
    if _tokenizer is not None or _tokenizer_failed:
        return _tokenizer
    try:
        from transformers import AutoTokenizer

        _tokenizer = AutoTokenizer.from_pretrained(settings.model_name)
        logger.info("hf tokenizer yuklendi: %s", settings.model_name)
    except Exception as exc:  # ag/paket sorunu -> heuristic'e dus
        _tokenizer_failed = True
        logger.warning("hf tokenizer yuklenemedi (%s); heuristic token sayimina geciliyor.", exc)
    return _tokenizer


def _heuristic_token_count(text: str) -> int:
    """Cevrimdisi yaklasik token sayimi: token ~= kelime * 1.3."""
    words = len(text.split())
    return max(1, int(math.ceil(words * 1.3))) if words else 0


def count_tokens(text: str) -> int:
    """Metindeki token sayisini dondurur.

    TOKENIZER_MODE="hf" ise gercek tokenizer; yuklenemezse veya
    "heuristic" ise yaklasik (kelime*1.3) yontem kullanilir.
    """
    if not text:
        return 0
    if settings.tokenizer_mode == "hf":
        tok = get_tokenizer()
        if tok is not None:
            try:
                return len(tok.encode(text, add_special_tokens=False))
            except Exception as exc:  # tek seferlik beklenmeyen hata
                logger.warning("hf token sayimi basarisiz (%s); heuristic'e dusuluyor.", exc)
    return _heuristic_token_count(text)


def _l2_normalize(matrix: np.ndarray) -> np.ndarray:
    """Satir bazli L2-normalize (sifir vektor korunur)."""
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return matrix / norms


def embed_texts(texts: list[str], use_sparse: bool) -> dict:
    """Verilen metinleri gomer.

    Donus:
      {
        "dense": np.ndarray[n, 1024]  (NORMALIZE acikken L2-normalize),
        "sparse": list[dict[str, float]] | None  (use_sparse=True ise)
      }
    """
    if not texts:
        return {"dense": np.zeros((0, DENSE_DIM), dtype=np.float32), "sparse": None}

    model = get_model()
    output = model.encode(
        texts,
        batch_size=settings.batch_size,
        return_dense=True,
        return_sparse=use_sparse,
        return_colbert_vecs=False,
    )

    dense = np.asarray(output["dense_vecs"], dtype=np.float32)
    if settings.normalize:
        dense = _l2_normalize(dense)

    sparse: Optional[list[dict[str, float]]] = None
    if use_sparse:
        raw_sparse = output.get("lexical_weights") or []
        sparse = []
        for item in raw_sparse:
            # FlagEmbedding token id -> agirlik dondurur; okunabilir token'a cevir.
            sparse.append(_decode_sparse(item))

    return {"dense": dense, "sparse": sparse}


def _decode_sparse(weights: dict) -> dict[str, float]:
    """Sparse agirliklari okunabilir {token: weight} sozlugune cevirir."""
    tok = get_tokenizer()
    decoded: dict[str, float] = {}
    for token_id, weight in weights.items():
        try:
            key = tok.decode([int(token_id)]).strip() if tok is not None else str(token_id)
        except Exception:
            key = str(token_id)
        if not key:
            key = str(token_id)
        # Ayni token'a denk gelirse en yuksek agirligi koru.
        decoded[key] = max(decoded.get(key, 0.0), float(weight))
    return decoded

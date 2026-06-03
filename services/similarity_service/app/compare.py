"""Cosine benzerlik matrisi hesaplari (sadece numpy).

Tum agir is tek bir matris carpimina (matmul) iner: bu yuzden tam-tarama
(brute-force) bile ucuzdur.
"""
from __future__ import annotations

from typing import Iterable, Mapping, Sequence

import numpy as np

EMBED_DIM = 1024


def to_matrix(chunks: Sequence[Mapping] | Sequence) -> np.ndarray:
    """chunk listesini [n, d] float32 matrise cevirir.

    Her oge ya `embedding` anahtarli dict/sema, ya da dogrudan vektor olabilir.
    Bos liste icin [0, EMBED_DIM] sekilli bos matris dondurur.
    """
    vectors: list[Iterable[float]] = []
    for c in chunks:
        if hasattr(c, "embedding"):  # Pydantic sema nesnesi
            vectors.append(c.embedding)
        elif isinstance(c, Mapping):  # dict
            vectors.append(c["embedding"])
        else:  # ham vektor
            vectors.append(c)

    if not vectors:
        return np.empty((0, EMBED_DIM), dtype=np.float32)

    matrix = np.asarray(vectors, dtype=np.float32)
    if matrix.ndim != 2:
        raise ValueError("Embedding listesi 2 boyutlu bir matrise donusmedi.")
    return matrix


def l2_normalize(matrix: np.ndarray) -> np.ndarray:
    """Satir bazinda L2-normalize eder (sifir vektorler guvenle 0 kalir).

    Embedding'ler zaten normalize gelse bile idempotent oldugu icin guvenlidir.
    """
    if matrix.size == 0:
        return matrix
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    # 0'a bolmeyi onlemek icin sifir normlari 1'e sabitle
    norms = np.where(norms == 0.0, 1.0, norms)
    return matrix / norms


def cosine_matrix(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """A[n,d] ve B[m,d] arasindaki cosine benzerlik matrisini [n,m] dondurur.

    Bos kenar durumlarinda [n,m] sekilli bos matris dondurur.
    Boyut uyumsuzlugunda ValueError firlatir.
    """
    if a.size == 0 or b.size == 0:
        return np.empty((a.shape[0], b.shape[0]), dtype=np.float32)

    if a.shape[1] != b.shape[1]:
        raise ValueError(
            f"Embedding boyutlari uyumsuz: hedef={a.shape[1]} aday={b.shape[1]}"
        )

    a_norm = l2_normalize(a)
    b_norm = l2_normalize(b)
    # Tek matmul ile tum ikili benzerlikler: [n,d] @ [d,m] -> [n,m]
    return a_norm @ b_norm.T

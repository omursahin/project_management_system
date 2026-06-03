"""Benzerlik matrisini tek skora indiren yontemler.

Uc yontem: max-sim, top-k mean, coverage. Hepsi 0..1 araliginda skor uretir.
`aggregate` ortak arayuzdur ve ayrica en guclu eslesme kanitlarini dondurur.
"""
from __future__ import annotations

import numpy as np

# evidence listesinde tutulacak en guclu eslesme cifti sayisi
_MAX_EVIDENCE = 5


def max_sim(matrix: np.ndarray) -> float:
    """Matrisin global maksimumu: en benzer tek chunk cifti.

    Tek bir kopyalanmis paragraf bile yuksek skor uretir (keskin/agresif).
    """
    if matrix.size == 0:
        return 0.0
    return float(matrix.max())


def top_k_mean(matrix: np.ndarray, k: int) -> float:
    """Tum hucrelerin en yuksek k tanesinin ortalamasi.

    Birden fazla guclu eslesmeyi odullendirir; tek tesadufi eslesmeye karsi
    max-sim'den daha dengelidir.
    """
    if matrix.size == 0:
        return 0.0
    flat = matrix.ravel()
    k = max(1, min(int(k), flat.size))
    # En yuksek k degeri (sirasiz) sec, sonra ortalamasini al
    top = np.partition(flat, -k)[-k:]
    return float(top.mean())


def coverage(matrix: np.ndarray, threshold: float) -> float:
    """Hedef chunk'larin (satirlarin) yuzde kaci esige ulasti.

    Her hedef satirinin maksimumu >= threshold ise o chunk "eslesmis" sayilir.
    Sonuc 0..1: dokumanin ne kadarinin kopya oldugunu temsil eder (en yorumlanabilir).
    """
    if matrix.size == 0 or matrix.shape[0] == 0:
        return 0.0
    row_max = matrix.max(axis=1)  # her hedef chunk'in en iyi eslesmesi
    matched = np.count_nonzero(row_max >= threshold)
    return float(matched / matrix.shape[0])


def _top_evidence(matrix: np.ndarray) -> list[tuple[int, int, float]]:
    """En yuksek benzerlikli ilk ~5 (target_index, candidate_index, similarity)."""
    if matrix.size == 0:
        return []
    flat = matrix.ravel()
    k = min(_MAX_EVIDENCE, flat.size)
    # En yuksek k indis (azalan sirayla)
    idx = np.argpartition(flat, -k)[-k:]
    idx = idx[np.argsort(flat[idx])[::-1]]
    n_cols = matrix.shape[1]
    evidence: list[tuple[int, int, float]] = []
    for flat_i in idx:
        ti, ci = divmod(int(flat_i), n_cols)
        evidence.append((ti, ci, float(flat[flat_i])))
    return evidence


def aggregate(
    method: str,
    matrix: np.ndarray,
    threshold: float,
    top_k: int,
) -> tuple[float, list[tuple[int, int, float]]]:
    """Secili yonteme gore (skor_0_1, kanit_listesi) dondurur.

    method: "coverage" | "maxsim" | "topk". Bilinmeyen yontemde ValueError.
    """
    normalized = method.lower().strip()
    if normalized in ("maxsim", "max_sim", "max-sim"):
        score = max_sim(matrix)
    elif normalized in ("topk", "top_k", "top-k"):
        score = top_k_mean(matrix, top_k)
    elif normalized == "coverage":
        score = coverage(matrix, threshold)
    else:
        raise ValueError(f"Bilinmeyen skorlama yontemi: {method}")

    return score, _top_evidence(matrix)

"""Metin chunk'lama mantigi (paragraph ve fixed stratejileri).

Token sayimi disaridan verilen ``count_tokens_fn`` ile yapilir; bu sayede
hf tokenizer ya da heuristic arasinda servis duzeyinde secim yapilabilir.
"""

from __future__ import annotations

import re
from typing import Callable

# Cumle sonu sezgisi: nokta/soru/unlem + bosluk.
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _split_paragraphs(text: str) -> list[str]:
    """Metni paragraflara boler (bos satir ayraci)."""
    paras = [p.strip() for p in re.split(r"\n\s*\n", text)]
    return [p for p in paras if p]


def _split_sentences(paragraph: str) -> list[str]:
    """Paragrafi cumlelere boler; cumle bulunamazsa paragrafin kendisi doner."""
    sentences = [s.strip() for s in _SENTENCE_SPLIT.split(paragraph)]
    sentences = [s for s in sentences if s]
    return sentences or [paragraph]


def _split_words(text: str) -> list[str]:
    """Bosluga gore kelimelere boler (token penceresi yaklasik birimi)."""
    return text.split()


def _hard_split_long_unit(
    unit: str,
    size: int,
    count_tokens_fn: Callable[[str], int],
) -> list[str]:
    """Tek basina ``size`` token butcesini asan birimi parcalara boler.

    Kelime kelime ekleyerek butce dolunca yeni parca acar. Tek kelime bile
    butceyi asarsa o kelime kendi basina bir parca olur (sonsuz dongu olmaz).
    """
    words = _split_words(unit)
    if not words:
        return []

    parts: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join(current + [word])
        if current and count_tokens_fn(candidate) > size:
            parts.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        parts.append(" ".join(current))
    return parts


def _overlap_tail(words: list[str], overlap: int, count_tokens_fn: Callable[[str], int]) -> list[str]:
    """Ortusme icin onceki chunk'in sonundan ~overlap token'lik kuyrugu dondurur."""
    if overlap <= 0 or not words:
        return []
    tail: list[str] = []
    for word in reversed(words):
        tail.insert(0, word)
        if count_tokens_fn(" ".join(tail)) >= overlap:
            break
    return tail


def _pack_units(
    units: list[str],
    size: int,
    overlap: int,
    count_tokens_fn: Callable[[str], int],
) -> list[str]:
    """Verilen metin birimlerini hedef token butcesine gore chunk'lara paketler.

    Ardisik chunk'lar arasinda ``overlap`` token kadar ortusme birakilir.
    """
    # Once asiri uzun birimleri boluyoruz ki hicbiri butceyi tek basina asmasin.
    normalized: list[str] = []
    for unit in units:
        if count_tokens_fn(unit) > size:
            normalized.extend(_hard_split_long_unit(unit, size, count_tokens_fn))
        else:
            normalized.append(unit)

    chunks: list[str] = []
    current_words: list[str] = []

    for unit in normalized:
        unit_words = _split_words(unit)
        candidate = current_words + unit_words
        if current_words and count_tokens_fn(" ".join(candidate)) > size:
            # Mevcut chunk'i kapat.
            chunks.append(" ".join(current_words))
            # Yeni chunk'i ortusme kuyrugu ile baslat.
            tail = _overlap_tail(current_words, overlap, count_tokens_fn)
            current_words = tail + unit_words
        else:
            current_words = candidate

    if current_words:
        chunks.append(" ".join(current_words))
    return chunks


def _fixed_window(
    text: str,
    size: int,
    overlap: int,
    count_tokens_fn: Callable[[str], int],
) -> list[str]:
    """Sabit kelime penceresi + ortusme ile chunk'lar uretir.

    Pencere boyutu token butcesine yaklasacak sekilde kelime adimiyla ayarlanir.
    """
    words = _split_words(text)
    if not words:
        return []

    chunks: list[str] = []
    start = 0
    n = len(words)
    # Adimi guvenli alt sinirla (ilerleme garantisi).
    step_floor = 1

    while start < n:
        # Bu pencerede butceyi asmadan alabildigimiz kadar kelime al.
        end = start
        while end < n:
            candidate = " ".join(words[start : end + 1])
            if count_tokens_fn(candidate) > size and end > start:
                break
            end += 1
        window_words = words[start:end]
        if not window_words:
            window_words = words[start : start + 1]
            end = start + 1
        chunks.append(" ".join(window_words))

        if end >= n:
            break

        # Bir sonraki baslangic: pencere uzunlugundan overlap kadar geri git.
        window_len = end - start
        overlap_words = _overlap_tail(window_words, overlap, count_tokens_fn)
        step = max(step_floor, window_len - len(overlap_words))
        start += step

    return chunks


def chunk_text(
    text: str,
    size: int,
    overlap: int,
    strategy: str,
    count_tokens_fn: Callable[[str], int],
) -> list[dict]:
    """Metni chunk'lara boler ve her chunk icin token sayar.

    Donen her oge: {"index": int, "text": str, "token_count": int}.
    Chunk sayisi metnin uzunluguna gore degisir.

    strategy:
      - "paragraph": once paragraf/cumlelere bol, sonra hedef token butcesine
        gore paketle (semantik sinirlara saygi gosterir).
      - "fixed": sabit token penceresi + overlap.
    """
    text = (text or "").strip()
    if not text:
        return []

    overlap = max(0, min(overlap, max(0, size - 1)))  # overlap < size olmali

    if strategy == "fixed":
        pieces = _fixed_window(text, size, overlap, count_tokens_fn)
    else:
        # paragraph (varsayilan): paragraf -> cumle birimlerini paketle.
        units: list[str] = []
        for para in _split_paragraphs(text):
            units.extend(_split_sentences(para))
        if not units:
            units = [text]
        pieces = _pack_units(units, size, overlap, count_tokens_fn)

    chunks: list[dict] = []
    for i, piece in enumerate(p for p in pieces if p.strip()):
        chunks.append(
            {
                "index": i,
                "text": piece,
                "token_count": count_tokens_fn(piece),
            }
        )
    return chunks

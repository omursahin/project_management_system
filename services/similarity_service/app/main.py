"""Similarity Service - FastAPI uygulamasi.

Hedef projenin chunk embedding'lerini diger projelerinkiyle TAM TARAMA
(brute-force) karsilastirir; cosine matrisini tek numpy matmul ile hesaplar
ve secili yontemle tek skora indirir.

Bu serviste torch/FlagEmbedding YOKTUR; sadece numpy kullanilir (hafif).

Iki calisma modu:
  MOD A (DB pasif veya body'de candidates var):
    Veriler dogrudan request body'den gelir. write_back null modda yok sayilir.
  MOD B (STORAGE_BACKEND=postgres ve sadece project_report_id verildi):
    Hedef + adaylar DB'den okunur; write_back=True ise sonuc DB'ye yazilir.
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException

from .compare import cosine_matrix, to_matrix
from .config import Settings, get_settings
from .schemas import (
    CandidateIn,
    CandidateScore,
    ChunkIn,
    CompareRequest,
    CompareResponse,
    MatchEvidence,
)
from .scoring import aggregate
from .storage import get_store

settings: Settings = get_settings()
app = FastAPI(
    title="Similarity Service",
    description="Chunk embedding'leri ile tam-tarama intihal/benzerlik tespiti (numpy).",
    version="1.0.0",
)


@app.get("/health")
def health() -> dict:
    """Saglik kontrolu. Agir model olmadigi icin her zaman aninda doner."""
    return {
        "status": "ok",
        "scoring": settings.SCORING_METHOD,
        "storage": settings.STORAGE_BACKEND,
    }


def _resolve_params(req: CompareRequest) -> tuple[str, float, int, str]:
    """Istek alanlarini config varsayilanlariyla birlestirir."""
    method = req.method or settings.SCORING_METHOD
    threshold = req.threshold if req.threshold is not None else settings.SIM_THRESHOLD
    top_k = req.top_k if req.top_k is not None else settings.TOP_K
    scope = req.scope or settings.SCOPE
    return method, threshold, top_k, scope


def _score_candidate(
    target_matrix,
    candidate: CandidateIn | dict,
    method: str,
    threshold: float,
    top_k: int,
) -> CandidateScore:
    """Tek bir aday icin cosine matrisi + skor + kanit uretir."""
    if isinstance(candidate, dict):
        cand_id = candidate["project_report_id"]
        cand_chunks = candidate["chunks"]
    else:
        cand_id = candidate.project_report_id
        cand_chunks = candidate.chunks

    cand_matrix = to_matrix(cand_chunks)
    try:
        matrix = cosine_matrix(target_matrix, cand_matrix)
    except ValueError as exc:  # boyut uyumsuzlugu
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    score, evidence = aggregate(method, matrix, threshold, top_k)
    return CandidateScore(
        project_report_id=cand_id,
        score=round(score, 6),
        num_target_chunks=int(target_matrix.shape[0]),
        num_candidate_chunks=int(cand_matrix.shape[0]),
        evidence=[
            MatchEvidence(target_index=t, candidate_index=c, similarity=round(s, 6))
            for (t, c, s) in evidence
        ],
    )


@app.post("/compare", response_model=CompareResponse)
def compare(req: CompareRequest) -> CompareResponse:
    """Hedef projeyi adaylarla karsilastir ve intihal oranini hesapla."""
    method, threshold, top_k, scope = _resolve_params(req)

    try:
        aggregate(method, to_matrix([]), threshold, top_k)
    except ValueError as exc:  # bilinmeyen yontem
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    backend = settings.STORAGE_BACKEND.lower().strip()
    use_db = backend == "postgres" and req.candidates is None

    # --- Hedef ve aday verilerini topla ---
    if use_db:
        # MOD B: DB'den oku
        if req.project_report_id is None:
            raise HTTPException(
                status_code=400,
                detail="DB modunda project_report_id zorunludur.",
            )
        store = get_store(settings)
        try:
            target_chunks = store.read_target_chunks(req.project_report_id)
            candidates_raw = store.read_candidate_chunks(scope, req.project_report_id)
        except RuntimeError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        candidates: list = candidates_raw
    else:
        # MOD A: request body
        if not req.target_chunks:
            raise HTTPException(
                status_code=400,
                detail="target_chunks bos olamaz (DB pasif modda zorunlu).",
            )
        if not req.candidates:
            raise HTTPException(
                status_code=400,
                detail="candidates bos olamaz (DB pasif modda zorunlu).",
            )
        target_chunks = req.target_chunks
        candidates = req.candidates

    target_matrix = to_matrix(target_chunks)
    if target_matrix.shape[0] == 0:
        raise HTTPException(status_code=400, detail="Hedef chunk listesi bos.")

    # --- Her aday icin skor ---
    per_candidate: list[CandidateScore] = []
    for cand in candidates:
        per_candidate.append(
            _score_candidate(target_matrix, cand, method, threshold, top_k)
        )

    # --- En benzer adayi ve genel orani bul ---
    most_similar_id: int | None = None
    max_score = 0.0
    for cs in per_candidate:
        if cs.score > max_score:
            max_score = cs.score
            most_similar_id = cs.project_report_id

    plagiarism_rate = round(max_score * 100, 2)

    # --- Opsiyonel DB'ye yazma ---
    wrote_to_db = False
    if req.write_back:
        if use_db and most_similar_id is not None:
            store = get_store(settings)
            matches = _build_match_rows(per_candidate, most_similar_id)
            try:
                store.write_result(
                    req.project_report_id,  # type: ignore[arg-type]
                    plagiarism_rate,
                    most_similar_id,
                    matches,
                )
                wrote_to_db = True
            except RuntimeError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
        # null modda write_back istense bile yazilmaz (sessizce yok sayilir)

    return CompareResponse(
        project_report_id=req.project_report_id,
        method=method,
        threshold=threshold,
        plagiarism_rate=plagiarism_rate,
        most_similar_project_report_id=most_similar_id,
        per_candidate=per_candidate,
        wrote_to_db=wrote_to_db,
    )


def _build_match_rows(
    per_candidate: list[CandidateScore],
    most_similar_id: int,
) -> list[dict]:
    """En benzer adayin kanitlarini DB satir formatina cevirir."""
    rows: list[dict] = []
    for cs in per_candidate:
        if cs.project_report_id != most_similar_id:
            continue
        for ev in cs.evidence:
            rows.append(
                {
                    "candidate_project_report_id": cs.project_report_id,
                    "target_index": ev.target_index,
                    "candidate_index": ev.candidate_index,
                    "similarity": ev.similarity,
                }
            )
    return rows

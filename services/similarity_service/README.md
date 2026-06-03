# similarity_service

Hedef projenin chunk embedding'lerini diğer projelerinkiyle **tam tarama (brute-force)** karşılaştırır. Cosine matrisi tek `numpy` matmul ile hesaplanır (`A_norm @ B_norm.T`), seçili yöntemle tek skora indirilir. Port `8200`.

> Bu serviste **torch/model yok** — sadece hazır vektörleri karşılaştırır, çok hafiftir.

## Çalıştırma

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8200
```

## 3 skorlama yöntemi (sonuçların anlamı)

`[hedef chunk × aday chunk]` cosine matrisi `M` üzerinden çalışırlar; hepsi `0..1` skor üretir. `plagiarism_rate = max(aday skoru) × 100`.

| Yöntem | Ne yapar | Anlamı / ne zaman |
|---|---|---|
| **coverage** (varsayılan) | Hedef chunk'ların (satırların) yüzde kaçının satır-maksimumu `≥ threshold` (0.85) | "Dökümanın **%X'i** kopya." En yorumlanabilir, uzunluğa göre normalize. Genel intihal oranı için. |
| **maxsim** | `M`'nin global maksimumu = en benzer **tek** chunk çifti | "En çok benzeyen tek pasaj." Tek kopyalanmış paragrafı bile yakalar; ama tek klişe eşleşme skoru şişirebilir. |
| **topk** | En yüksek **k** (varsayılan 10) hücrenin ortalaması | "En güçlü birkaç eşleşmenin ortalaması." Parçalı/dağınık kopyaya karşı maxsim'den dengeli. |

`method`, `threshold`, `top_k` istek gövdesinde de geçilebilir (verilmezse config varsayılanı).

## `POST /compare`

- **Mod A (DB pasif / varsayılan):** gövdede `target_chunks` + `candidates` ver → skor döner, DB'ye yazmaz.
- **Mod B (`STORAGE_BACKEND=postgres`, `candidates` yok):** hedef+adaylar DB'den `scope`'a göre okunur; `write_back=true` ise `plagiarism_rate` DB'ye yazılır.

Örnek (Mod A) yanıtı:

```json
{
  "project_report_id": 1,
  "method": "coverage",
  "plagiarism_rate": 87.5,
  "most_similar_project_report_id": 2,
  "per_candidate": [
    { "project_report_id": 2, "score": 0.875,
      "evidence": [{"target_index": 0, "candidate_index": 3, "similarity": 0.97}] }
  ],
  "wrote_to_db": false
}
```

İstek/yanıt alanlarının tamamı: `app/schemas.py`.

## Ayarlar (.env)

| Env | Varsayılan | Açıklama |
|---|---|---|
| `SCORING_METHOD` | `coverage` | `coverage` / `maxsim` / `topk` |
| `SIM_THRESHOLD` | `0.85` | coverage eşiği |
| `TOP_K` | `10` | topk için k |
| `SCOPE` | `same_report` | `all` / `same_report` / `same_term_lesson` (DB modu) |
| `STORAGE_BACKEND` | `null` | `null` / `postgres` |
| `DATABASE_DSN` | `""` | Sadece `postgres` modunda |

DB şeması ve aktivasyon → `../README.md`.

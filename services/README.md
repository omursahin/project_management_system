# services/ — Embedding & Similarity Servisleri

Proje raporları için iki bağımsız FastAPI mikroservisi. Ana Django projesine ve frontend'e dokunmaz.

| Servis | Port | Görev | Endpoint |
|---|---|---|---|
| `embedding_service` | 8100 | Döküman (PDF/DOCX/TXT) → chunk → **bge-m3** embedding (1024d) | `POST /embed`, `POST /embed-file` |
| `similarity_service` | 8200 | Chunk'lar arası tam-tarama cosine → benzerlik skoru (numpy) | `POST /compare` |

## Çalıştırma

```bash
docker compose -f services/docker-compose.yml up --build

cd services/embedding_service  && pip install -r requirements.txt && uvicorn app.main:app --port 8100
cd services/similarity_service && pip install -r requirements.txt && uvicorn app.main:app --port 8200
```


## Benzerlik skorlama — 3 sonuç türü

`SCORING_METHOD` ile seçilir. Üçü de bir `[hedef chunk × aday chunk]` cosine matrisinden **tek skor** üretir (0..1), `plagiarism_rate = skor × 100`:

| Yöntem | Anlamı | Ne zaman |
|---|---|---|
| **coverage** (varsayılan) | Hedef dökümanın chunk'larının **yüzde kaçı** karşı projede eşik (0.85) üstü bir eşe sahip → "Dökümanın %X'i örtüşüyor" | Genel intihal oranı (en sezgisel) |
| **maxsim** | İki döküman arasındaki **en benzer tek pasajın** skoru | Tek bir kopyalanmış paragrafı yakalamak |
| **topk** | En benzer **k (varsayılan 10) çiftin ortalaması** | Parçalı/dağınık kopyayı dengeli ölçmek |



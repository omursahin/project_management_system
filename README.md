# 🚀 Project Management System

Bu proje; üniversite bünyesindeki ders, dönem ve proje yönetim süreçlerini dijitalleştirmek amacıyla geliştirilen, Django (Backend) ve React (Frontend) tabanlı modüler bir platformdur.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

Proje, güncel ve ölçeklenebilir teknolojiler üzerine inşa edilmiştir:

* **Backend:** Python 3.x, Django 6.x, Django REST Framework (DRF)
* **Authentication:** JWT (SimpleJWT) tabanlı kimlik doğrulama altyapısı
* **Frontend:** React, Chakra UI (Vite/React-scripts)
* **Veritabanı:** SQLite (Geliştirme aşaması için)
* **Test:** Pytest & Pytest-Django

---

## 👥 Grup Sorumluluk Tablosu

| Grup | Sorumluluk Alanı | Epic'ler |
|:---:|---|---|
| **Grup 1** | Altyapı + Kullanıcı Yönetimi | Epic 1, Epic 2, Epic 11 |
| **Grup 2** | Üniversite Yapısı + Dönem | Epic 3, Epic 4 |
| **Grup 3** | Ders + Dönem Dersi + Öğrenci Kaydı | Epic 5, Epic 6, Epic 7 |
| **Grup 4** | Grup + Proje Yönetimi | Epic 8, Epic 9 |
| **Grup 5** | Rapor + Dashboard + Test | Epic 10, Epic 12, Epic 13 |

> **Not:** Gruplar arası bağımlılıklar (Örn: `account.MyUser`) sprint planlamasında önceliklendirilmektedir.

---

## 📂 Proje Dosya Yapısı

Proje, her alanın (domain) kendi Django uygulamasına sahip olduğu modüler bir yapıda kurgulanmıştır:

```text
project_management_system/
├── account/               # Özel kullanıcı modeli ve kayıt API'si
├── university/            # Üniversite genel tanımları
├── faculty/               # Fakülte yönetim modülü
├── department/            # Bölüm yönetim modülü
├── lesson/                # Ders tanımlama (Grup 3)
├── term/                  # Dönem yönetimi
├── term_lesson/           # Dönemlik ders atamaları (Grup 3)
├── frontend/              # React uygulama klasörü
├── project_management/    # Ana Django ayarları ve URL yapılandırması
├── manage.py              # Django yönetim komut dosyası
└── pytest.ini             # Test konfigürasyon dosyası

## 🛠️ Kurulum ve Çalıştırma

### 1. Backend (Django) Hazırlığı
```

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend (React) Hazırlığı
```
cd frontend
npm install
npm run dev
```
### 3. Testlerin Çalıştırılması
```
pytest
```  
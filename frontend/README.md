#  Proje Yönetim Sistemi - Frontend (Arayüz)

Bu proje, Web Programlama dersi kapsamında geliştirilen Full-Stack proje yönetim sisteminin **Frontend (Önyüz)** kısmını içermektedir. Kullanıcılara modern, hızlı ve duyarlı (responsive) bir deneyim sunmak amacıyla güncel web teknolojileri kullanılarak inşa edilmiştir.

## 🛠 Kullanılan Teknolojiler

* **Çekirdek:** React.js
* **Arayüz (UI) Kütüphanesi:** Chakra UI (v3) - *Hızlı ve erişilebilir modern bileşenler için kullanıldı.*
* **Yönlendirme (Routing):** React Router Dom - *Sayfalar arası dinamik ve kesintisiz geçiş için yapılandırıldı.*
* **API İletişimi:** Axios - *Django backend'i ile veri alışverişi (HTTP istekleri) için merkezi bir servis katmanı oluşturuldu.*

## 📁 Mimari Yapı

Proje, sürdürülebilir bir yapıda kurgulanmıştır:
* `src/components/`: Projenin temel iskeletini oluşturan (Navbar, Sidebar, Footer) tekrar kullanılabilir tasarım bileşenleri.
* `src/services/`: Backend ile konuşan köprü katmanı (`api.js`).
* `.env`: Sistem yapılandırmalarını ve API adreslerini tutan güvenli ortam değişkeni dosyası.

## ⚙️ Kurulum ve Çalıştırma

Projeyi lokal ortamınızda (kendi bilgisayarınızda) ayağa kaldırmak için aşağıdaki adımları izleyin:

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
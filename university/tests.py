from django.test import TestCase
from .models import University

class UniversityEklemeSilmeTestleri(TestCase):

    def test_universite_ekleme(self):
        # Arkadaşının modelindeki doğru alan adları (title, description, city_code) ile üniversite oluşturuyoruz
        yeni_uni = University.objects.create(
            title="Teknoloji Üniversitesi",
            description="Türkiye'nin en iyi teknoloji üniversitelerinden biri.",
            city_code="38"
        )

        # Veritabanında 1 tane üniversite olduğunu ve adının (title) doğru kaydedildiğini test et
        self.assertEqual(University.objects.count(), 1)
        self.assertEqual(yeni_uni.title, "Teknoloji Üniversitesi")
        print("✅ Üniversite Ekleme Testi Geçti!")

    def test_universite_silme(self):
        # Silme işlemini test etmek için önce bir üniversite oluştur
        silinecek_uni = University.objects.create(
            title="Silinecek Üniversite",
            description="Bu üniversite birazdan yok olacak.",
            city_code="99"
        )
        # Eklendiğinden emin olalım (Sayı 1 olmalı)
        self.assertEqual(University.objects.count(), 1)

        # Şimdi bu üniversiteyi sil.
        silinecek_uni.delete()

        # Veritabanında hiç üniversite kalmadığını (sayının 0'a düştüğünü) test et
        self.assertEqual(University.objects.count(), 0)
        print("✅ Üniversite Silme Testi Geçti!")
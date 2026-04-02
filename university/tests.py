from django.test import TestCase
from .models import University


class UniversityEklemeSilmeTestleri(TestCase):

    def test_universite_ekleme(self):
        # API'siz, URL'siz doğrudan veritabanı (ORM) ile ekleme
        yeni_uni = University.objects.create(
            title="Teknoloji Üniversitesi",
            description="Türkiye'nin en iyi teknoloji üniversitelerinden biri.",
            city_code="38"
        )

        self.assertEqual(University.objects.count(), 1)
        self.assertEqual(yeni_uni.title, "Teknoloji Üniversitesi")
        print("✅ Üniversite Ekleme Testi Geçti!")

    def test_universite_silme(self):
        # Doğrudan veritabanında oluşturup silmek
        silinecek_uni = University.objects.create(
            title="Silinecek Üniversite",
            description="Bu üniversite birazdan yok olacak.",
            city_code="99"
        )

        self.assertEqual(University.objects.count(), 1)

        # Yok etmek
        silinecek_uni.delete()

        self.assertEqual(University.objects.count(), 0)
        print("✅ Üniversite Silme Testi Geçti!")
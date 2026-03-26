from django.test import TestCase
from .models import Faculty
from university.models import University


class FacultyEklemeSilmeGuncellemeTestleri(TestCase):

    def setUp(self):
        # Fakülteleri bağlayabileceğimiz sahte bir test üniversitesi
        self.test_uni = University.objects.create(
            title="Erciyes Üniversitesi",
            description="Kayseri'nin incisi.",
            city_code="38"
        )

    def test_faculty_ekleme(self):
        yeni_fakulte = Faculty.objects.create(
            university=self.test_uni,
            title="Mühendislik Fakültesi",
            short_title="Müh. Fak.",
            faculty_code="MF-01",
            description="Harika mühendisler yetiştirir."
        )

        self.assertEqual(Faculty.objects.count(), 1)
        self.assertEqual(yeni_fakulte.title, "Mühendislik Fakültesi")
        print("✅ Fakülte Ekleme Testi Geçti!")

    def test_faculty_silme(self):
        silinecek_fakulte = Faculty.objects.create(
            university=self.test_uni,
            title="Silinecek Fakülte",
            short_title="Sil. Fak.",
            faculty_code="SF-99",
            description="Birazdan yok olacak."
        )

        self.assertEqual(Faculty.objects.count(), 1)
        silinecek_fakulte.delete()
        self.assertEqual(Faculty.objects.count(), 0)
        print("✅ Fakülte Silme Testi Geçti!")

    def test_faculty_guncelleme(self):
        guncellenecek_fakulte = Faculty.objects.create(
            university=self.test_uni,
            title="Eski Fakülte Adı",
            short_title="EFA",
            faculty_code="EF-01",
            description="Eski açıklama"
        )

        # URL olmadan, Python üzerinden ismi güncelliyoruz
        guncellenecek_fakulte.title = "Yeni Fakülte Adı"
        guncellenecek_fakulte.save()

        # Veritabanından güncel halini çekip kontrol ediyoruz
        guncel_hal = Faculty.objects.get(id=guncellenecek_fakulte.id)
        self.assertEqual(guncel_hal.title, "Yeni Fakülte Adı")
        print("✅ Fakülte Güncelleme Testi Geçti!")
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Faculty
from university.models import University

User = get_user_model()


# ==========================================
# 1. ORM (VERİTABANI) TESTLERİ
# ==========================================
class FacultyEklemeSilmeGuncellemeTestleri(TestCase):

    def setUp(self):
        self.test_uni = University.objects.create(
            title="Erciyes Üniversitesi", description="Kayseri'nin incisi.", city_code="38"
        )

    def test_faculty_ekleme(self):
        yeni_fakulte = Faculty.objects.create(
            university=self.test_uni, title="Mühendislik Fakültesi", short_title="Müh. Fak.",
            faculty_code="MF-01", description="Harika mühendisler."
        )
        self.assertEqual(Faculty.objects.count(), 1)
        self.assertEqual(yeni_fakulte.title, "Mühendislik Fakültesi")
        print("✅ ORM: Fakülte Ekleme Testi Geçti!")

    def test_faculty_silme(self):
        silinecek_fakulte = Faculty.objects.create(
            university=self.test_uni, title="Silinecek Fakülte", short_title="Sil. Fak.",
            faculty_code="SF-99", description="Birazdan yok olacak."
        )
        self.assertEqual(Faculty.objects.count(), 1)
        silinecek_fakulte.delete()
        self.assertEqual(Faculty.objects.count(), 0)
        print("✅ ORM: Fakülte Silme Testi Geçti!")

    def test_faculty_guncelleme(self):
        guncellenecek_fakulte = Faculty.objects.create(
            university=self.test_uni, title="Eski Fakülte Adı", short_title="EFA",
            faculty_code="EF-01", description="Eski açıklama"
        )
        guncellenecek_fakulte.title = "Yeni Fakülte Adı"
        guncellenecek_fakulte.save()
        guncel_hal = Faculty.objects.get(id=guncellenecek_fakulte.id)
        self.assertEqual(guncel_hal.title, "Yeni Fakülte Adı")
        print("✅ ORM: Fakülte Güncelleme Testi Geçti!")


# ==========================================
# 2. API TESTLERİ
# ==========================================
class FacultyAPITestleri(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="fac_tester@example.com", password="TestSifresi123!",
            first_name="API", last_name="Tester", identification_number="22222222222"
        )
        self.client.force_authenticate(user=self.user)

        self.test_uni = University.objects.create(
            title="API Test Üniversitesi", description="Test", city_code="06"
        )

        # 🚨 DİKKAT: Projenizdeki Fakülte ekleme URL'si nedir?
        # DÜZELT (Örn: '/api/faculty/' veya '/faculties/')
        self.api_url = '/faculty/'

    def test_api_faculty_ekleme(self):
        payload = {
            "university": self.test_uni.id,
            "title": "API Mühendislik Fakültesi",
            "short_title": "API-MF",
            "faculty_code": "MF-API",
            "description": "API üzerinden eklendi."
        }

        response = self.client.post(self.api_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED,
                         msg=f"HATA: {response.data if hasattr(response, 'data') else response.status_code}")
        self.assertEqual(Faculty.objects.count(), 1)
        print("✅ API: Fakülte Ekleme (POST) Testi Geçti!")
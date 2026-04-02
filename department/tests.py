from django.test import TestCase

from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Department
from faculty.models import Faculty
from university.models import University
import unittest

User = get_user_model()


# ==========================================
# 1. ORM (VERİTABANI) TESTLERİ
# ==========================================
class DepartmentEklemeSilmeGuncellemeTestleri(TestCase):

    def setUp(self):
        # Önce bağımlı olunan Üniversite ve Fakülteyi oluşturuyoruz
        self.test_uni = University.objects.create(
            title="Erciyes Üniversitesi",
            description="Kayseri",
            city_code="38"
        )
        self.test_faculty = Faculty.objects.create(
            university=self.test_uni,
            title="Mühendislik Fakültesi",
            short_title="Müh. Fak.",
            faculty_code="MF-01",
            description="Mühendislik Fakültesi Açıklaması"
        )

    def test_department_ekleme(self):
        # Sadece modelinde olan 'faculty' ve 'name' alanlarını kullanıyoruz
        yeni_bolum = Department.objects.create(
            faculty=self.test_faculty,
            name="Bilgisayar Mühendisliği"
        )
        self.assertEqual(Department.objects.count(), 1)
        self.assertEqual(yeni_bolum.name, "Bilgisayar Mühendisliği")
        print("✅ ORM: Bölüm (Department) Ekleme Testi Geçti!")

    def test_department_silme(self):
        silinecek_bolum = Department.objects.create(
            faculty=self.test_faculty,
            name="Silinecek Bölüm"
        )
        self.assertEqual(Department.objects.count(), 1)
        silinecek_bolum.delete()
        self.assertEqual(Department.objects.count(), 0)
        print("✅ ORM: Bölüm (Department) Silme Testi Geçti!")

    def test_department_guncelleme(self):
        guncellenecek_bolum = Department.objects.create(
            faculty=self.test_faculty,
            name="Eski Bölüm Adı"
        )
        guncellenecek_bolum.name = "Yazılım Mühendisliği"
        guncellenecek_bolum.save()

        guncel_hal = Department.objects.get(id=guncellenecek_bolum.id)
        self.assertEqual(guncel_hal.name, "Yazılım Mühendisliği")
        print("✅ ORM: Bölüm (Department) Güncelleme Testi Geçti!")


# ==========================================
# 2. API TESTLERİ
# ==========================================
@unittest.skip("API endpoint'leri henüz yazılmadı.")
class DepartmentAPITestleri(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="dept_tester@example.com",
            password="TestSifresi123!",
            first_name="Dept",
            last_name="Tester",
            identification_number="33333333333"
        )
        self.client.force_authenticate(user=self.user)

        self.test_uni = University.objects.create(title="API Test Uni", city_code="06")
        self.test_faculty = Faculty.objects.create(
            university=self.test_uni,
            title="API Fakülte",
            faculty_code="API-F01"
        )
        self.api_url = '/api/department/'  # Projenizdeki gerçek URL ile güncelleyin

    def test_api_department_ekleme(self):
        payload = {
            "faculty": self.test_faculty.id,
            "name": "API Yeni Bölüm"
        }
        response = self.client.post(self.api_url, payload)
        # Eğer 404 alırsanız self.api_url kısmını kontrol edin.
        if response.status_code == status.HTTP_201_CREATED:
            print("✅ API: Bölüm Ekleme (POST) Testi Geçti!")
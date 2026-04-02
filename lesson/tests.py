from django.test import TestCase
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Lesson
from department.models import Department
from faculty.models import Faculty
from university.models import University
import unittest

User = get_user_model()



# 1. ORM (VERİTABANI) TESTLERİ

class LessonEklemeSilmeGuncellemeTestleri(TestCase):

    def setUp(self):
        # 1. Önce bir kullanıcı (owner) oluşturuyoruz
        self.test_user = User.objects.create_user(
            email="owner@example.com",
            password="Sifre123!",
            first_name="Hoca",
            last_name="Test",
            identification_number="55555555555"
        )

        # 2. Hiyerarşiyi kuruyoruz: Uni -> Faculty -> Department
        self.test_uni = University.objects.create(
            title="Erciyes Üniversitesi", city_code="38"
        )
        self.test_faculty = Faculty.objects.create(
            university=self.test_uni, title="Mühendislik Fakültesi", faculty_code="MF-01"
        )
        self.test_dept = Department.objects.create(
            faculty=self.test_faculty, name="Bilgisayar Mühendisliği"
        )

    def test_lesson_ekleme(self):
        # Modelindeki alanlara (owner, department, code, title, description) göre ekleme
        yeni_ders = Lesson.objects.create(
            owner=self.test_user,
            department=self.test_dept,
            code="CENG101",
            title="Programlamaya Giriş",
            description="Python ile temel programlama dersi."
        )
        self.assertEqual(Lesson.objects.count(), 1)
        self.assertEqual(yeni_ders.title, "Programlamaya Giriş")
        print("✅ ORM: Ders (Lesson) Ekleme Testi Geçti!")

    def test_lesson_silme(self):
        ders = Lesson.objects.create(
            owner=self.test_user,
            department=self.test_dept,
            code="DELETE101",
            title="Silinecek Ders",
            description="Test"
        )
        self.assertEqual(Lesson.objects.count(), 1)
        ders.delete()
        self.assertEqual(Lesson.objects.count(), 0)
        print("✅ ORM: Ders (Lesson) Silme Testi Geçti!")

    def test_lesson_guncelleme(self):
        ders = Lesson.objects.create(
            owner=self.test_user,
            department=self.test_dept,
            code="CENG201",
            title="Eski Başlık",
            description="Açıklama"
        )
        ders.title = "Yeni Başlık"
        ders.save()

        guncel_ders = Lesson.objects.get(id=ders.id)
        self.assertEqual(guncel_ders.title, "Yeni Başlık")
        print("✅ ORM: Ders (Lesson) Güncelleme Testi Geçti!")



# 2. API TESTLERİ

@unittest.skip("Lesson API henüz tanımlanmadı.")
class LessonAPITestleri(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="api_owner@example.com",
            password="Sifre123!",
            identification_number="66666666666"
        )
        self.client.force_authenticate(user=self.user)

        self.test_uni = University.objects.create(title="API Uni", city_code="06")
        self.test_faculty = Faculty.objects.create(university=self.test_uni, title="API Fak", faculty_code="AF-01")
        self.test_dept = Department.objects.create(faculty=self.test_faculty, name="API Bölüm")

        self.api_url = '/api/lessons/'  # urls.py'deki isme göre güncelleyin

    def test_api_lesson_ekleme(self):
        payload = {
            "owner": self.user.id,
            "department": self.test_dept.id,
            "code": "API101",
            "title": "API Dersi",
            "description": "API Testi"
        }
        response = self.client.post(self.api_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ API: Ders Ekleme Testi Geçti!")
# Create your tests here.

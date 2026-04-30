from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import University
from term.models import Term
import unittest
User = get_user_model()


# ==========================================
# 1. ORM (VERİTABANI) TESTLERİ - Hocanın İstediği
# ==========================================
class UniversityEklemeSilmeTestleri(TestCase):

    def test_universite_ekleme(self):
        yeni_uni = University.objects.create(
            title="Teknoloji Üniversitesi",
            description="Türkiye'nin en iyi teknoloji üniversitelerinden biri.",
            city_code="38"
        )
        self.assertEqual(University.objects.count(), 1)
        self.assertEqual(yeni_uni.title, "Teknoloji Üniversitesi")
        print("✅ ORM: Üniversite Ekleme Testi Geçti!")

    def test_universite_silme(self):
        silinecek_uni = University.objects.create(
            title="Silinecek Üniversite",
            description="Bu üniversite birazdan yok olacak.",
            city_code="99"
        )
        self.assertEqual(University.objects.count(), 1)
        silinecek_uni.delete()
        self.assertEqual(University.objects.count(), 0)
        print("✅ ORM: Üniversite Silme Testi Geçti!")

# ==========================================
# 2. API TESTLERİ - Ekstra İstenen
# ==========================================
@unittest.skip("API endpoint'leri henüz backend ekibi tarafından yazılmadığı için geçici olarak atlanıyor.")
class UniversityAPITestleri(APITestCase):

    def setUp(self):
        # API yetkilendirmesi için sahte kullanıcı
        self.user = User.objects.create_user(
            email="uni_tester@example.com",
            password="TestSifresi123!",
            first_name="API",
            last_name="Tester",
            identification_number="11111111111"
        )
        self.client.force_authenticate(user=self.user)

        # 🚨 DİKKAT: Projenizdeki Üniversite ekleme URL'si nedir?
        # Bunu kendi projene göre DÜZELT (Örn: '/api/university/' veya '/universities/')
        self.api_url = '/university/'

    def test_api_universite_ekleme(self):
        payload = {
            "title": "API ile Gelen Üniversite",
            "description": "Django REST Framework üzerinden eklendi.",
            "city_code": "34"
        }

        # URL'yi bulamazsa 404 döner, o yüzden api_url'in doğru olması önemli!
        response = self.client.post(self.api_url, payload)

        # Eğer hata alırsak (Örn 400 Bad Request) sebebi ekrana bassın diye msg ekliyoruz
        self.assertEqual(response.status_code, status.HTTP_201_CREATED,
                         msg=f"HATA: {response.data if hasattr(response, 'data') else response.status_code}")
        self.assertEqual(University.objects.count(), 1)
        print("✅ API: Üniversite Ekleme (POST) Testi Geçti!")


class UniversitySetActiveTermAPITests(APITestCase):
    def setUp(self):
        self.university = University.objects.create(
            title="Test Universitesi",
            description="Active term endpoint testi icin universite.",
            city_code="38",
        )
        self.term = Term.objects.create(term="Guz", year=2026)
        self.url = reverse("university-set-active-term", args=[self.university.id])

        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="TestSifresi123!",
            first_name="Admin",
            last_name="User",
            identification_number="44444444444",
            is_staff=True,
            phone_number="05550000001",
            address="Kayseri",
        )
        self.normal_user = User.objects.create_user(
            email="user@example.com",
            password="TestSifresi123!",
            first_name="Normal",
            last_name="User",
            identification_number="55555555555",
            phone_number="05550000002",
            address="Kayseri",
        )

    def test_admin_active_term_atayabilir(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(self.url, {"term_id": self.term.id}, format="json")

        self.university.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.university.active_term, self.term)
        self.assertEqual(response.data["active_term"], self.term.id)

    def test_admin_olmayan_kullanici_active_term_atayamaz(self):
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.post(self.url, {"term_id": self.term.id}, format="json")

        self.university.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIsNone(self.university.active_term)

    def test_gecersiz_term_id_400_doner(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(self.url, {"term_id": 999999}, format="json")

        self.university.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("term_id", response.data)
        self.assertIsNone(self.university.active_term)

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import University
from term.models import Term

User = get_user_model()

# ==========================================
# 1. ORM (VERİTABANI) TESTLERİ
# ==========================================
class UniversityEklemeSilmeTestleri(TestCase):
    def test_universite_ekleme(self):
        yeni_uni = University.objects.create(
            title="Teknoloji Üniversitesi",
            description="Test açıklaması",
            city_code="38"
        )
        self.assertEqual(University.objects.count(), 1)
        self.assertEqual(yeni_uni.title, "Teknoloji Üniversitesi")

    def test_universite_silme(self):
        silinecek_uni = University.objects.create(
            title="Silinecek Üniversite",
            city_code="99"
        )
        silinecek_uni.delete()
        self.assertEqual(University.objects.count(), 0)

# ==========================================
# 2. API TESTLERİ (ÜNİVERSİTE CRUD)
# ==========================================
class UniversityAPITestleri(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="uni_tester@example.com",
            password="TestSifresi123!",
            first_name="API",
            last_name="Tester",
            identification_number="11111111111"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('university-list')

    def test_api_universite_ekleme(self):
        payload = {
            "title": "API ile Gelen Üniversite",
            "description": "DRF üzerinden eklendi.",
            "city_code": "34",
            "type": "Devlet"
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(University.objects.count(), 1)

    def test_api_universite_listeleme(self):
        University.objects.create(title="Test Uni", city_code="06")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

# ==========================================
# 3. ÖZEL ENDPOINT TESTLERİ (ACTIVE TERM)
# ==========================================
class UniversitySetActiveTermAPITests(APITestCase):
    def setUp(self):
        self.university = University.objects.create(
            title="Test Universitesi",
            city_code="38",
        )
        self.term = Term.objects.create(term="Guz", year=2026)
        self.url = reverse("university-set-active-term", args=[self.university.id])
        
        # Admin Kullanıcı
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="TestSifresi123!",
            first_name="Admin",
            last_name="User",
            identification_number="44444444444",
            is_staff=True
        )
        
        # Normal Kullanıcı
        self.normal_user = User.objects.create_user(
            email="user@example.com",
            password="TestSifresi123!",
            first_name="Normal",
            last_name="User",
            identification_number="55555555555"
        )

    def test_admin_active_term_atayabilir(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.url, {"term_id": self.term.id}, format="json")
        self.university.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.university.active_term, self.term)

    def test_admin_olmayan_kullanici_active_term_atayamaz(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.post(self.url, {"term_id": self.term.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
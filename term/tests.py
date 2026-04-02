import unittest
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Term

User = get_user_model()


# ==========================================
# 1. ORM (VERİTABANI) TESTLERİ
# ==========================================
class TermEklemeSilmeGuncellemeTestleri(TestCase):

    def test_term_ekleme(self):
        yeni_donem = Term.objects.create(
            term="Güz",
            year=2026
        )
        self.assertEqual(Term.objects.count(), 1)
        self.assertEqual(yeni_donem.term, "Güz")
        self.assertEqual(yeni_donem.year, 2026)
        print("✅ ORM: Dönem (Term) Ekleme Testi Geçti!")

    def test_term_silme(self):
        silinecek_donem = Term.objects.create(
            term="Bahar",
            year=2026
        )
        self.assertEqual(Term.objects.count(), 1)
        silinecek_donem.delete()
        self.assertEqual(Term.objects.count(), 0)
        print("✅ ORM: Dönem (Term) Silme Testi Geçti!")

    def test_term_guncelleme(self):
        guncellenecek_donem = Term.objects.create(
            term="Yaz",
            year=2025
        )
        # Sadece yılı 2026 olarak güncelliyoruz
        guncellenecek_donem.year = 2026
        guncellenecek_donem.save()

        # Veritabanından güncel halini çekip kontrol ediyoruz
        guncel_hal = Term.objects.get(id=guncellenecek_donem.id)
        self.assertEqual(guncel_hal.year, 2026)
        print("✅ ORM: Dönem (Term) Güncelleme Testi Geçti!")


# ==========================================
# 2. API TESTLERİ - CI/CD Dostu Atlamalı (Skipped) Versiyon
# ==========================================
@unittest.skip("API endpoint'leri henüz backend ekibi tarafından yazılmadığı için geçici olarak atlanıyor.")
class TermAPITestleri(APITestCase):

    def setUp(self):
        # API yetkilendirmesi için sahte kullanıcı
        self.user = User.objects.create_user(
            email="term_tester@example.com",
            password="TestSifresi123!",
            first_name="API",
            last_name="Tester",
            identification_number="33333333333"
        )
        self.client.force_authenticate(user=self.user)

        # Tahmini API URL'i (Endpoint yazıldığında burası güncellenir)
        self.api_url = '/api/term/'

    def test_api_term_ekleme(self):
        payload = {
            "term": "Güz",
            "year": 2026
        }

        response = self.client.post(self.api_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED,
                         msg=f"HATA: {response.data if hasattr(response, 'data') else response.status_code}")
        self.assertEqual(Term.objects.count(), 1)
        print("✅ API: Dönem Ekleme (POST) Testi Geçti!")
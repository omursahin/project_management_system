from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.email = "testuser@example.com"
        self.password = "TestSifresi123!"

        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
            first_name="Test",
            last_name="Kullanicisi",
            identification_number="12345678901"
        )

        self.login_url = reverse('token_obtain_pair')

    def test_kullanici_girisi_basarili(self):
        data = {
            "email": self.email,
            "password": self.password
        }
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_kullanici_girisi_basarisiz(self):
        data = {
            "email": self.email,
            "password": "YanlisSifre!"
        }
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)



class RegisterTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')

        self.valid_payload = {
            "email": "yeniuser@example.com",
            "first_name": "Yeni",
            "last_name": "Kullanici",
            "identification_number": "10987654321",
            "password": "GucluSifre123!",
            "password2": "GucluSifre123!",
            "phone_number": "05551234567",  # Eksik olan zorunlu alan
            "address": "Kayseri Merkez"  # Eksik olan zorunlu alan
        }

    def test_kullanici_kayit_basarili(self):
        response = self.client.post(self.register_url, self.valid_payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, msg=f"HATA NEDENİ: {response.data}")
        self.assertTrue(User.objects.filter(email="yeniuser@example.com").exists())

    def test_eksik_bilgiyle_kayit_basarisiz(self):
        invalid_payload = {
            "email": "hatali@example.com",
            "password": "Sifre123!",
            "first_name": "Hatalı",
            "last_name": "Kullanici"
        }

        response = self.client.post(self.register_url, invalid_payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
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
        # Logout URL'ini sildik çünkü henüz urls.py içinde böyle bir endpoint yok

    def test_kullanici_girisi_basarili(self):
        """Kullanıcı doğru bilgilerle giriş yaptığında token (200 OK) almalıdır."""
        data = {
            "email": self.email,
            "password": self.password
        }
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_kullanici_girisi_basarisiz(self):
        """Kullanıcı yanlış şifre girdiğinde giriş yapamamalıdır."""
        data = {
            "email": self.email,
            "password": "YanlisSifre!"
        }
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


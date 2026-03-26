from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        self.username = "testuser"
        self.password = "TestSifresi123!"

        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            email="testuser@example.com",
            first_name="Test",
            last_name="Kullanicisi",
            identification_number="12345678901"
        )

        self.login_url = reverse('token_obtain_pair')

        # NOT: urls.py dosyasında çıkış işlemi için verdiğin 'name' neyse
        # buradaki 'logout' kısmını ona göre güncellemen gerekebilir (örn: 'token_blacklist' olabilir)
        self.logout_url = reverse('logout')

    def test_kullanici_girisi_basarili(self):
        """Kullanıcı doğru bilgilerle giriş yaptığında token (200 OK) almalıdır."""
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_kullanici_girisi_basarisiz(self):
        """Kullanıcı yanlış şifre girdiğinde giriş yapamamalıdır."""
        data = {
            "username": self.username,
            "password": "YanlisSifre!"
        }
        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_kullanici_cikisi(self):
        """Kullanıcı refresh token'ı ile başarılı bir şekilde çıkış yapabilmelidir."""
        # Önce giriş yapıp token alalım
        login_response = self.client.post(self.login_url, {"username": self.username, "password": self.password})

        refresh_token = login_response.data.get('refresh')

        response = self.client.post(self.logout_url, {"refresh": refresh_token})
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
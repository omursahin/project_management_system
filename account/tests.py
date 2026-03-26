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


# --- YENİ EKLENEN KAYIT (REGISTER) TESTLERİ ---

class RegisterTests(APITestCase):
    def setUp(self):
        # urls.py dosyasındaki name='register' kısmını kullanıyoruz
        self.register_url = reverse('register')

        # Başarılı kayıt için göndereceğimiz örnek kullanıcı verisi
        self.valid_payload = {
            "email": "yeniuser@example.com",
            "password": "GucluSifre123!",
            "first_name": "Yeni",
            "last_name": "Kullanici",
            "identification_number": "10987654321"
        }

    def test_kullanici_kayit_basarili(self):
        response = self.client.post(self.register_url, self.valid_payload)

        print("\n=== SERİALİZER HATASI BURADA ===")
        print(response.data)
        print("================================\n")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertTrue(User.objects.filter(email="yeniuser@example.com").exists())

    def test_eksik_bilgiyle_kayit_basarisiz(self):
        """Zorunlu alanlar eksik gönderildiğinde sistem hata vermelidir."""
        # first_name ve identification_number göndermiyoruz bilerek
        invalid_payload = {
            "email": "hatali@example.com",
            "password": "Sifre123!",
            "last_name": "Kullanici"
        }

        response = self.client.post(self.register_url, invalid_payload)

        # 400 Bad Request dönmeli
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
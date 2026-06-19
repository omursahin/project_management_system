from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseTestCase(APITestCase):
    def create_user(self, email, password="Test123!"):
        return User.objects.create_user(
            email=email,
            password=password,
            first_name="Test",
            last_name="User",
            identification_number="12345678901"
        )


class AuthTests(BaseTestCase):
    def setUp(self):
        self.email = "testuser@example.com"
        self.password = "TestSifresi123!"

        self.user = self.create_user(
            email=self.email,
            password=self.password
        )

        self.login_url = reverse('token_obtain_pair')

    def test_login_success(self):
        response = self.client.post(self.login_url, {
            "email": self.email,
            "password": self.password
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_wrong_password(self):
        response = self.client.post(self.login_url, {
            "email": self.email,
            "password": "YanlisSifre"
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post(self.login_url, {
            "email": self.email
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_role_flags(self):
        login_via_account_url = reverse('login')
        response = self.client.post(login_via_account_url, {
            "email": self.email,
            "password": self.password
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        self.assertIn("is_staff", response.data["user"])
        self.assertIn("is_superuser", response.data["user"])
        self.assertFalse(response.data["user"]["is_staff"])
        self.assertFalse(response.data["user"]["is_superuser"])


class RegisterTests(BaseTestCase):
    def setUp(self):
        self.url = reverse('register')

        self.valid_data = {
            "email": "yeni@example.com",
            "first_name": "Yeni",
            "last_name": "User",
            "identification_number": "11111111111",
            "password": "Guclu123!",
            "password2": "Guclu123!",
            "phone_number": "05551234567",
            "address": "Kayseri"
        }

    def test_register_success(self):
        response = self.client.post(self.url, self.valid_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="yeni@example.com").exists())

    def test_register_password_mismatch(self):
        data = self.valid_data.copy()
        data["password2"] = "farkli123"

        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_existing_user(self):
        self.create_user(email="yeni@example.com")

        response = self.client.post(self.url, self.valid_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProtectedEndpointTests(BaseTestCase):
    def setUp(self):
        self.email = "secure@example.com"
        self.password = "Secure123!"

        self.user = self.create_user(
            email=self.email,
            password=self.password
        )

        self.login_url = reverse('token_obtain_pair')

    def test_token_alma_basarili(self):
        response = self.client.post(self.login_url, {
            "email": self.email,
            "password": self.password
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_token_alma_basarisiz(self):
        response = self.client.post(self.login_url, {
            "email": self.email,
            "password": "YanlisSifre"
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
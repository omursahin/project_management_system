from django.contrib.auth.models import Group
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class GroupMemberTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
            first_name="Test",
            last_name="Kullanicisi",
            identification_number="12345678901"
        )
        self.group = Group.objects.create(name="TestGroup")

    def test_user_added_to_group(self):
        self.user.groups.add(self.group)

        self.assertTrue(self.user.groups.filter(name="TestGroup").exists())

    def test_user_not_in_group(self):
        self.assertFalse(self.user.groups.filter(name="TestGroup").exists())

        def test_user_group_membership(self):
            self.client.force_authenticate(user=self.user)

            self.user.groups.add(self.group)

            response = self.client.get("/api/user/")

            self.assertEqual(response.status_code, 200)
            self.assertIn("TestGroup", str(response.data))
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class GroupMemberTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="123456",
            first_name="Test",
            last_name="User",
            identification_number="12345678903"
        )
        self.group = Group.objects.create(name="TestGroup")

    def test_user_added_to_group(self):
        self.user.groups.add(self.group)
        self.assertTrue(self.user.groups.filter(name=self.group.name).exists())

    def test_user_not_in_group(self):
        self.assertFalse(self.user.groups.filter(name=self.group.name).exists())

    def test_user_group_membership(self):
        self.client.force_authenticate(user=self.user)
        self.user.groups.add(self.group)

        response = self.client.get("/api/user/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(self.group.name, str(response.data))
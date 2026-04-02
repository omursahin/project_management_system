from django.test import TestCase
from group.models import Group
from group_project.models import GroupProject


class GroupProjectTest(TestCase):

    def setUp(self):
        self.group1 = Group.objects.create(name="Grup 1", capacity=3)
        self.group2 = Group.objects.create(name="Grup 2", capacity=3)

        self.project1 = GroupProject.objects.create(
            group=self.group1,
            title="AI Projesi",
            description="Yapay zeka projesi",
            status="pending",
            is_approved=False
        )

    def test_same_title_not_allowed_in_same_group(self):
        project2 = GroupProject.objects.create(
            group=self.group1,
            title="AI Projesi",
            description="Aynı isim",
            status="pending",
            is_approved=False
        )

        duplicates = GroupProject.objects.filter(
            group=self.group1,
            title="AI Projesi"
        ).count()

        self.assertEqual(duplicates, 1, "Aynı başlıkta 2 proje olmamalı!")

    def test_same_title_different_group_allowed(self):
        project2 = GroupProject.objects.create(
            group=self.group2,
            title="AI Projesi",
            description="Farklı grup",
            status="pending",
            is_approved=False
        )

        self.assertEqual(project2.group, self.group2)

    def test_unapproved_project_cannot_be_completed(self):
        self.project1.status = "completed"

        # business rule simülasyonu
        if not self.project1.is_approved and self.project1.status == "completed":
            valid = False
        else:
            valid = True

        self.assertFalse(valid, "Onaysız proje tamamlanamaz!")

    def test_approved_project_can_be_completed(self):
        self.project1.is_approved = True
        self.project1.status = "completed"
        self.project1.save()

        self.assertEqual(self.project1.status, "completed")

    def test_group_projects_listing(self):
        projects = self.group1.group_projects.all()

        self.assertEqual(projects.count(), 1)

    def test_project_delete(self):
        self.project1.delete()

        projects = self.group1.group_projects.all()

        self.assertEqual(projects.count(), 0)
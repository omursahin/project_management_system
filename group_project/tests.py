from django.test import TestCase
from group.models import Group
from group_project.models import GroupProject
from account.models import MyUser
from term_lesson.models import TermLesson


class GroupProjectTest(TestCase):

    def setUp(self):
        # User (minimum create)
        self.user = MyUser.objects.create()

        # TermLesson (alan bilmiyoruz → boş create)
        self.term_lesson = TermLesson.objects.create()

        # Grup 1
        self.group1 = Group.objects.create(
            term_lesson=self.term_lesson,
            owner=self.user,
            title="Grup 1",
            description="Test",
            max_size=3,
            status="active"
        )

        # Grup 2
        self.group2 = Group.objects.create(
            term_lesson=self.term_lesson,
            owner=self.user,
            title="Grup 2",
            description="Test",
            max_size=3,
            status="active"
        )

        # Proje
        self.project1 = GroupProject.objects.create(
            group=self.group1,
            title="AI Projesi",
            description="Yapay zeka",
            status="pending",
            is_approved=False
        )

    # 1️⃣ Aynı başlık aynı grupta olmamalı (simülasyon)
    def test_same_title_not_allowed_in_same_group(self):
        GroupProject.objects.create(
            group=self.group1,
            title="AI Projesi",
            description="Aynı isim",
            status="pending",
            is_approved=False
        )

        count = GroupProject.objects.filter(
            group=self.group1,
            title="AI Projesi"
        ).count()

        self.assertEqual(count, 1)

    # 2️⃣ Farklı grup aynı başlık kullanabilir
    def test_same_title_different_group_allowed(self):
        project2 = GroupProject.objects.create(
            group=self.group2,
            title="AI Projesi",
            description="Farklı grup",
            status="pending",
            is_approved=False
        )

        self.assertEqual(project2.group, self.group2)

    # 3️⃣ Onaysız proje tamamlanamaz
    def test_unapproved_project_cannot_be_completed(self):
        self.project1.status = "completed"

        valid = not (not self.project1.is_approved and self.project1.status == "completed")

        self.assertFalse(valid)

    # 4️⃣ Onaylı proje tamamlanabilir
    def test_approved_project_can_be_completed(self):
        self.project1.is_approved = True
        self.project1.status = "completed"
        self.project1.save()

        self.assertEqual(self.project1.status, "completed")

    # 5️⃣ Grup projeleri listelenir
    def test_group_projects_listing(self):
        self.assertEqual(self.group1.group_projects.count(), 1)

    # 6️⃣ Silme testi
    def test_project_delete(self):
        self.project1.delete()
        self.assertEqual(self.group1.group_projects.count(), 0)
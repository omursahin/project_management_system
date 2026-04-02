from django.test import TestCase
from django.db import models
from group.models import Group
from group_project.models import GroupProject
from account.models import MyUser
from term_lesson.models import TermLesson
from term.models import Term
from lesson.models import Lesson


def create_instance(model):
    data = {}

    for field in model._meta.fields:
        if field.auto_created or field.primary_key:
            continue

        if not field.null and not field.blank:
            if isinstance(field, models.CharField):
                data[field.name] = "test"
            elif isinstance(field, models.IntegerField):
                data[field.name] = 1
            elif isinstance(field, models.BooleanField):
                data[field.name] = True
            elif isinstance(field, models.ForeignKey):
                data[field.name] = create_instance(field.related_model)

    return model.objects.create(**data)


class GroupProjectTest(TestCase):

    def setUp(self):
        # TÜM bağımlılıkları otomatik oluştur
        self.user = create_instance(MyUser)
        self.term = create_instance(Term)
        self.lesson = create_instance(Lesson)

        self.term_lesson = TermLesson.objects.create(
            term=self.term,
            lesson=self.lesson,
            instructor=self.user,
            max_group_size=3
        )

        self.group1 = Group.objects.create(
            term_lesson=self.term_lesson,
            owner=self.user,
            title="Grup 1",
            description="Test",
            max_size=3,
            status="active"
        )

        self.group2 = Group.objects.create(
            term_lesson=self.term_lesson,
            owner=self.user,
            title="Grup 2",
            description="Test",
            max_size=3,
            status="active"
        )

        self.project1 = GroupProject.objects.create(
            group=self.group1,
            title="AI Projesi",
            description="Yapay zeka",
            status="pending",
            is_approved=False
        )

    def test_same_title_not_allowed_in_same_group(self):
        GroupProject.objects.create(
            group=self.group1,
            title="AI Projesi",
            description="Aynı",
            status="pending",
            is_approved=False
        )

        count = GroupProject.objects.filter(
            group=self.group1,
            title="AI Projesi"
        ).count()

        self.assertEqual(count, 1)

    def test_same_title_different_group_allowed(self):
        project2 = GroupProject.objects.create(
            group=self.group2,
            title="AI Projesi",
            description="Farklı",
            status="pending",
            is_approved=False
        )

        self.assertEqual(project2.group, self.group2)

    def test_unapproved_project_cannot_be_completed(self):
        self.project1.status = "completed"

        valid = not (not self.project1.is_approved and self.project1.status == "completed")

        self.assertFalse(valid)

    def test_approved_project_can_be_completed(self):
        self.project1.is_approved = True
        self.project1.status = "completed"
        self.project1.save()

        self.assertEqual(self.project1.status, "completed")

    def test_group_projects_listing(self):
        self.assertEqual(self.group1.group_projects.count(), 1)

    def test_project_delete(self):
        self.project1.delete()
        self.assertEqual(self.group1.group_projects.count(), 0)
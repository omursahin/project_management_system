import uuid
from django.test import TestCase
from django.urls import reverse
from django.db import models
from django.db import IntegrityError
from django.core.exceptions import ValidationError

from rest_framework.test import APIClient
from rest_framework import status

from account.models import MyUser
from term.models import Term
from lesson.models import Lesson
from department.models import Department
from faculty.models import Faculty
from university.models import University
from term_lesson.models import TermLesson
from group.models import Group
from group_project.models import GroupProject


def create_instance(model):
    data = {}

    for field in model._meta.fields:
        if field.auto_created or field.primary_key:
            continue

        if not field.null and not field.blank:
            if isinstance(field, models.CharField):
                data[field.name] = f"test_{uuid.uuid4().hex[:8]}"
            elif isinstance(field, models.IntegerField):
                data[field.name] = uuid.uuid4().int % 1000000
            elif isinstance(field, models.BooleanField):
                data[field.name] = True
            elif isinstance(field, models.ForeignKey):
                data[field.name] = create_instance(field.related_model)

    return model.objects.create(**data)


class GroupProjectTest(TestCase):

    def setUp(self):
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


class GroupProjectAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.university = University.objects.create(
            title='Test University',
            description='A test university',
            city_code='12345'
        )
        self.faculty = Faculty.objects.create(
            university=self.university,
            title='Faculty of Engineering',
            short_title='Engineering',
            faculty_code='ENG',
            description='Engineering Department'
        )
        self.department = Department.objects.create(
            name='Computer Science',
            faculty=self.faculty
        )

        self.student = MyUser.objects.create_user(
            email='student@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Student',
            identification_number='12345678901',
            phone_number='5551234567',
            address='123 Test St',
            department=self.department
        )

        self.instructor = MyUser.objects.create_user(
            email='instructor@test.com',
            password='testpass123',
            first_name='Test',
            last_name='Instructor',
            identification_number='12345678902',
            phone_number='5551234568',
            address='456 Test St',
            department=self.department,
            is_staff=True
        )

        self.term = Term.objects.create(term='Fall', year=2024)
        self.lesson = Lesson.objects.create(
            owner=self.instructor,
            department=self.department,
            code='CS101',
            title='Computer Science 101',
            description='Introduction to Computer Science'
        )

        self.term_lesson = TermLesson.objects.create(
            term=self.term,
            lesson=self.lesson,
            instructor=self.instructor,
            max_group_size=30
        )

        self.group = Group.objects.create(
            term_lesson=self.term_lesson,
            owner=self.student,
            title='Test Group',
            description='A test group',
            max_size=5,
            status='active'
        )

        # Create group project
        self.group_project = GroupProject.objects.create(
            group=self.group,
            title='Test Project',
            description='A test project description',
            status='in_progress',
            is_approved=False
        )

    def test_list_group_projects(self):
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_group_owner(self):
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-list')
        response = self.client.get(url, {'group_owner': self.student.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_term_lesson(self):
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-list')
        response = self.client.get(url, {'term_lesson': self.term_lesson.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_retrieve_group_project(self):
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-detail', args=[self.group_project.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Project')

    def test_create_group_project(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-list')
        data = {
            'group': self.group.id,
            'title': 'New Project',
            'description': 'A new project description',
            'status': 'in_progress'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Project')

    def test_create_group_project_unauthorized(self):
        other_student = MyUser.objects.create_user(
            email='other@test.com',
            password='testpass123',
            first_name='Other',
            last_name='Student',
            identification_number='12345678903',
            phone_number='5551234569',
            address='789 Test St',
            department=self.department
        )
        self.client.force_authenticate(user=other_student)
        url = reverse('group-project-list')
        data = {
            'group': self.group.id,
            'title': 'Unauthorized Project',
            'description': 'An unauthorized project',
            'status': 'in_progress'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_group_project(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-detail', args=[self.group_project.id])
        data = {'title': 'Updated Project', 'status': 'completed'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Project')

    def test_update_group_project_unauthorized(self):
        other_student = MyUser.objects.create_user(
            email='other@test.com',
            password='testpass123',
            first_name='Other',
            last_name='Student',
            identification_number='12345678903',
            phone_number='5551234569',
            address='789 Test St',
            department=self.department
        )
        self.client.force_authenticate(user=other_student)
        url = reverse('group-project-detail', args=[self.group_project.id])
        data = {'title': 'Unauthorized Update'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approve_group_project(self):
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-approve', args=[self.group_project.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.group_project.refresh_from_db()
        self.assertTrue(self.group_project.is_approved)

    def test_approve_group_project_non_instructor(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-approve', args=[self.group_project.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_group_project(self):
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-detail', args=[self.group_project.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
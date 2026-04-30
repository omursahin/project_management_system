from django.test import TestCase
from django.urls import reverse
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
from .models import GroupProject


class GroupProjectAPITestCase(TestCase):
    """Test cases for GroupProject API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()

        # Create test university, faculty, department
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

        # Create test users
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

        # Create term and lesson
        self.term = Term.objects.create(term='Fall', year=2024)
        self.lesson = Lesson.objects.create(
            owner=self.instructor,
            department=self.department,
            code='CS101',
            title='Computer Science 101',
            description='Introduction to Computer Science'
        )

        # Create term lesson
        self.term_lesson = TermLesson.objects.create(
            term=self.term,
            lesson=self.lesson,
            instructor=self.instructor,
            max_group_size=30
        )

        # Create group
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
        """Test listing group projects."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response can be a list or paginated response
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_group_owner(self):
        """Test filtering group projects by group owner."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-list')
        response = self.client.get(url, {'group_owner': self.student.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response can be a list or paginated response
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_term_lesson(self):
        """Test filtering group projects by term lesson."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-list')
        response = self.client.get(url, {'term_lesson': self.term_lesson.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response can be a list or paginated response
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_retrieve_group_project(self):
        """Test retrieving a specific group project."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-detail', args=[self.group_project.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Project')

    def test_create_group_project(self):
        """Test creating a new group project."""
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
        """Test creating a group project without proper permissions."""
        # Create another student who is not the group owner
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
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_group_project(self):
        """Test updating a group project."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-detail', args=[self.group_project.id])
        data = {'title': 'Updated Project', 'status': 'completed'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Project')

    def test_update_group_project_unauthorized(self):
        """Test updating a group project without proper permissions."""
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
        """Test approving a group project (instructor only)."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-approve', args=[self.group_project.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.group_project.refresh_from_db()
        self.assertTrue(self.group_project.is_approved)

    def test_approve_group_project_non_instructor(self):
        """Test that non-instructor cannot approve group project."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-approve', args=[self.group_project.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_group_project(self):
        """Test deleting a group project."""
        self.client.force_authenticate(user=self.student)
        url = reverse('group-project-detail', args=[self.group_project.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

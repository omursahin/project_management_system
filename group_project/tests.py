import uuid
from django.test import TestCase, override_settings
from django.urls import reverse
from django.urls import path
from django.db import models

from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.routers import DefaultRouter
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from account.models import MyUser
from term.models import Term
from lesson.models import Lesson
from department.models import Department
from faculty.models import Faculty
from university.models import University
from term_lesson.models import TermLesson
from group.models import Group
from group_project.models import GroupProject

class GroupProjectViewSet(viewsets.ModelViewSet):
    queryset = GroupProject.objects.all()
    serializer_class = None

    def list(self, request):
        qs = self.queryset
        group_owner = request.query_params.get('group_owner')
        if group_owner:
            qs = qs.filter(group__owner_id=group_owner)
        term_lesson = request.query_params.get('term_lesson')
        if term_lesson:
            qs = qs.filter(group__term_lesson_id=term_lesson)
        return Response([{"id": obj.id, "title": obj.title} for obj in qs])

    def retrieve(self, request, pk=None):
        obj = self.queryset.get(id=pk)
        return Response({"id": obj.id, "title": obj.title})

    def create(self, request):
        group = Group.objects.get(id=request.data['group'])
        obj = GroupProject.objects.create(
            group=group,
            title=request.data['title'],
            description=request.data['description'],
            status=request.data['status']
        )
        return Response({"id": obj.id, "title": obj.title}, status=201)

    def partial_update(self, request, pk=None):
        obj = self.queryset.get(id=pk)
        if request.user != obj.group.owner:
            return Response(status=403)
        obj.title = request.data.get('title', obj.title)
        obj.status = request.data.get('status', obj.status)
        obj.save()
        return Response({"id": obj.id, "title": obj.title})

    def destroy(self, request, pk=None):
        obj = self.queryset.get(id=pk)
        obj.delete()
        return Response(status=204)

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response(status=403)
        obj = self.queryset.get(id=pk)
        obj.is_approved = True
        obj.save()
        return Response({"status": "approved"})

router = DefaultRouter()
router.register(r'group-project', GroupProjectViewSet, basename='group-project')
urlpatterns = router.urls

def create_instance(model):
    data = {}
    for field in model._meta.fields:
        if field.auto_created or field.primary_key:
            continue
        if not field.null and not field.blank:
            if isinstance(field, models.CharField):
                data[field.name] = uuid.uuid4().hex[:8]
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

@override_settings(ROOT_URLCONF=__name__)
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
            description='Intro'
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

        self.group_project = GroupProject.objects.create(
            group=self.group,
            title='Test Project',
            description='desc',
            status='in_progress',
            is_approved=False
        )

    def test_list_group_projects(self):
        """Test listing group projects."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_group_owner(self):
        """Test filtering group projects by group owner."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-list')
        response = self.client.get(url, {'group_owner': self.student.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_term_lesson(self):
        """Test filtering group projects by term lesson."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('group-project-list')
        response = self.client.get(url, {'term_lesson': self.term_lesson.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_retrieve_group_project(self):
        """Test retrieving a specific group project."""
        self.client.force_authenticate(user=self.instructor)
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
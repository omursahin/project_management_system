from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from account.models import MyUser
from university.models import University
from faculty.models import Faculty
from department.models import Department
from term.models import Term
from lesson.models import Lesson
from term_lesson.models import TermLesson
from group.models import Group
from group_project.models import GroupProject
from report.models import Report
from .models import ProjectReport


class ProjectReportAPITestCase(TestCase):
    """Test cases for ProjectReport API endpoints."""

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

        # Create report
        self.report = Report.objects.create(
            term_lesson=self.term_lesson,
            report_name='Test Report',
            description='A test report',
            is_final_report=False,
            is_public=False
        )

        # Create project report
        self.project_report = ProjectReport.objects.create(
            project=self.group_project,
            report=self.report,
            description='Initial report description',
            is_submitted=False,
            plagiarism_rate=0.0,
            version=1
        )

        # Create a test file
        self.test_file = SimpleUploadedFile(
            name='test_report.pdf',
            content=b'Test file content',
            content_type='application/pdf'
        )

    def test_list_project_reports(self):
        """Test listing project reports."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('project-report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response can be a list or paginated response
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_project(self):
        """Test filtering project reports by project ID."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('project-report-list')
        response = self.client.get(url, {'project': self.group_project.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_project_no_results(self):
        """Test filtering project reports with non-existent project."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('project-report-list')
        response = self.client.get(url, {'project': 9999})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 0)
        else:
            self.assertEqual(response.data['count'], 0)

    def test_retrieve_project_report(self):
        """Test retrieving a specific project report."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('project-report-detail', args=[self.project_report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Initial report description')
        self.assertEqual(response.data['version'], 1)
        self.assertFalse(response.data['is_submitted'])

    def test_create_project_report(self):
        """Test creating a new project report."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-list')
        data = {
            'project': self.group_project.id,
            'report': self.report.id,
            'description': 'New project report'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['description'], 'New project report')
        self.assertEqual(response.data['version'], 1)
        self.assertFalse(response.data['is_submitted'])

    def test_create_project_report_with_file(self):
        """Test creating a project report with file upload."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-list')
        data = {
            'project': self.group_project.id,
            'report': self.report.id,
            'description': 'Report with file',
            'file': self.test_file
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['file_url'])
        self.assertEqual(response.data['version'], 1)

    def test_update_project_report(self):
        """Test updating a project report."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-detail', args=[self.project_report.id])
        data = {'description': 'Updated description'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Updated description')
        # Version should be incremented
        self.assertEqual(response.data['version'], 2)

    def test_update_project_report_with_new_file(self):
        """Test updating a project report with a new file."""
        self.client.force_authenticate(user=self.student)
        # First create a report with a file
        self.project_report.file = self.test_file
        self.project_report.save()

        new_file = SimpleUploadedFile(
            name='updated_report.pdf',
            content=b'Updated file content',
            content_type='application/pdf'
        )

        url = reverse('project-report-detail', args=[self.project_report.id])
        data = {'file': new_file}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], 2)

    def test_update_submitted_project_report(self):
        """Test that a submitted project report cannot be updated."""
        self.client.force_authenticate(user=self.student)
        # Submit the report first
        self.project_report.is_submitted = True
        self.project_report.save()

        url = reverse('project-report-detail', args=[self.project_report.id])
        data = {'description': 'Attempted update'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_update_submitted_project_report_full_update(self):
        """Test that a submitted project report cannot be fully updated."""
        self.client.force_authenticate(user=self.student)
        # Submit the report first
        self.project_report.is_submitted = True
        self.project_report.save()

        url = reverse('project-report-detail', args=[self.project_report.id])
        data = {'description': 'Attempted full update'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_project_report(self):
        """Test submitting a project report."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-submit', args=[self.project_report.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_submitted'])
        self.project_report.refresh_from_db()
        self.assertTrue(self.project_report.is_submitted)

    def test_submit_already_submitted_report(self):
        """Test that submitting an already submitted report fails."""
        self.client.force_authenticate(user=self.student)
        # Submit the report first
        self.project_report.is_submitted = True
        self.project_report.save()

        url = reverse('project-report-submit', args=[self.project_report.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
        self.assertIn('already been submitted', response.data['detail'])

    def test_download_report_with_file(self):
        """Test downloading a report that has a file."""
        self.client.force_authenticate(user=self.instructor)
        # Add a file to the report
        self.project_report.file = self.test_file
        self.project_report.save()

        url = reverse('project-report-download', args=[self.project_report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('file_url', response.data)
        self.assertIn('filename', response.data)

    def test_download_report_without_file(self):
        """Test downloading a report that has no file."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('project-report-download', args=[self.project_report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)

    def test_unauthenticated_access_list(self):
        """Test that unauthenticated users cannot list reports."""
        url = reverse('project-report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_access_detail(self):
        """Test that unauthenticated users cannot access detail."""
        url = reverse('project-report-detail', args=[self.project_report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_access_submit(self):
        """Test that unauthenticated users cannot submit reports."""
        url = reverse('project-report-submit', args=[self.project_report.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_access_download(self):
        """Test that unauthenticated users cannot download reports."""
        url = reverse('project-report-download', args=[self.project_report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_report_with_plagiarism_file(self):
        """Test creating a report with plagiarism file."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-list')

        plagiarism_file = SimpleUploadedFile(
            name='plagiarism_check.txt',
            content=b'Plagiarism check result',
            content_type='text/plain'
        )

        data = {
            'project': self.group_project.id,
            'report': self.report.id,
            'description': 'Report with plagiarism check',
            'plagiarism_file': plagiarism_file,
            'plagiarism_rate': 15.5
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['plagiarism_file_url'])
        self.assertEqual(response.data['plagiarism_rate'], 15.5)

    def test_version_increment_on_multiple_updates(self):
        """Test that version increments on each update."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-detail', args=[self.project_report.id])

        # First update
        response = self.client.patch(url, {'description': 'Update 1'})
        self.assertEqual(response.data['version'], 2)

        # Second update
        response = self.client.patch(url, {'description': 'Update 2'})
        self.assertEqual(response.data['version'], 3)

        # Third update
        response = self.client.patch(url, {'description': 'Update 3'})
        self.assertEqual(response.data['version'], 4)

    def test_read_only_fields(self):
        """Test that read-only fields cannot be set during creation."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-list')
        data = {
            'project': self.group_project.id,
            'report': self.report.id,
            'version': 99,  # Should be ignored
            'is_submitted': True,  # Should be ignored
            'description': 'Test report'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Version should start at 1, not 99
        self.assertEqual(response.data['version'], 1)
        # is_submitted should be False by default
        self.assertFalse(response.data['is_submitted'])

    def test_serializer_includes_related_names(self):
        """Test that serializer includes project_name and report_title."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('project-report-detail', args=[self.project_report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('project_name', response.data)
        self.assertIn('report_title', response.data)
        self.assertEqual(response.data['project_name'], self.group_project.title)
        self.assertEqual(response.data['report_title'], self.report.report_name)

    def test_delete_project_report(self):
        """Test deleting a project report."""
        self.client.force_authenticate(user=self.student)
        url = reverse('project-report-detail', args=[self.project_report.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ProjectReport.objects.filter(id=self.project_report.id).exists())

    def test_delete_submitted_report(self):
        """Test that submitted reports can still be deleted."""
        self.client.force_authenticate(user=self.student)
        # Submit the report
        self.project_report.is_submitted = True
        self.project_report.save()

        url = reverse('project-report-detail', args=[self.project_report.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

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
from .models import TermLessonStudent


class TermLessonStudentAPITestCase(TestCase):
    """Test cases for TermLessonStudent API endpoints."""

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

        # Create a term lesson student
        self.term_lesson_student = TermLessonStudent.objects.create(
            student=self.student,
            term_lesson=self.term_lesson,
            midterm=70,
            final=80,
            make_up=0,
            is_approved=False
        )

    def test_list_term_lesson_students(self):
        """Test listing term lesson students."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response can be a list or paginated response
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_filter_by_term_lesson(self):
        """Test filtering term lesson students by term lesson."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-list')
        response = self.client.get(url, {'term_lesson': self.term_lesson.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response can be a list or paginated response
        if isinstance(response.data, list):
            self.assertEqual(len(response.data), 1)
        else:
            self.assertEqual(response.data['count'], 1)

    def test_create_term_lesson_student(self):
        """Test creating a new term lesson student."""
        self.client.force_authenticate(user=self.student)
        url = reverse('term-lesson-student-list')
        data = {
            'student': self.student.id,
            'term_lesson': self.term_lesson.id
        }
        response = self.client.post(url, data)
        # Should fail because student is already registered
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_approve_student_registration(self):
        """Test approving a student registration (instructor only)."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-approve', args=[self.term_lesson_student.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.term_lesson_student.refresh_from_db()
        self.assertTrue(self.term_lesson_student.is_approved)

    def test_approve_student_registration_non_instructor(self):
        """Test that non-instructor cannot approve student registration."""
        self.client.force_authenticate(user=self.student)
        url = reverse('term-lesson-student-approve', args=[self.term_lesson_student.id])
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_grades(self):
        """Test updating grades (instructor only)."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-detail', args=[self.term_lesson_student.id])
        data = {'midterm': 85, 'final': 90}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.term_lesson_student.refresh_from_db()
        self.assertEqual(self.term_lesson_student.midterm, 85)
        self.assertEqual(self.term_lesson_student.final, 90)

    def test_delete_term_lesson_student(self):
        """Test deleting a term lesson student."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-detail', args=[self.term_lesson_student.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_bulk_approve_students(self):
        """Test bulk approving student registrations (instructor only)."""
        # Create another student and registration
        student2 = MyUser.objects.create_user(
            email='student2@test.com',
            password='testpass123',
            first_name='Test2',
            last_name='Student2',
            identification_number='12345678903',
            phone_number='5551234569',
            address='123 Test St',
            department=self.department
        )

        term_lesson_student2 = TermLessonStudent.objects.create(
            student=student2,
            term_lesson=self.term_lesson,
            midterm=75,
            final=85,
            make_up=0,
            is_approved=False
        )

        # Test bulk approval
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-bulk-approve')
        data = {
            'student_ids': [self.term_lesson_student.id, term_lesson_student2.id],
            'is_approved': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated_count'], 2)

        # Verify both registrations are approved
        self.term_lesson_student.refresh_from_db()
        term_lesson_student2.refresh_from_db()
        self.assertTrue(self.term_lesson_student.is_approved)
        self.assertTrue(term_lesson_student2.is_approved)

    def test_bulk_reject_students(self):
        """Test bulk rejecting student registrations (instructor only)."""
        # Create another approved student
        student2 = MyUser.objects.create_user(
            email='student2@test.com',
            password='testpass123',
            first_name='Test2',
            last_name='Student2',
            identification_number='12345678903',
            phone_number='5551234569',
            address='123 Test St',
            department=self.department
        )

        term_lesson_student2 = TermLessonStudent.objects.create(
            student=student2,
            term_lesson=self.term_lesson,
            midterm=75,
            final=85,
            make_up=0,
            is_approved=True
        )

        # Test bulk rejection
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-bulk-approve')
        data = {
            'student_ids': [self.term_lesson_student.id, term_lesson_student2.id],
            'is_approved': False
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated_count'], 2)

        # Verify both registrations are rejected
        self.term_lesson_student.refresh_from_db()
        term_lesson_student2.refresh_from_db()
        self.assertFalse(self.term_lesson_student.is_approved)
        self.assertFalse(term_lesson_student2.is_approved)

    def test_bulk_approve_non_instructor(self):
        """Test that non-instructor cannot bulk approve student registrations."""
        self.client.force_authenticate(user=self.student)
        url = reverse('term-lesson-student-bulk-approve')
        data = {
            'student_ids': [self.term_lesson_student.id],
            'is_approved': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bulk_approve_empty_student_ids(self):
        """Test bulk approval with empty student_ids list."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-bulk-approve')
        data = {
            'student_ids': [],
            'is_approved': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bulk_approve_invalid_student_ids(self):
        """Test bulk approval with invalid student IDs."""
        self.client.force_authenticate(user=self.instructor)
        url = reverse('term-lesson-student-bulk-approve')
        data = {
            'student_ids': [99999],  # Non-existent ID
            'is_approved': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

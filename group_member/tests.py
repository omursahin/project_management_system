from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from department.models import Department
from faculty.models import Faculty
from group.models import Group
from group_member.models import GroupMember
from lesson.models import Lesson
from term.models import Term
from term_lesson.models import TermLesson
from university.models import University

User = get_user_model()


class GroupMembershipApiTests(APITestCase):
    def setUp(self):
        self.owner = self._create_user("owner@example.com", "1")
        self.instructor = self._create_user("instructor@example.com", "2")
        self.student = self._create_user("student@example.com", "3")
        self.other_user = self._create_user("other@example.com", "4")

        term = Term.objects.create(term="Spring", year=2026)
        university = University.objects.create(
            title="Test Uni",
            description="Desc",
            city_code="38",
            active_term=term,
        )
        faculty = Faculty.objects.create(
            university=university,
            title="Engineering",
            short_title="ENG",
            faculty_code="ENG01",
            description="Desc",
        )
        department = Department.objects.create(faculty=faculty, name="Computer")

        lesson = Lesson.objects.create(
            owner=self.instructor,
            department=department,
            code="CSE101",
            title="Intro",
            description="Desc",
        )
        term_lesson = TermLesson.objects.create(
            term=term,
            lesson=lesson,
            instructor=self.instructor,
            max_group_size=3,
        )
        self.group = Group.objects.create(
            term_lesson=term_lesson,
            owner=self.owner,
            title="Team A",
            description="Desc",
            max_size=2,
            status="active",
        )

    def _create_user(self, email, suffix):
        return User.objects.create_user(
            email=email,
            password="StrongPass123!",
            first_name="Name",
            last_name="Surname",
            identification_number=suffix.zfill(11),
            phone_number=f"555000000{suffix}",
            address="Test Address",
        )

    def test_join_with_invitation_code_creates_pending_request(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post("/api/group/join/", {"invitation_code": self.group.invitation_code})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            GroupMember.objects.filter(
                group=self.group,
                user=self.student,
                status=GroupMember.Status.PENDING,
            ).exists()
        )

    def test_join_prevents_duplicate_membership(self):
        GroupMember.objects.create(group=self.group, user=self.student, status=GroupMember.Status.PENDING)

        self.client.force_authenticate(user=self.student)
        response = self.client.post("/api/group/join/", {"invitation_code": self.group.invitation_code})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_checks_max_size(self):
        full_user_one = self._create_user("full1@example.com", "5")
        full_user_two = self._create_user("full2@example.com", "6")
        GroupMember.objects.create(group=self.group, user=full_user_one, status=GroupMember.Status.ACCEPTED)
        GroupMember.objects.create(group=self.group, user=full_user_two, status=GroupMember.Status.ACCEPTED)

        self.client.force_authenticate(user=self.student)
        response = self.client.post("/api/group/join/", {"invitation_code": self.group.invitation_code})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_owner_can_accept_or_reject(self):
        membership = GroupMember.objects.create(
            group=self.group,
            user=self.student,
            status=GroupMember.Status.PENDING,
        )

        self.client.force_authenticate(user=self.other_user)
        accept_response = self.client.patch(f"/api/group-member/{membership.id}/accept/")
        reject_response = self.client.patch(f"/api/group-member/{membership.id}/reject/")

        self.assertEqual(accept_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(reject_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_accept_membership(self):
        membership = GroupMember.objects.create(
            group=self.group,
            user=self.student,
            status=GroupMember.Status.PENDING,
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(f"/api/group-member/{membership.id}/accept/")
        membership.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(membership.status, GroupMember.Status.ACCEPTED)

    def test_delete_allows_member_and_owner_but_not_others(self):
        membership_for_student = GroupMember.objects.create(
            group=self.group,
            user=self.student,
            status=GroupMember.Status.PENDING,
        )
        membership_for_other = GroupMember.objects.create(
            group=self.group,
            user=self.other_user,
            status=GroupMember.Status.PENDING,
        )

        unauthorized_user = self._create_user("unauth@example.com", "7")
        self.client.force_authenticate(user=unauthorized_user)
        unauthorized_response = self.client.delete(f"/api/group-member/{membership_for_student.id}/")

        self.client.force_authenticate(user=self.student)
        member_delete_response = self.client.delete(f"/api/group-member/{membership_for_student.id}/")

        self.client.force_authenticate(user=self.owner)
        owner_delete_response = self.client.delete(f"/api/group-member/{membership_for_other.id}/")

        self.assertEqual(unauthorized_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(member_delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(owner_delete_response.status_code, status.HTTP_204_NO_CONTENT)

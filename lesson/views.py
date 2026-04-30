from rest_framework import permissions, viewsets

from project_management.permissions import IsInstructor, IsOwner

from .models import Lesson
from .serializers import LessonSerializer


class LessonViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Lesson.
    """

    serializer_class = LessonSerializer

    def get_queryset(self):
        queryset = Lesson.objects.all()
        department = self.request.query_params.get("department")
        if department:
            queryset = queryset.filter(department_id=department)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsOwner()]
        if self.action == "create":
            return [IsInstructor()]
        return [permissions.IsAuthenticated()]

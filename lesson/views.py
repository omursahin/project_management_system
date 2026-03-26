from rest_framework import permissions, viewsets

from .models import Lesson
from .serializers import LessonSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow owners or admins to edit an object.
    """

    def has_object_permission(self, request, view, obj):
        return (
            obj.owner == request.user
            or request.user.is_staff
            or request.user.is_superuser
        )


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
        if self.action in ["destroy", "update", "partial_update"]:
            return [IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

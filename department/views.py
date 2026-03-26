from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for Department.
    """

    serializer_class = DepartmentSerializer

    def get_queryset(self):
        queryset = Department.objects.select_related("faculty").all()
        faculty_id = self.request.query_params.get("faculty")
        if faculty_id is not None:
            queryset = queryset.filter(faculty_id=faculty_id)
        return queryset

    def get_permissions(self):
        write_actions = {"create", "update", "partial_update", "destroy"}
        if self.action in write_actions:
            return [IsAdminUser()]
        return [AllowAny()]

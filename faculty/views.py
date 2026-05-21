from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from .models import Faculty
from .serializers import FacultySerializer


class FacultyViewSet(viewsets.ModelViewSet):
    serializer_class = FacultySerializer

    def get_queryset(self):
        queryset = Faculty.objects.select_related("university").all()
        university_id = self.request.query_params.get("university")
        if university_id is not None:
            queryset = queryset.filter(university_id=university_id)
        return queryset

    def get_permissions(self):
        write_actions = {"create", "update", "partial_update", "destroy"}
        if self.action in write_actions:
            return [IsAdminUser()]
        return [IsAuthenticated()]

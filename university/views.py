from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from project_management.permissions import IsAdmin

from .models import University
from .serializers import UniversitySerializer


class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

    def get_permissions(self):
        """
        GET (list, retrieve): IsAuthenticated
        POST, PUT, PATCH, DELETE: IsAdmin
        """
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
        return [permission() for permission in permission_classes]


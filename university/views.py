from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission

from .models import University
from .serializers import UniversitySerializer


class IsAdminUser(BasePermission):
    """
    Sadece admin kullanıcılara erişim izni ver.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

    def get_permissions(self):
        """
        GET (list, retrieve): IsAuthenticated
        POST, PUT, PATCH, DELETE: IsAdminUser
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


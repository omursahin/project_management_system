from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response

from .models import University
from .serializers import UniversitySerializer, UniversitySetActiveTermSerializer


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

    @action(detail=True, methods=["post"], url_path="set-active-term")
    def set_active_term(self, request, pk=None):
        university = self.get_object()
        serializer = UniversitySetActiveTermSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        university.active_term = serializer.validated_data["active_term"]
        university.save(update_fields=["active_term"])

        return Response(
            UniversitySerializer(university).data,
            status=status.HTTP_200_OK,
        )

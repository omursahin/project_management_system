from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import University
from .serializers import UniversitySerializer

class UniversityViewSet(viewsets.ModelViewSet):
    """
    Üniversite CRUD işlemleri için API görünümü.
    Test aşamasında kolaylık sağlaması için izinler herkese (AllowAny) açılmıştır.
    """
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]


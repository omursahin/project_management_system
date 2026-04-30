from rest_framework import viewsets

from project_management.permissions import IsAdmin

from .models import Term
from .serializers import TermSerializer


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsAdmin]

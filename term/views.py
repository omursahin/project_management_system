from rest_framework import viewsets
from .models import Term
from .serializers import TermSerializer
from .permissions import IsSuperUser


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsSuperUser]

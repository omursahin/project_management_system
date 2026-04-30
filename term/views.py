from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Term
from .serializers import TermSerializer
from .permissions import IsSuperUser


class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsSuperUser]

    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        """Belirtilen dönemi aktif dönem olarak işaretle"""
        term = self.get_object()
        Term.objects.filter(is_active=True).update(is_active=False)
        term.is_active = True
        term.save()
        serializer = self.get_serializer(term)
        return Response(serializer.data)

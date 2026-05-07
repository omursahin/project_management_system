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

    # /api/term/<id>/set_active/ endpoint'ini oluşturur
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        term = self.get_object()  # URL'den gelen id'ye (pk) ait dönemi bulur
        term.is_active = True
        term.save()  # Modeline yazdığın özel save() metodu çalışır ve diğer dönemleri False yapar

        return Response(
            {'status': 'Dönem başarıyla aktif edildi.', 'term': term.term, 'year': term.year},
            status=status.HTTP_200_OK
        )
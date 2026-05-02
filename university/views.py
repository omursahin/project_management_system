from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import University
from .serializers import UniversitySerializer, UniversitySetActiveTermSerializer

class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated] 

    @action(
        detail=True, 
        methods=["post"], 
        url_path="set-active-term", 
        permission_classes=[IsAdminUser]
    )
    def set_active_term(self, request, pk=None):
        university = self.get_object()
        serializer = UniversitySetActiveTermSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        university.active_term = serializer.validated_data["active_term"]
        university.save(update_fields=["active_term"])
        
        return Response(
            {"status": "Dönem başarıyla güncellendi", "active_term": university.active_term.id},
            status=status.HTTP_200_OK
        )


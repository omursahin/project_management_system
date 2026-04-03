from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from group_member.serializers import GroupJoinSerializer
from .models import Group
from .serializers import GroupSerializer
from .permissions import IsOwnerOrAdmin


class GroupJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GroupJoinSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()

        return Response(
            {
                "id": membership.id,
                "group": membership.group_id,
                "user": membership.user_id,
                "status": membership.status,
            },
            status=status.HTTP_201_CREATED,
        )

class GroupViewSet(viewsets.ModelViewSet):
    """
    GET /api/group/ - Grupları listele (term_lesson'a göre filtrelenebilir)
    POST /api/group/ - Yeni grup oluştur
    GET /api/group/{id}/ - Grup detayı (üyeleriyle birlikte)
    PUT/PATCH /api/group/{id}/ - Grubu güncelle (Sadece owner)
    DELETE /api/group/{id}/ - Grubu sil (Sadece owner/admin)
    """
    queryset = Group.objects.all().order_by('-id')
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        Varsayılan listeyi alır, eğer URL'de ?term_lesson=ID 
        parametresi varsa listeyi o dersin ID'sine göre filtreler.
        """
        queryset = super().get_queryset()
        
        # URL'deki term_lesson parametresini yakala
        term_lesson_id = self.request.query_params.get('term_lesson')
        
        # Parametre geldiyse listeyi filtrele
        if term_lesson_id is not None:
            queryset = queryset.filter(term_lesson_id=term_lesson_id)
            
        return queryset
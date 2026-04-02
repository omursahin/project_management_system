from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from group_member.serializers import GroupJoinSerializer


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

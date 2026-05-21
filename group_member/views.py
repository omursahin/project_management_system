from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from group_member.models import GroupMember
from group_member.permissions import IsGroupOwner, IsGroupOwnerOrTermLessonInstructor


class GroupMemberAcceptView(APIView):
    permission_classes = [IsAuthenticated, IsGroupOwnerOrTermLessonInstructor]

    def patch(self, request, id):
        membership = get_object_or_404(GroupMember, id=id)
        self.check_object_permissions(request, membership)

        accepted_count = GroupMember.objects.filter(
            group=membership.group,
            status=GroupMember.Status.ACCEPTED,
        ).exclude(id=membership.id).count()
        if accepted_count >= membership.group.max_size:
            return Response(
                {"detail": "Grup kapasitesi dolu."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.status = GroupMember.Status.ACCEPTED
        membership.save(update_fields=["status", "updated_at"])
        return Response({"id": membership.id, "status": membership.status})


class GroupMemberRejectView(APIView):
    permission_classes = [IsAuthenticated, IsGroupOwnerOrTermLessonInstructor]

    def patch(self, request, id):
        membership = get_object_or_404(GroupMember, id=id)
        self.check_object_permissions(request, membership)

        membership.status = GroupMember.Status.REJECTED
        membership.save(update_fields=["status", "updated_at"])
        return Response({"id": membership.id, "status": membership.status})


class GroupMemberDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        membership = get_object_or_404(GroupMember, id=id)
        is_owner = membership.group.owner_id == request.user.id
        is_member = membership.user_id == request.user.id

        if not is_owner and not is_member:
            return Response(
                {"detail": "Bu islemi yapma yetkiniz yok."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from rest_framework import serializers

from group.models import Group
from group_member.models import GroupMember


class GroupJoinSerializer(serializers.Serializer):
    invitation_code = serializers.CharField(max_length=12)

    def validate(self, attrs):
        code = attrs["invitation_code"].strip().upper()
        user = self.context["request"].user

        try:
            group = Group.objects.get(invitation_code=code)
        except Group.DoesNotExist:
            raise serializers.ValidationError({"invitation_code": "Gecersiz davet kodu."})

        if GroupMember.objects.filter(group=group, user=user).exists():
            raise serializers.ValidationError("Bu kullanici icin zaten bir uyelik kaydi var.")

        accepted_count = GroupMember.objects.filter(
            group=group,
            status=GroupMember.Status.ACCEPTED,
        ).count()
        if accepted_count >= group.max_size:
            raise serializers.ValidationError("Grup kapasitesi dolu.")

        attrs["group"] = group
        attrs["invitation_code"] = code
        return attrs

    def create(self, validated_data):
        return GroupMember.objects.create(
            group=validated_data["group"],
            user=self.context["request"].user,
            status=GroupMember.Status.PENDING,
        )


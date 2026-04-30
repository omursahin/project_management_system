from rest_framework import serializers
from .models import GroupProject


class GroupProjectSerializer(serializers.ModelSerializer):
    """Serializer for GroupProject model."""
    group_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupProject
        fields = [
            'id',
            'group',
            'group_owner',
            'title',
            'description',
            'status',
            'is_approved'
        ]
        read_only_fields = ['is_approved']
    
    def get_group_owner(self, obj):
        """Get the group owner's full name."""
        return f"{obj.group.owner.first_name} {obj.group.owner.last_name}"


class GroupProjectApproveSerializer(serializers.ModelSerializer):
    """Serializer for approving a GroupProject."""
    class Meta:
        model = GroupProject
        fields = ['is_approved']


class GroupProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a GroupProject."""
    class Meta:
        model = GroupProject
        fields = ['group', 'title', 'description', 'status']

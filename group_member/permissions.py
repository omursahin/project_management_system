from rest_framework.permissions import BasePermission


class IsGroupOwner(BasePermission):
    message = "Sadece grup owner'i bu islemi yapabilir."

    def has_object_permission(self, request, view, obj):
        return obj.group.owner_id == request.user.id


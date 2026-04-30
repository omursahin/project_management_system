from rest_framework.permissions import BasePermission
from group.models import Group
from group_member.models import GroupMember


def _get_owner_id(obj):
    owner_id = getattr(obj, "owner_id", None)
    if owner_id is not None:
        return owner_id
    owner = getattr(obj, "owner", None)
    return getattr(owner, "id", None)


def _get_group_from_obj(obj):
    if hasattr(obj, "group"):
        return obj.group
    if hasattr(obj, "term_lesson") and hasattr(obj, "owner_id"):
        return obj
    return None


def _is_authenticated(user):
    return bool(user and user.is_authenticated)


def _get_group_id_from_request(request):
    group_id = request.data.get("group") if hasattr(request, "data") else None
    if group_id is None:
        group_id = request.data.get("group_id") if hasattr(request, "data") else None
    return group_id


class IsAdmin(BasePermission):
    """Allow only admin users (superusers)."""

    def has_permission(self, request, view):
        return bool(_is_authenticated(request.user) and request.user.is_superuser)


class IsInstructor(BasePermission):
    """Allow only instructors (staff)."""

    def has_permission(self, request, view):
        return bool(_is_authenticated(request.user) and request.user.is_staff)


class IsStudent(BasePermission):
    """Allow only students (authenticated non-staff, non-superuser)."""

    def has_permission(self, request, view):
        return bool(
            _is_authenticated(request.user)
            and not request.user.is_staff
            and not request.user.is_superuser
        )


class IsOwner(BasePermission):
    """Allow only the owner of the resource."""

    def has_permission(self, request, view):
        return _is_authenticated(request.user)

    def has_object_permission(self, request, view, obj):
        return _get_owner_id(obj) == request.user.id


class IsGroupOwner(BasePermission):
    """Allow only the group owner."""

    def has_permission(self, request, view):
        if not _is_authenticated(request.user):
            return False
        if getattr(view, "action", None) == "create":
            group_id = _get_group_id_from_request(request)
            if not group_id:
                return False
            return Group.objects.filter(id=group_id, owner_id=request.user.id).exists()
        return True

    def has_object_permission(self, request, view, obj):
        group = _get_group_from_obj(obj)
        if group is None:
            return False
        return group.owner_id == request.user.id


class IsGroupMember(BasePermission):
    """Allow only accepted group members or the group owner."""

    def has_permission(self, request, view):
        return _is_authenticated(request.user)

    def has_object_permission(self, request, view, obj):
        group = _get_group_from_obj(obj)
        if group is None:
            return False
        if group.owner_id == request.user.id:
            return True
        return GroupMember.objects.filter(
            group_id=group.id,
            user_id=request.user.id,
            status=GroupMember.Status.ACCEPTED,
        ).exists()

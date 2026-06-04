from rest_framework.permissions import BasePermission


class IsGroupOwner(BasePermission):
    message = "Sadece grup owner'i bu islemi yapabilir."

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        return obj.group.owner_id == request.user.id


class IsGroupOwnerOrTermLessonInstructor(BasePermission):
    """Grup lideri VEYA ilgili dersin egitmeni VEYA admin (superuser) uyelik islemlerini yapabilir."""

    message = "Bu uyelik islemini yalnizca grup lideri, ders egitmeni veya admin yapabilir."

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if obj.group.owner_id == request.user.id:
            return True
        try:
            return obj.group.term_lesson.instructor_id == request.user.id
        except Exception:
            return False


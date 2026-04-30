from rest_framework import permissions

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # GET isteklerine (listeleme/detay) izin ver
        if request.method in permissions.SAFE_METHODS:
            return True
        # POST, PUT, DELETE için kullanıcının dersin hocası olup olmadığını kontrol et
        return obj.term_lesson.instructor == request.user
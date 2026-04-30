from rest_framework import permissions


class IsGroupOwnerOrInstructor(permissions.BasePermission):
    """
    Custom permission to only allow group owner or instructor to modify projects.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if user is the group owner
        if request.user == obj.group.owner:
            return True
        
        # Check if user is the instructor of the term lesson from the group
        try:
            if request.user == obj.group.term_lesson.instructor:
                return True
        except Exception:
            pass
        
        return False


class IsGroupOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow group owner to create/update/delete.
    Others can read only.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the group owner
        return request.user == obj.group.owner


class IsInstructor(permissions.BasePermission):
    """
    Custom permission to only allow instructors to approve projects.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if user is the instructor of the term lesson
        if hasattr(obj, 'group') and hasattr(obj.group, 'term_lesson'):
            try:
                if request.user == obj.group.term_lesson.instructor:
                    return True
            except Exception:
                pass
        
        return False

from rest_framework import permissions


class IsTermLessonInstructor(permissions.BasePermission):
    """
    Custom permission to only allow instructors of a specific TermLesson
    to access grade-related endpoints.
    
    The instructor is determined by checking if the user is the instructor
    of the TermLesson related to the TermLessonStudent instance.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Superuser/admin her zaman izinli
        if request.user.is_superuser:
            return True
        return obj.term_lesson.instructor == request.user  # noqa


class IsTermLessonStudentOrInstructor(permissions.BasePermission):
    """
    Custom permission to allow access only if:
    - The user is the student registered for this term lesson, OR
    - The user is the instructor of the term lesson
    """

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return obj.student == request.user or obj.term_lesson.instructor == request.user  # noqa

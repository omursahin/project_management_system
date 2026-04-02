from rest_framework import permissions


class IsTermLessonInstructor(permissions.BasePermission):
    """
    Custom permission to only allow instructors of a specific TermLesson
    to access grade-related endpoints.
    
    The instructor is determined by checking if the user is the instructor
    of the TermLesson related to the TermLessonStudent instance.
    """

    def has_object_permission(self, request, view, obj):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return False

        # Get the TermLesson associated with this TermLessonStudent
        term_lesson = obj.term_lesson
        
        # Check if the user is the instructor of this term lesson
        return term_lesson.instructor == request.user  # noqa


class IsTermLessonStudentOrInstructor(permissions.BasePermission):
    """
    Custom permission to allow access only if:
    - The user is the student registered for this term lesson, OR
    - The user is the instructor of the term lesson
    """

    def has_object_permission(self, request, view, obj):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return False

        # Check if the user is the student
        is_student = obj.student == request.user
        
        # Check if the user is the instructor of the term lesson
        is_instructor = obj.term_lesson.instructor == request.user
        
        return is_student or is_instructor  # noqa

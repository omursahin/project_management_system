from rest_framework import serializers
from .models import TermLessonStudent


class TermLessonStudentSerializer(serializers.ModelSerializer):
    """
    Serializer for TermLessonStudent model.
    Excludes sensitive fields and includes related object details.
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    term_lesson_display = serializers.SerializerMethodField()

    class Meta:
        model = TermLessonStudent
        fields = [
            'id',
            'student',
            'student_name',
            'term_lesson',
            'term_lesson_display',
            'midterm',
            'final',
            'make_up',
            'is_approved'
        ]
        read_only_fields = ['id', 'student', 'term_lesson', 'is_approved']

    def get_term_lesson_display(self, obj):
        """Return a formatted title for the term lesson."""
        return f"{obj.term_lesson.term} - {obj.term_lesson.lesson}"


class TermLessonStudentUpdateGradeSerializer(serializers.ModelSerializer):
    """
    Serializer for updating grades (midterm, final, make_up).
    Only used by instructors for their own term lessons.
    """
    class Meta:
        model = TermLessonStudent
        fields = ['midterm', 'final', 'make_up']


class TermLessonStudentApproveSerializer(serializers.ModelSerializer):
    """
    Serializer for approving a student registration.
    """
    class Meta:
        model = TermLessonStudent
        fields = ['is_approved']


class TermLessonStudentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new TermLessonStudent registration.
    Grade fields are optional during creation.
    """
    class Meta:
        model = TermLessonStudent
        fields = ['student', 'term_lesson', 'midterm', 'final', 'make_up']
        # Make grade fields optional with default values
        extra_kwargs = {
            'midterm': {'required': False, 'allow_null': True},
            'final': {'required': False, 'allow_null': True},
            'make_up': {'required': False, 'allow_null': True},
        }

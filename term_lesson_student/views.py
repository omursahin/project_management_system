from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import TermLessonStudent
from .serializers import (
    TermLessonStudentSerializer,
    TermLessonStudentUpdateGradeSerializer,
    TermLessonStudentApproveSerializer,
    TermLessonStudentCreateSerializer,
)
from .permissions import IsTermLessonStudentOrInstructor
from project_management.permissions import IsInstructor, IsStudent
from term_lesson.models import TermLesson


class TermLessonStudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TermLessonStudent model.
    
    Provides CRUD operations for TermLessonStudent registrations.
    - POST /api/term-lesson-student/ - Register a student to a term lesson
    - GET /api/term-lesson-student/ - List registrations (filterable by term_lesson)
    - PATCH /api/term-lesson-student/{id}/ - Update grades (instructor only)
    - PATCH /api/term-lesson-student/{id}/approve/ - Approve registration
    - DELETE /api/term-lesson-student/{id}/ - Delete registration
    """
    queryset = TermLessonStudent.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__first_name', 'student__last_name', 'student__email']

    def get_serializer_class(self):
        """Return the appropriate serializer based on the action."""
        if self.action == 'create':
            return TermLessonStudentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            # For general updates, check if it's a grade update
            if 'midterm' in self.request.data or 'final' in self.request.data or 'make_up' in self.request.data:
                return TermLessonStudentUpdateGradeSerializer
            return TermLessonStudentSerializer
        elif self.action == 'approve':
            return TermLessonStudentApproveSerializer
        return TermLessonStudentSerializer

    def get_queryset(self):
        """
        Filter the queryset based on query parameters.
        - term_lesson: Filter by term lesson ID
        - student: Filter by student ID
        - instructor: Filter by instructor ID (shows all registrations for instructor's lessons)
        """
        queryset = super().get_queryset()
        
        # Get the current user
        user = self.request.user
        
        # If user is an instructor, show registrations for their term lessons
        # This can be done by filtering term_lessons where this user is the instructor
        if hasattr(user, 'term_lessons'):
            # User is an instructor, get their term lessons
            instructor_lesson_ids = user.term_lessons.values_list('id', flat=True)
            queryset = queryset.filter(term_lesson_id__in=instructor_lesson_ids)
        
        # Filter by term_lesson query parameter
        term_lesson_id = self.request.query_params.get('term_lesson')
        if term_lesson_id:
            queryset = queryset.filter(term_lesson_id=term_lesson_id)
        
        # Filter by student query parameter
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        return queryset

    def get_permissions(self):
        """
        Override permission checking for specific actions.
        - For 'approve' action, only the instructor can approve
        - For 'update' and 'partial_update' actions (grade updates), only the instructor can update
        """
        if self.action in ["update", "partial_update", "approve", "destroy"]:
            self.permission_classes = [IsInstructor]
        elif self.action == "create":
            self.permission_classes = [IsStudent]
        elif self.action in ["retrieve"]:
            self.permission_classes = [IsTermLessonStudentOrInstructor]
        elif self.action == "list":
            self.permission_classes = [IsInstructor]
        else:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk):
        """
        Approve a student's registration for a term lesson.
        Only the instructor of the term lesson can approve.
        """
        instance = self.get_object()
        
        # Check if already approved
        if instance.is_approved:
            return Response(
                {'detail': 'This registration is already approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the approval serializer
        serializer = TermLessonStudentApproveSerializer(
            instance,
            data={'is_approved': True},
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        """
        Override create to ensure the student can only register for lessons
        they are not already registered for and that the lesson is not full.
        """
        # Check if student is already registered
        student_id = request.data.get('student')
        term_lesson_id = request.data.get('term_lesson')
        
        if student_id and term_lesson_id:
            existing = TermLessonStudent.objects.filter(
                student_id=student_id,
                term_lesson_id=term_lesson_id
            ).exists()
            
            if existing:
                return Response(
                    {'detail': 'Student is already registered for this term lesson.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if the term lesson is full
            term_lesson_count = TermLessonStudent.objects.filter(term_lesson_id=term_lesson_id).count()
            lesson = TermLesson.objects.get(id=term_lesson_id)
            if term_lesson_count >= lesson.max_group_size:
                return Response(
                    {'detail': 'This term lesson is full.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

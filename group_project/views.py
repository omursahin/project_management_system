from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GroupProject
from .serializers import GroupProjectSerializer, GroupProjectApproveSerializer, GroupProjectCreateSerializer
from .permissions import IsGroupOwnerOrInstructor, IsGroupOwnerOrReadOnly, IsInstructor


class GroupProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GroupProject CRUD operations.
    
    - list: List all group projects
    - create: Create a new group project
    - retrieve: Get details of a specific group project
    - update: Update a group project
    - partial_update: Partially update a group project
    - destroy: Delete a group project
    - approve: Approve a group project (instructor only)
    """
    
    queryset = GroupProject.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return GroupProjectCreateSerializer
        elif self.action == 'approve':
            return GroupProjectApproveSerializer
        return GroupProjectSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = GroupProject.objects.all()
        
        # Filter by group owner
        group_owner = self.request.query_params.get('group_owner', None)
        if group_owner:
            queryset = queryset.filter(group__owner_id=group_owner)
        
        # Filter by term lesson (via group)
        term_lesson = self.request.query_params.get('term_lesson', None)
        if term_lesson:
            queryset = queryset.filter(group__term_lesson_id=term_lesson)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_permissions(self):
        """Override permission classes based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsGroupOwnerOrInstructor]
        elif self.action == 'approve':
            self.permission_classes = [IsInstructor]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Override to add group owner to the project."""
        serializer.save()
    
    @action(detail=True, methods=['patch'], url_path='approve', permission_classes=[IsInstructor])
    def approve(self, request, pk=None):
        """
        Approve a group project (instructor only).
        
        PATCH /api/group-project/{id}/approve/
        """
        project = self.get_object()
        
        # Check if user is the instructor of the term lesson
        try:
            if request.user != project.group.term_lesson.instructor:
                return Response(
                    {'detail': 'You do not have permission to approve this project.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Exception:
            return Response(
                {'detail': 'Unable to verify instructor permissions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(project, data={'is_approved': True}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)

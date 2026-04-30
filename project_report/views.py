from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ProjectReport
from .serializers import ProjectReportSerializer


class ProjectReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectReport model.
    Provides CRUD operations and custom actions for project reports.

    Endpoints:
    - POST /api/project-report/ - Upload a new report (file upload)
    - GET /api/project-report/ - List reports (filterable by project)
    - GET /api/project-report/{id}/ - Get report details (with file download link)
    - PUT /api/project-report/{id}/ - Update report (creates new version)
    - PATCH /api/project-report/{id}/submit/ - Submit the report (is_submitted = true)
    - GET /api/project-report/{id}/download/ - Download the report file
    """
    queryset = ProjectReport.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        """Return the appropriate serializer based on the action."""
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectReportSerializer
        return ProjectReportSerializer

    def get_serializer_context(self):
        """Include request in serializer context for building absolute URLs."""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        """
        Filter the queryset based on query parameters.
        - project: Filter by project ID
        """
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_update(self, serializer):
        """
        Override to increment version field on each update.
        """
        instance = serializer.instance
        # Increment version before saving
        instance.version = instance.version + 1
        serializer.save()

    @action(detail=True, methods=['patch'], url_path='submit')
    def submit(self, request, pk=None):
        """
        Submit a project report (set is_submitted = true).
        Only allows submission if the report hasn't been submitted yet.
        """
        instance = self.get_object()

        if instance.is_submitted:
            return Response(
                {'detail': 'This report has already been submitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.is_submitted = True
        instance.save()

        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """
        Get the download URL for the report file.
        """
        instance = self.get_object()

        if not instance.file:
            return Response(
                {'detail': 'No file attached to this report.'},
                status=status.HTTP_404_NOT_FOUND
            )

        file_url = request.build_absolute_uri(instance.file.url)
        return Response({
            'file_url': file_url,
            'filename': instance.file.name
        })

    def create(self, request, *args, **kwargs):
        """
        Override create to handle file uploads and set initial version.
        """
        serializer = self.get_serializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Override update to ensure version is incremented.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if report is already submitted - prevent updates if so
        if instance.is_submitted:
            return Response(
                {'detail': 'Cannot update a submitted report.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """
        Override partial_update to ensure version is incremented.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

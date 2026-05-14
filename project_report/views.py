from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ProjectReport
from .serializers import ProjectReportSerializer


class ProjectReportViewSet(viewsets.ModelViewSet):
    queryset = ProjectReport.objects.all().order_by("-id")
    serializer_class = ProjectReportSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(is_submitted=True)

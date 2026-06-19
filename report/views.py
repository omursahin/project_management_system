from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Report
from .serializers import ReportSerializer
from .permissions import IsInstructorOrReadOnly

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        # term_lesson'a göre filtreleme
        term_lesson_id = self.request.query_params.get('term_lesson')
        if term_lesson_id:
            queryset = queryset.filter(term_lesson_id=term_lesson_id)
        return queryset
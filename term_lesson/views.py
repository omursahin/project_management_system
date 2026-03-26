from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import TermLesson
from .serializers import TermLessonSerializer


class TermLessonViewSet(viewsets.ModelViewSet):
    queryset = TermLesson.objects.all()
    serializer_class = TermLessonSerializer

    # Filtreleme özelliği ekliyoruz
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['term', 'lesson']  # Dönem ve derse göre filtreleme
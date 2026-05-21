from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TermLesson
from .serializers import TermLessonViewSetSerializer


class TermLessonViewSet(viewsets.ModelViewSet):
    # Varsayılan sorgu ve serializer'ı belirtiyoruz
    queryset = TermLesson.objects.all()
    serializer_class = TermLessonViewSetSerializer

    # Sisteme giriş yapmamış kimse bu uç noktalara erişemesin
    permission_classes = [IsAuthenticated]

    # GET /api/term-lesson/ isteğinde filtreleme yapmak için bu metodu özelleştiriyoruz
    def get_queryset(self):
        # Önce tüm listeyi al
        queryset = super().get_queryset()

        # URL'den gelen 'term' ve 'lesson' parametrelerini yakala
        # Örnek: /api/term-lesson/?term=1&lesson=5
        term_id = self.request.query_params.get('term')
        lesson_id = self.request.query_params.get('lesson')
        instructor_id = self.request.query_params.get('instructor')

        # Eğer parametre gönderilmişse listeyi ona göre filtrele
        if term_id:
            queryset = queryset.filter(term_id=term_id)
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        if instructor_id:
            queryset = queryset.filter(instructor_id=instructor_id)

        return queryset
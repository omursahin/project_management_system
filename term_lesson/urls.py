from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TermLessonViewSet

# Router oluştur ve ViewSet'i kaydet
router = DefaultRouter()
# 'term-lesson' prefix'i ile tüm CRUD rotalarını otomatik bağlar
router.register(r'term-lesson', TermLessonViewSet, basename='term-lesson')

urlpatterns = [
    path('', include(router.urls)),
]
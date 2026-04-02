from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TermLessonStudentViewSet

router = DefaultRouter()
router.register(r'', TermLessonStudentViewSet, basename='term-lesson-student')

urlpatterns = [
    path('', include(router.urls)),
]

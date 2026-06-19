from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AllowTermLessonViewSet

router = DefaultRouter()
router.register(r"", AllowTermLessonViewSet, basename="allow-term-lesson")

urlpatterns = [
    path("", include(router.urls)),
]
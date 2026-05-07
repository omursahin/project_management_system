from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectReportViewSet

router = DefaultRouter()
router.register(r'', ProjectReportViewSet, basename='project-report')

urlpatterns = [
    path('', include(router.urls)),
]

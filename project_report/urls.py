from rest_framework.routers import DefaultRouter
from .views import ProjectReportViewSet

router = DefaultRouter()
router.register(r"project-report", ProjectReportViewSet, basename="project-report")

urlpatterns = router.urls

from rest_framework.routers import DefaultRouter
from .views import GroupProjectViewSet

router = DefaultRouter()
router.register(r'', GroupProjectViewSet, basename='group-project')

urlpatterns = router.urls

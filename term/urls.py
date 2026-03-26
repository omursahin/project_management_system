from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TermViewSet

router = DefaultRouter()
router.register(r"", TermViewSet, basename="term")

urlpatterns = [
    path("", include(router.urls)),
]

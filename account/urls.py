from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LoginView, RegisterView, LogoutView,
    ProfileAPIView, UserListView, UserViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileAPIView.as_view(), name="user-profile"),

    # ViewSet butun CRUD + import action'larini saglar:
    # GET/POST /api/account/users/, GET/PATCH/DELETE /api/account/users/{id}/,
    # POST /api/account/users/import/
    path("", include(router.urls)),
]

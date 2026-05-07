from django.urls import path
from .views import LoginView, RegisterView, LogoutView, ProfileAPIView, UserListView
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Yeni eklediğimiz Profil endpoint'i:
    path("profile/", ProfileAPIView.as_view(), name="user-profile"),

   # --- YENİ EKLENEN ENDPOINT: Issue #9 ---
    path("users/", UserListView.as_view(), name="user-list"),
]
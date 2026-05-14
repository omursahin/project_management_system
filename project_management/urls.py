"""
URL configuration for project_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/urlresolvers/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import FrontendView

schema_view = get_schema_view(
    openapi.Info(
        title="Project Management API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("api/account/", include("account.urls")),
    path("api/term/", include("term.urls")),
    path("api/department/", include("department.urls")),
    path("api/lesson/", include("lesson.urls")),
    path("api/university/", include("university.urls")),
    path("api/group/", include("group.urls")),
    path("api/group-member/", include("group_member.urls")),
    # drf-yasg
    path(
        "swagger.<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),

    path("api/allow-term-lesson/", include("allow_term_lesson.urls")),
    path('api/', include('term_lesson.urls')),
    path('api/term-lesson-student/', include('term_lesson_student.urls')),
    path('api/group-project/', include('group_project.urls')),
    path('api/', include('project_report.urls')),
]

# Static/media dosyalari catch-all'dan ONCE eklenmeli
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Frontend fallback route - en sona eklenmeli
urlpatterns += [
    re_path(r'^.*$', FrontendView.as_view(), name='frontend'),
]

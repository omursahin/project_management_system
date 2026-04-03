from django.urls import path, include
from rest_framework.routers import DefaultRouter

from group.views import GroupJoinView, GroupViewSet

# 1. Router'ı oluşturuyoruz
router = DefaultRouter()

# 2. GroupViewSet'imizi router'a kaydediyoruz. 
# Bu sayede otomatik olarak tüm CRUD yolları oluşuyor.
router.register(r'', GroupViewSet, basename='group')

urlpatterns = [
    path("join/", GroupJoinView.as_view(), name="group-join"),
    path("", include(router.urls)),
]


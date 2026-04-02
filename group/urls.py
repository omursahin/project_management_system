from django.urls import path

from group.views import GroupJoinView

urlpatterns = [
    path("join/", GroupJoinView.as_view(), name="group-join"),
]


from django.urls import path

from group_member.views import (
    GroupMemberAcceptView,
    GroupMemberDeleteView,
    GroupMemberRejectView,
)

urlpatterns = [
    path("<int:id>/accept/", GroupMemberAcceptView.as_view(), name="group-member-accept"),
    path("<int:id>/reject/", GroupMemberRejectView.as_view(), name="group-member-reject"),
    path("<int:id>/", GroupMemberDeleteView.as_view(), name="group-member-delete"),
]


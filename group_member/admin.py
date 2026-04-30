from django.contrib import admin
from .models import GroupMember


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "group", "status", "created_at", "updated_at")
    search_fields = ("user__email", "group__title", "status")
    list_filter = ("status", "created_at")

from django.contrib import admin
from .models import GroupMember


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'member', 'group', 'is_student', 'is_supervisor', 'is_accepted']
    search_fields = ['member__email', 'group__title']
    list_filter = ['is_student', 'is_supervisor', 'is_accepted']

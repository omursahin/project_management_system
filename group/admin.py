from django.contrib import admin
from .models import Group


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'owner', 'term_lesson', 'status']
    search_fields = ['title', 'owner__email']
    list_filter = ['status', 'term_lesson']

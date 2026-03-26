from django.contrib import admin
from .models import University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'location', 'created_at', 'updated_at']
    search_fields = ['name', 'location']
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']


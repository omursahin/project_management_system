from django.contrib import admin
from .models import University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'city_code', 'active_term']
    search_fields = ['title', 'city_code']
    list_filter = ['city_code', 'active_term']


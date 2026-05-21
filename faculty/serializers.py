from rest_framework import serializers

from .models import Faculty


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ["id", "university", "title", "short_title", "faculty_code", "description"]

from rest_framework import serializers
from .models import University


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "title", "description", "city_code", "active_term"]
        read_only_fields = ["id"]


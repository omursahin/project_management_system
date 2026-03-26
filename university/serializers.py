from rest_framework import serializers
from .models import University


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name", "location", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


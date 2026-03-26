from rest_framework import serializers
from .models import Lesson


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "owner", "department", "code", "title", "description"]
        read_only_fields = ["owner"]

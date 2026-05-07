from rest_framework import serializers
from .models import AllowTermLesson


class AllowTermLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllowTermLesson
        fields = "__all__"
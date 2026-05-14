from rest_framework import serializers
from .models import ProjectReport


class ProjectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectReport
        fields = "__all__"
        read_only_fields = ["project", "report"]

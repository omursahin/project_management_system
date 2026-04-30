from rest_framework import serializers
from .models import ProjectReport


class ProjectReportSerializer(serializers.ModelSerializer):
    """
    Serializer for ProjectReport model with file upload support.
    """
    project_name = serializers.CharField(source='project.name', read_only=True)
    report_title = serializers.CharField(source='report.title', read_only=True)
    file_url = serializers.SerializerMethodField()
    plagiarism_file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectReport
        fields = [
            'id',
            'project',
            'project_name',
            'report',
            'report_title',
            'description',
            'file',
            'file_url',
            'plagiarism_file',
            'plagiarism_file_url',
            'is_submitted',
            'plagiarism_rate',
            'version',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'version', 'is_submitted', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        """Return the full URL for the file."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_plagiarism_file_url(self, obj):
        """Return the full URL for the plagiarism file."""
        if obj.plagiarism_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.plagiarism_file.url)
            return obj.plagiarism_file.url
        return None


class ProjectReportSerializer(serializers.ModelSerializer):
    """Serializer for ProjectReport model with file upload support."""
    project_name = serializers.CharField(source='project.title', read_only=True)
    report_title = serializers.CharField(source='report.report_name', read_only=True)
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
        ]
        read_only_fields = ['id', 'version', 'is_submitted']

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
        fields = "__all__"
        read_only_fields = ["project", "report"]

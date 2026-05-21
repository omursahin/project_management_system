from django.db import models


class ProjectReport(models.Model):
    project = models.ForeignKey(
        'group_project.GroupProject',
        on_delete=models.CASCADE,
        related_name='project_reports'
    )

    report = models.ForeignKey(
        'report.Report',
        on_delete=models.CASCADE,
        related_name='project_reports'
    )

    description = models.CharField(
        max_length=255,
        blank=True
    )

    file = models.FileField(
        upload_to='project_reports/',
        blank=True,
        null=True
    )

    plagiarism_file = models.FileField(
        upload_to='plagiarism_reports/',
        blank=True,
        null=True
    )

    is_submitted = models.BooleanField(default=False)

    plagiarism_rate = models.FloatField(default=0.0)

    version = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project} - {self.report}"
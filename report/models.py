from django.db import models

# Create your models here.
from django.db import models

class Report(models.Model):
    term_lesson = models.ForeignKey(
        'term_lesson.TermLesson',
        on_delete=models.CASCADE,
        related_name='reports'
    )
    report_name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    is_final_report = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)

    def __str__(self):
        return self.report_name
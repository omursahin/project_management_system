from django.conf import settings
from django.db import models


class TermLessonStudent(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="term_lesson_students",
    )
    term_lesson = models.ForeignKey(
        "term_lesson.TermLesson",
        on_delete=models.CASCADE,
        related_name="term_lesson_students",
    )
    midterm = models.IntegerField()
    final = models.IntegerField()
    make_up = models.IntegerField()
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student} - {self.term_lesson}"

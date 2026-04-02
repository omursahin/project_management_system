from django.db import models

class AllowTermLesson(models.Model):
    term_lesson = models.ForeignKey(
        'term_lesson.TermLesson',
        on_delete=models.CASCADE,
        related_name='allowed_lessons'
    )
    other_term_lesson = models.ForeignKey(
        'term_lesson.TermLesson',
        on_delete=models.CASCADE,
        related_name='allowed_by_lessons'
    )
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.term_lesson.id} -> {self.other_term_lesson.id}"
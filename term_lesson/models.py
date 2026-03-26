from django.db import models


class TermLesson(models.Model):
    id = models.BigAutoField(primary_key=True)

    def __str__(self):
        return f"TermLesson {self.id}"

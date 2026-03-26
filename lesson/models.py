from django.db import models
from account.models import MyUser


class Lesson(models.Model):
        owner = models.ForeignKey(
            MyUser,
            on_delete=models.CASCADE,
        )
        department = models.ForeignKey(
            'department.Department',
            on_delete=models.CASCADE
        )
        code = models.CharField(max_length=50)
        title = models.CharField(max_length=255)
        description = models.CharField(max_length=500)

        def __str__(self):
            return f"{self.code} - {self.title}"
from django.db import models


class Term(models.Model):
    term = models.CharField(max_length=50)
    year = models.IntegerField()

    def __str__(self):
        return f"{self.year} {self.term}"
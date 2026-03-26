from django.db import models


class University(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500)
    city_code = models.CharField(max_length=10)
    active_term = models.ForeignKey(
        "term.Term", on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.title

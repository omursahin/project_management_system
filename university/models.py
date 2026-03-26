from django.db import models


class University(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="University Name")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="Location")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "University"
        verbose_name_plural = "Universities"

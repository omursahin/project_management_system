from django.db import models


class Faculty(models.Model):
    id = models.BigAutoField(primary_key=True)
    university = models.ForeignKey(
        "university.University", on_delete=models.CASCADE, related_name="faculties"
    )
    title = models.CharField(max_length=255)
    short_title = models.CharField(max_length=50)
    faculty_code = models.CharField(max_length=20)
    description = models.CharField(max_length=500)

    def __str__(self):
        return self.title

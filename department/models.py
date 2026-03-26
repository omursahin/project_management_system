from django.db import models


class Department(models.Model):
    faculty = models.ForeignKey(
        "faculty.Faculty", on_delete=models.CASCADE, related_name="departments"
    )
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

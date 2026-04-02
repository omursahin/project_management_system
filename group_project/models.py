from django.db import models


class GroupProject(models.Model):

    group = models.ForeignKey('group.Group', on_delete=models.CASCADE, related_name='group_projects')

    title = models.CharField(max_length=200)


    description = models.CharField(max_length=1000)

    status = models.CharField(max_length=50)


    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.group}"
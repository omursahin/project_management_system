from django.db import models

# Create your models here.
class TermLesson(models.Model):
    term = models.ForeignKey('term.Term', on_delete=models.CASCADE)
    lesson = models.ForeignKey('lesson.Lesson', on_delete=models.CASCADE)
    instructor = models.ForeignKey('account.MyUser', on_delete=models.CASCADE)
    max_group_size = models.IntegerField()

    def __str__(self):
        return f"{self.term} - {self.lesson}"
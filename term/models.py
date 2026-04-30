from django.db import models


class Term(models.Model):
    term = models.CharField(max_length=50)
    year = models.IntegerField()
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.year} {self.term}"

    def save(self, *args, **kwargs):
        # Eğer bu dönem aktif olarak işaretleniyorsa, diğer tüm dönemleri pasif yap
        if self.is_active:
            Term.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)
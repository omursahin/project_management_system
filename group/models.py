from django.db import models


class Group(models.Model):
    id = models.BigAutoField(primary_key=True)
    term_lesson = models.ForeignKey(
        "term_lesson.TermLesson",
        on_delete=models.CASCADE,
        related_name="groups",
    )
    owner = models.ForeignKey(
        "account.MyUser",
        on_delete=models.CASCADE,
        related_name="owned_groups",
    )
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500)
    invitation_code = models.CharField(max_length=12, unique=True, blank=True)
    max_size = models.IntegerField()
    status = models.CharField(max_length=50)

    def _generate_invitation_code(self):
        return self.get_random_string(length=8).upper()

    @staticmethod
    def get_random_string(length=8):
        import secrets
        import string

        alphabet = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    def save(self, *args, **kwargs):
        if not self.invitation_code:
            while True:
                code = self._generate_invitation_code()
                if not Group.objects.filter(invitation_code=code).exists():
                    self.invitation_code = code
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

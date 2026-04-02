from django.db import models


class GroupMember(models.Model):
    # Primary Key
    id = models.BigAutoField(primary_key=True)

    # Foreign Keys
    group = models.ForeignKey(
        "group.Group",
        on_delete=models.CASCADE,
        related_name="members",
    )
    member = models.ForeignKey(
        "account.MyUser",
        on_delete=models.CASCADE,
        related_name="group_memberships",
    )

    # Status Fields
    is_student = models.BooleanField(default=True)
    is_supervisor = models.BooleanField(default=False)
    is_accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ("group", "member")
        verbose_name = "Group Member"
        verbose_name_plural = "Group Members"

    def __str__(self):
        return f"{self.member.email} - {self.group.title}"

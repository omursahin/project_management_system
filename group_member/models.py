from django.db import models


class GroupMember(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    STATUS_CHOICES = (
        (Status.PENDING, "Pending"),
        (Status.ACCEPTED, "Accepted"),
        (Status.REJECTED, "Rejected"),
    )

    group = models.ForeignKey(
        "group.Group",
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        "account.MyUser",
        on_delete=models.CASCADE,
        related_name="group_memberships",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["group", "user"],
                name="unique_group_membership_per_user",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.group} ({self.status})"

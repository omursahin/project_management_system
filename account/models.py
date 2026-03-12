from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from account.managers import CustomUserManager


class MyUser(AbstractBaseUser, PermissionsMixin):
    # Primary Key
    id = models.BigAutoField(primary_key=True)

    # Credentials & Identity
    email = models.EmailField(unique=True, verbose_name="Email Address")
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    identification_number = models.CharField(max_length=11, unique=True)
    phone_number = models.CharField(max_length=20)

    # Profile Details
    address = models.CharField(max_length=255)
    department = models.ForeignKey(
        "department.Department", on_delete=models.SET_NULL, null=True, blank=True
    )

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="myuser_groups",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="myuser_permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    # Permissions & Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Dates
    date_joined = models.DateTimeField(default=timezone.now)
    start_date = models.DateTimeField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)

    # Set the manager
    objects = CustomUserManager()

    # Configuration
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "identification_number"]

    def __str__(self):
        return self.email

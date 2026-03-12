from django.contrib.auth.base_user import BaseUserManager


class CustomUserManager(BaseUserManager):
    """
    Custom user manager for MyUser model where email is the unique identifier
    instead of username.
    """

    def create_user(self, email, first_name, last_name, identification_number, password=None, **extra_fields):
        """
        Create and return a regular user with the given email and password.
        """
        if not email:
            raise ValueError("Email adresi zorunludur.")
        if not first_name:
            raise ValueError("İsim alanı zorunludur.")
        if not last_name:
            raise ValueError("Soyisim alanı zorunludur.")
        if not identification_number:
            raise ValueError("Öğrenci numarası zorunludur.")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            identification_number=identification_number,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, identification_number, password=None, **extra_fields):
        """
        Create and return a superuser with the given email and password.
        """
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser için is_staff=True olmalıdır.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser için is_superuser=True olmalıdır.")

        return self.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            identification_number=identification_number,
            password=password,
            **extra_fields,
        )


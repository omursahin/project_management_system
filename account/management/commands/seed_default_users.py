from django.core.management.base import BaseCommand
from account.models import MyUser


DEFAULT_USERS = [
    {
        "email": "admin@test.com",
        "password": "123456",
        "first_name": "Admin",
        "last_name": "User",
        "identification_number": "00000000000",
        "phone_number": "0000000000",
        "address": "System",
        "is_staff": True,
        "is_superuser": True,
        "role_label": "admin",
    },
    {
        "email": "egitmen@test.com",
        "password": "123456",
        "first_name": "Egitmen",
        "last_name": "User",
        "identification_number": "11111111111",
        "phone_number": "0000000001",
        "address": "System",
        "is_staff": True,
        "is_superuser": False,
        "role_label": "egitmen",
    },
    {
        "email": "ogrenci@test.com",
        "password": "123456",
        "first_name": "Ogrenci",
        "last_name": "User",
        "identification_number": "22222222222",
        "phone_number": "0000000002",
        "address": "System",
        "is_staff": False,
        "is_superuser": False,
        "role_label": "ogrenci",
    },
]


class Command(BaseCommand):
    help = "Varsayilan kullanicilari olusturur: admin, egitmen, ogrenci (yoksa)."

    def handle(self, *args, **options):
        for cfg in DEFAULT_USERS:
            email = cfg["email"]
            if MyUser.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f"'{email}' zaten mevcut, atlanıyor."))
                continue

            password = cfg["password"]
            label = cfg["role_label"]
            user = MyUser(
                email=email,
                first_name=cfg["first_name"],
                last_name=cfg["last_name"],
                identification_number=cfg["identification_number"],
                phone_number=cfg["phone_number"],
                address=cfg["address"],
                is_staff=cfg["is_staff"],
                is_superuser=cfg["is_superuser"],
                is_active=True,
            )
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"'{email}' ({label}) olusturuldu."))

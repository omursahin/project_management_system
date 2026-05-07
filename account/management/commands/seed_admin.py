from django.core.management.base import BaseCommand
from account.models import MyUser


class Command(BaseCommand):
    help = "Varsayilan admin kullanicisi olusturur (yoksa)"

    def handle(self, *args, **options):
        email = "admin@test.com"
        password = "123456"

        if MyUser.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"'{email}' kullanicisi zaten mevcut, atlanıyor."))
            return

        MyUser.objects.create_superuser(
            email=email,
            password=password,
            first_name="Admin",
            last_name="User",
            identification_number="00000000000",
            phone_number="0000000000",
            address="System",
        )
        self.stdout.write(self.style.SUCCESS(f"'{email}' admin kullanicisi olusturuldu."))

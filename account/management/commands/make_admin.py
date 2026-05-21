from django.core.management.base import BaseCommand, CommandError
from account.models import MyUser


class Command(BaseCommand):
    help = "Bir kullaniciyi admin (is_superuser+is_staff) yapar. Kullanim: python manage.py make_admin <email>"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="Admin yapilacak kullanicinin email adresi")

    def handle(self, *args, **options):
        email = options["email"]
        try:
            user = MyUser.objects.get(email=email)
        except MyUser.DoesNotExist:
            raise CommandError(f"'{email}' adresi ile kullanici bulunamadi.")

        user.is_superuser = True
        user.is_staff = True
        user.save(update_fields=["is_superuser", "is_staff"])
        self.stdout.write(self.style.SUCCESS(f"'{email}' artik admin (is_superuser=True, is_staff=True)."))

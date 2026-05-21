from django.core.management.base import BaseCommand
from group.models import Group
from group_member.models import GroupMember


class Command(BaseCommand):
    help = "Owner'i memberships listesinde olmayan eski gruplara ACCEPTED owner membership ekler."

    def handle(self, *args, **options):
        created = 0
        skipped = 0
        for group in Group.objects.all():
            exists = GroupMember.objects.filter(group=group, user=group.owner).exists()
            if exists:
                skipped += 1
                continue
            GroupMember.objects.create(
                group=group,
                user=group.owner,
                status=GroupMember.Status.ACCEPTED,
            )
            created += 1
            self.stdout.write(self.style.SUCCESS(
                f"+ Grup #{group.id} ({group.title}) owner membership eklendi."
            ))
        self.stdout.write(self.style.SUCCESS(
            f"\nTamamlandı: {created} eklendi, {skipped} atlandı."
        ))

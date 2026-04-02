import unittest
from django.test import TestCase
from django.db import IntegrityError
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.apps import apps
from .models import Group

User = get_user_model()

# ==========================================
# 1. ORM ve SENARYO TESTLERİ
# ==========================================
class GroupSenaryoVeCRUDTestleri(TestCase):

    def setUp(self):
        University = apps.get_model('university', 'University')
        Faculty = apps.get_model('faculty', 'Faculty')
        Department = apps.get_model('department', 'Department')
        Term = apps.get_model('term', 'Term')
        Lesson = apps.get_model('lesson', 'Lesson')
        TermLesson = apps.get_model('term_lesson', 'TermLesson')

        # 1. Her Şeyin Sahibi Olan Yüce Kullanıcı
        self.owner_user = User.objects.create_user(
            email="kurucu@group.com", password="TestSifresi123!",
            first_name="Grup", last_name="Başkanı", identification_number="12345678910"
        )

        # 2. Üniversite
        self.test_uni = University.objects.create(
            title="Erciyes Üniversitesi", city_code="38"
        )

        # 3. Fakülte
        self.test_fac = Faculty.objects.create(
            university=self.test_uni, title="Müh Fakültesi",
            short_title="MF", faculty_code="01"
        )

        # 4. Bölüm
        try:
            self.test_dept = Department.objects.create(
                faculty=self.test_fac, title="Bilgisayar Mühendisliği"
            )
        except TypeError:
            self.test_dept = Department.objects.create(
                faculty=self.test_fac, name="Bilgisayar Mühendisliği"
            )

        #  Artık 'owner' da gönderiyoruz.
        try:
            self.test_lesson = Lesson.objects.create(
                department=self.test_dept,
                owner=self.owner_user,  # Eksik olan parça buydu!
                title="Yapay Zeka"
            )
        except TypeError:
            self.test_lesson = Lesson.objects.create(
                department=self.test_dept,
                owner=self.owner_user,  # Eksik olan parça buydu!
                name="Yapay Zeka"
            )

        # 6. Dönem
        self.test_term = Term.objects.create(term="Güz", year=2026)

        # 7. Dönem Dersi
        self.test_term_lesson = TermLesson.objects.create(
            term=self.test_term,
            lesson=self.test_lesson,
            instructor=self.owner_user,
            max_group_size=5
        )

    # --- KLASİK CRUD TESTLERİ ---
    def test_group_ekleme(self):
        yeni_grup = Group.objects.create(
            term_lesson=self.test_term_lesson, owner=self.owner_user,
            title="Şampiyonlar Ligi", description="Proje", max_size=4, status="Aktif"
        )
        self.assertEqual(Group.objects.count(), 1)
        self.assertEqual(len(yeni_grup.invitation_code), 8)
        print("✅ CRUD: Grup Ekleme ve Otomatik Davet Kodu Üretme Testi Geçti!")

    def test_group_silme(self):
        silinecek_grup = Group.objects.create(
            term_lesson=self.test_term_lesson, owner=self.owner_user,
            title="Silinecek Grup", description="Yok olacak", max_size=5, status="Pasif"
        )
        silinecek_grup.delete()
        self.assertEqual(Group.objects.count(), 0)
        print("✅ CRUD: Grup Silme Testi Geçti!")

    # --- HOCANIN İSTEDİĞİ SENARYO TESTLERİ ---
    def test_senaryo_davet_kodu_essiz_olmalidir(self):
        ilk_grup = Group.objects.create(
            term_lesson=self.test_term_lesson, owner=self.owner_user,
            title="Orijinal Grup", description="Orijinal", max_size=5, status="Aktif"
        )
        uretilen_kod = ilk_grup.invitation_code

        with self.assertRaises(IntegrityError):
            Group.objects.create(
                term_lesson=self.test_term_lesson,
                owner=self.owner_user,
                title="Korsan Grup",
                description="Kopya kod",
                invitation_code=uretilen_kod,
                max_size=5,
                status="Aktif"
            )
        print("✅ SENARYO: Aynı davet koduyla ikinci bir grup açılamaz testi geçti!")

    def test_senaryo_sahipsiz_grup_olusturulamaz(self):
        with self.assertRaises(IntegrityError):
            Group.objects.create(
                term_lesson=self.test_term_lesson,
                owner=None,
                title="Hayalet Grup",
                description="Kurucusu yok",
                max_size=3,
                status="Aktif"
            )
        print("✅ SENARYO: Kurucusu (owner) olmayan grup açılamaz testi geçti!")


# ==========================================
# 2. API TESTLERİ - CI/CD Dostu Atlamalı
# ==========================================
@unittest.skip("API endpoint'leri henüz backend ekibi tarafından yazılmadığı için geçici olarak atlanıyor.")
class GroupAPITestleri(APITestCase):
    def test_api_atlama(self):
        pass
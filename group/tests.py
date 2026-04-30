import unittest
from django.test import TestCase
from django.db import IntegrityError
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.apps import apps
from django.urls import reverse
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
# 2. API TESTLERİ
# ==========================================
class GroupAPITestleri(APITestCase):

    def setUp(self):
        University = apps.get_model('university', 'University')
        Faculty = apps.get_model('faculty', 'Faculty')
        Department = apps.get_model('department', 'Department')
        Term = apps.get_model('term', 'Term')
        Lesson = apps.get_model('lesson', 'Lesson')
        TermLesson = apps.get_model('term_lesson', 'TermLesson')

        # 3 Farklı Kullanıcı Rolü (Owner, Başka Öğrenci, Admin)
        self.owner = User.objects.create_user(email="owner@test.com", password="pwd", first_name="A", last_name="B", identification_number="1")
        self.other_user = User.objects.create_user(email="other@test.com", password="pwd", first_name="C", last_name="D", identification_number="2")
        self.admin = User.objects.create_superuser(email="admin@test.com", password="pwd", first_name="E", last_name="F", identification_number="3")

        # Hiyerarşi
        self.uni = University.objects.create(title="Test Uni", city_code="38")
        self.fac = Faculty.objects.create(university=self.uni, title="Test Fac", short_title="TF", faculty_code="02")
        
        # DEPARTMENT VE LESSON OLUŞTURMA (AYRI AYRI TRY-EXCEPT)
        try:
            self.dept = Department.objects.create(faculty=self.fac, title="Test Dept")
        except TypeError:
            self.dept = Department.objects.create(faculty=self.fac, name="Test Dept")
            
        try:
            self.lesson = Lesson.objects.create(department=self.dept, owner=self.owner, title="Test Lesson")
        except TypeError:
            self.lesson = Lesson.objects.create(department=self.dept, owner=self.owner, name="Test Lesson")
            
        self.term = Term.objects.create(term="Bahar", year=2026)
        self.term_lesson = TermLesson.objects.create(term=self.term, lesson=self.lesson, instructor=self.owner, max_group_size=5)

        # Varsayılan bir grup oluşturuyoruz
        self.group = Group.objects.create(
            term_lesson=self.term_lesson, owner=self.owner,
            title="API Test Group", description="Desc", max_size=4, status="Active"
        )
        
        # Router URL isimleri (urls.py içindeki basename='group' tan geliyor)
        self.list_url = reverse('group-list') 
        self.detail_url = reverse('group-detail', kwargs={'pk': self.group.id})

    def test_grup_listeleme_ve_filtreleme(self):
        """GET /api/group/ isteğini ve term_lesson filtresini test eder."""
        self.client.force_authenticate(user=self.other_user)
        
        # Tüm liste
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Filtreleme
        response_filtered = self.client.get(f"{self.list_url}?term_lesson={self.term_lesson.id}")
        self.assertEqual(response_filtered.status_code, status.HTTP_200_OK)
        
        # Alakasız bir filtre (boş dönmeli)
        response_empty = self.client.get(f"{self.list_url}?term_lesson=999")
        self.assertEqual(len(response_empty.data), 0)

    def test_grup_olusturma(self):
        """POST /api/group/ isteğini test eder."""
        self.client.force_authenticate(user=self.owner)
        data = {
            "term_lesson": self.term_lesson.id,
            "title": "Yeni API Grubu",
            "description": "API ile açıldı",
            "max_size": 3,
            "status": "Active"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("invitation_code", response.data) # Davet kodu otomatik üretilmeli
        self.assertEqual(response.data["owner"], self.owner.id) # Owner isteği atan kişi olmalı

    def test_grup_detayi(self):
        """GET /api/group/{id}/ isteğinde memberships nested geliyor mu kontrol eder."""
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("memberships", response.data)

    def test_grup_yetkilendirme_isowneroradmin(self):
        """PUT /api/group/{id}/ yetkilerini test eder."""
        data = {"title": "Yetki Testi"}
        
        # 1. Başka bir kullanıcı güncelleyememeli
        self.client.force_authenticate(user=self.other_user)
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 2. Grup sahibi (owner) güncelleyebilmeli
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Yetki Testi")
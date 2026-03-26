from django.test import TestCase
from .models import Faculty
from university.models import University  # Fakülte yaratmak için Üniversite modelini mecburen çağırıyoruz!


class FacultyEklemeSilmeGuncellemeTestleri(TestCase):

    def setUp(self):
        # HER TESTTEN ÖNCE ÇALIŞIR:
        # Fakülteleri bağlayabileceğimiz sahte bir test üniversitesi yaratıyoruz.
        self.test_uni = University.objects.create(
            title="Erciyes Üniversitesi",
            description="Kayseri'nin incisi.",
            city_code="38"
        )

    def test_faculty_ekleme(self):
        # 1. GÖREV: EKLEME
        yeni_fakulte = Faculty.objects.create(
            university=self.test_uni,  # Yukarıda yarattığımız üniversiteyi bağladık
            title="Mühendislik Fakültesi",
            short_title="Müh. Fak.",  # Enes'in zorunlu kıldığı diğer alanlar
            faculty_code="MF-01",
            description="Harika mühendisler yetiştirir."
        )

        self.assertEqual(Faculty.objects.count(), 1)
        self.assertEqual(yeni_fakulte.title, "Mühendislik Fakültesi")
        print("✅ Fakülte Ekleme Testi Geçti!")

    def test_faculty_silme(self):
        # 2. GÖREV: SİLME
        silinecek_fakulte = Faculty.objects.create(
            university=self.test_uni,
            title="Silinecek Fakülte",
            short_title="Sil. Fak.",
            faculty_code="SF-99",
            description="Birazdan yok olacak."
        )

        self.assertEqual(Faculty.objects.count(), 1)


        silinecek_fakulte.delete()
        self.assertEqual(Faculty.objects.count(), 0)
        print("✅ Fakülte Silme Testi Geçti!")

    def test_faculty_guncelleme(self):
        # 3. GÖREV: GÜNCELLEME
        guncellenecek_fakulte = Faculty.objects.create(
            university=self.test_uni,
            title="Eski Fakülte Adı",
            short_title="EFA",
            faculty_code="EF-01",
            description="Eski açıklama"
        )

        # Güncelleme işlemi (İsimleri değiştiriyoruz)
        guncellenecek_fakulte.title = "Yeni Fakülte Adı"
        guncellenecek_fakulte.short_title = "YFA"
        guncellenecek_fakulte.save()  # Veritabanına "Bunu kaydet" dedik

        # Veritabanından en güncel halini tekrar çekip gerçekten değişmiş mi diye kontrol etme
        guncel_hal = Faculty.objects.get(id=guncellenecek_fakulte.id)
        self.assertEqual(guncel_hal.title, "Yeni Fakülte Adı")
        self.assertEqual(guncel_hal.short_title, "YFA")
        print("✅ Fakülte Güncelleme Testi Geçti!")


from django.test import TestCase

# Create your tests here.

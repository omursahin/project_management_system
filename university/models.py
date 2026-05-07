from django.db import models


class University(models.Model):
    # Orijinal ID yapını koruyoruz
    id = models.BigAutoField(primary_key=True)
    
    # Frontend'deki 'name' alanı buraya 'title' olarak kaydedilecek
    title = models.CharField(max_length=255) 
    
    # Frontend'deki 'detail' alanı buraya gelecek (TextField yaparak kapasiteyi artırdık)
    description = models.TextField(blank=True, null=True) 
    
    # Frontend'deki 'city' alanı buraya 'city_code' olarak kaydedilecek
    city_code = models.CharField(max_length=10) 
    
    # YENİ: Frontend'de eklediğimiz Tür seçeneği için
    TYPE_CHOICES = [
        ('Devlet', 'Devlet'),
        ('Vakıf', 'Vakıf'),
    ]
    type = models.CharField(
        max_length=10, 
        choices=TYPE_CHOICES, 
        default='Devlet'
    )

    # Orijinal ForeignKey bağlantın (Diğer modüllerle olan bağın kopmaması için kritik)
    active_term = models.ForeignKey(
        "term.Term", on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.title

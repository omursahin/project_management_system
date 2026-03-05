from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView  # 1. Bunu ekledik (Sihir burada)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 2. Ana sayfaya ('') girildiğinde React'ın index.html'ini yayınla diyoruz!
    path('', TemplateView.as_view(template_name='index.html')),
]
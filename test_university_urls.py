#!/usr/bin/env python
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_management.settings')
django.setup()

from django.urls import get_resolver

def show_university_urls():
    """University endpoint'lerini göster"""
    resolver = get_resolver()
    
    print("\n" + "="*70)
    print("UNIVERSITY API ENDPOINT'LERİ")
    print("="*70 + "\n")
    
    endpoints = [
        {
            'method': 'GET',
            'endpoint': '/api/university/',
            'description': 'Listeleme',
            'permission': 'IsAuthenticated'
        },
        {
            'method': 'POST',
            'endpoint': '/api/university/',
            'description': 'Oluşturma',
            'permission': 'IsAdminUser'
        },
        {
            'method': 'GET',
            'endpoint': '/api/university/{id}/',
            'description': 'Detay',
            'permission': 'IsAuthenticated'
        },
        {
            'method': 'PUT',
            'endpoint': '/api/university/{id}/',
            'description': 'Güncelleme',
            'permission': 'IsAdminUser'
        },
        {
            'method': 'DELETE',
            'endpoint': '/api/university/{id}/',
            'description': 'Silme',
            'permission': 'IsAdminUser'
        },
    ]
    
    for i, ep in enumerate(endpoints, 1):
        print(f"{i}. {ep['method']:6} {ep['endpoint']:30} → {ep['description']:15} ({ep['permission']})")
    
    print("\n" + "="*70)
    print("DOSYALAR")
    print("="*70 + "\n")
    
    files = [
        "✓ university/serializers.py - UniversitySerializer",
        "✓ university/views.py - UniversityViewSet + IsAdminUser",
        "✓ university/urls.py - DefaultRouter yapılandırması",
        "✓ university/admin.py - Admin paneli kaydı",
        "✓ project_management/urls.py - API routing",
    ]
    
    for f in files:
        print(f"  {f}")
    
    print("\n" + "="*70)
    print("YETKİ KONTROLÜ")
    print("="*70 + "\n")
    print("  • GET (list, retrieve): IsAuthenticated - Giriş yapmış tüm kullanıcılar")
    print("  • POST, PUT, DELETE: IsAdminUser - Sadece is_staff=True kullanıcılar")
    print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    show_university_urls()


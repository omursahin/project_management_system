# group/permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Sadece grup sahibi (owner) veya admin (is_staff) olan kullanıcıların
    düzenleme veya silme işlemi yapmasına izin verir.
    """
    def has_object_permission(self, request, view, obj):
        # Okuma izinlerine (GET, HEAD, OPTIONS) her zaman izin ver
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Yazma izinleri sadece owner veya admine ait
        return bool(request.user and (request.user.is_staff or obj.owner == request.user))
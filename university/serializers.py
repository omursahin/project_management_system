# university/serializers.py
from rest_framework import serializers
from .models import University

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        # Modeldeki tüm alanları (title, description, type vb.) API'ye açar
        fields = '__all__'


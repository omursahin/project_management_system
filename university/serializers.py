# university/serializers.py
from rest_framework import serializers
from term.models import Term
from .models import University

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        # Modeldeki tüm alanları (title, description, type vb.) API'ye açar
        fields = '__all__'


class UniversitySetActiveTermSerializer(serializers.Serializer):
    term_id = serializers.PrimaryKeyRelatedField(
        queryset=Term.objects.all(),
        source="active_term",
    )

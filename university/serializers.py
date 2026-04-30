from rest_framework import serializers
from term.models import Term
from .models import University


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "title", "description", "city_code", "active_term"]
        read_only_fields = ["id"]


class UniversitySetActiveTermSerializer(serializers.Serializer):
    term_id = serializers.PrimaryKeyRelatedField(
        queryset=Term.objects.all(),
        source="active_term",
    )

from rest_framework import serializers
from .models import TermLesson

class TermLessonViewSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TermLesson
        # Tüm alanları dahil ediyoruz. Eğer özel olarak gizlemek istediğin
        # bir alan varsa '__all__' yerine ['id', 'term', 'lesson', 'instructor', 'max_group_size'] yazabilirsin.
        fields = '__all__'
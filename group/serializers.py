# group/serializers.py
from rest_framework import serializers
from .models import Group
from group_member.models import GroupMember

class GroupMemberNestedSerializer(serializers.ModelSerializer):
    # İsteğe bağlı: Üye bilgilerini daha detaylı dönmek için
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'user', 'user_email', 'user_name', 'status', 'created_at']

class GroupSerializer(serializers.ModelSerializer):
    # Üyeleri nested olarak sadece okuma amaçlı (read_only) ekliyoruz
    memberships = GroupMemberNestedSerializer(many=True, read_only=True)
    
    # invitation_code model'de otomatik üretiliyor, bu yüzden create aşamasında zorunlu değil
    invitation_code = serializers.CharField(read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Group
        fields = [
            'id', 'term_lesson', 'owner', 'title', 'description', 
            'invitation_code', 'max_size', 'status', 'memberships'
        ]

    def create(self, validated_data):
        # Grubu oluşturan kişiyi (request.user) owner olarak atıyoruz
        request = self.context.get('request')
        validated_data['owner'] = request.user
        return super().create(validated_data)
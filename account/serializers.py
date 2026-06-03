from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import MyUser


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email ve şifre alanları zorunludur.")

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError("Geçersiz email veya şifre.")

        if not user.is_active:
            raise serializers.ValidationError("Bu hesap devre dışı bırakılmış.")

        attrs["user"] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = MyUser
        fields = [
            "email",
            "first_name",
            "last_name",
            "identification_number",
            "phone_number",
            "address",
            "department",
            "password",
            "password2",
        ]

    def validate_email(self, value):
        if MyUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email zaten kullanılıyor.")
        return value

    def validate_identification_number(self, value):
        if MyUser.objects.filter(identification_number=value).exists():
            raise serializers.ValidationError("Bu kimlik numarası zaten kullanılıyor.")
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError("Kimlik numarası 11 haneli sayı olmalı.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Şifreler eşleşmiyor."})

        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")

        user = MyUser(**validated_data)
        user.set_password(password)
        user.save()

        return user


from rest_framework_simplejwt.tokens import RefreshToken


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Token geçersiz veya zaten logout yapılmış.")

class ProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = MyUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'identification_number',
            'phone_number', 'address', 'department', 'is_staff', 'is_superuser',
        ]
        read_only_fields = ['id', 'email', 'identification_number', 'department', 'is_staff', 'is_superuser']


# --- YENİ EKLENEN KISIM: Issue #9 ---
class UserListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = MyUser
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "identification_number",
            "phone_number",
            "address",
            "department",
            "department_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Admin tarafindan kullanici olusturma. Sifre opsiyoneldir; verilmezse kimlik numarasi sifre olur."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = MyUser
        fields = [
            "email",
            "first_name",
            "last_name",
            "identification_number",
            "phone_number",
            "address",
            "department",
            "is_staff",
            "is_superuser",
            "password",
        ]
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True},
            "phone_number": {"required": False, "allow_blank": True, "default": ""},
            "address": {"required": False, "allow_blank": True, "default": ""},
            "department": {"required": False, "allow_null": True},
            "is_staff": {"required": False, "default": False},
            "is_superuser": {"required": False, "default": False},
        }

    def validate_identification_number(self, value):
        value = (value or "").strip()
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError("Kimlik/öğrenci numarası 11 haneli sayı olmalı.")
        if MyUser.objects.filter(identification_number=value).exists():
            raise serializers.ValidationError("Bu numara zaten kullanılıyor.")
        return value

    def create(self, validated_data):
        # Email yoksa kimlik numarasindan uret
        if not validated_data.get("email"):
            validated_data["email"] = f"{validated_data['identification_number']}@student.local"
        # Email cakismasi kontrolu
        if MyUser.objects.filter(email=validated_data["email"]).exists():
            raise serializers.ValidationError({"email": "Bu email zaten kullanılıyor."})
        password = validated_data.pop("password", "") or validated_data["identification_number"]
        user = MyUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin tarafindan kullanici guncelleme. phone_number ve address bos olabilir."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)

    class Meta:
        model = MyUser
        fields = [
            "email",
            "first_name",
            "last_name",
            "identification_number",
            "phone_number",
            "address",
            "department",
            "is_active",
            "is_staff",
            "is_superuser",
            "password",
        ]

    def validate_identification_number(self, value):
        value = (value or "").strip()
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError("Kimlik/öğrenci numarası 11 haneli sayı olmalı.")
        qs = MyUser.objects.filter(identification_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Bu numara baska bir kullaniciya ait.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


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
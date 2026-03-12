from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import MyUser


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
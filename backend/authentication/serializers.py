from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()
    firstName = serializers.CharField(source="first_name")
    lastName = serializers.CharField(source="last_name")
    trainingCenter = serializers.CharField(
        source="profile.training_center",
        required=False,
        allow_blank=True,
    )
    speciality = serializers.CharField(
        source="profile.speciality",
        required=False,
        allow_blank=True,
    )
    document = serializers.FileField(
        source="profile.credential_document",
        required=False,
        allow_empty_file=False,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "firstName",
            "lastName",
            "role",
            "trainingCenter",
            "speciality",
            "document",
        )
        read_only_fields = ("id",)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cette adresse e-mail est déjà utilisée.")
        return value.strip().lower()

    def validate_role(self, value):
        roles = {"student": "APPRENANT", "teacher": "ENSEIGNANT"}
        role = roles.get(value, value)
        if role not in {"APPRENANT", "ENSEIGNANT"}:
            raise serializers.ValidationError("Le rôle demandé n'est pas autorisé.")
        return role

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        email = validated_data.pop("email")
        user = User.objects.create_user(
            username=email,
            email=email,
            **validated_data,
        )
        UserProfile.objects.create(user=user, **profile_data)
        return user

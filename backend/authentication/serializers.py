from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'photo', 'bio', 'telephone', 'adresse', 'niveau_etude',
            'specialite', 'centre_formation', 'diplome', 'cv'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'est_valide', 'profile']
        read_only_fields = ['id', 'est_valide']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    
    # Champs optionnels/spécifiques pour le Profil
    niveau_etude = serializers.CharField(write_only=True, required=False, allow_blank=True)
    telephone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    adresse = serializers.CharField(write_only=True, required=False, allow_blank=True)
    specialite = serializers.CharField(write_only=True, required=False, allow_blank=True)
    centre_formation = serializers.CharField(write_only=True, required=False, allow_blank=True)
    diplome = serializers.FileField(write_only=True, required=False, allow_null=True)
    cv = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name', 'role',
            'niveau_etude', 'telephone', 'adresse', 'specialite', 'centre_formation',
            'diplome', 'cv'
        ]

    def create(self, validated_data):
        # Extraction des données supplémentaires de profil
        niveau_etude = validated_data.pop('niveau_etude', None)
        telephone = validated_data.pop('telephone', None)
        adresse = validated_data.pop('adresse', None)
        specialite = validated_data.pop('specialite', None)
        centre_formation = validated_data.pop('centre_formation', None)
        diplome = validated_data.pop('diplome', None)
        cv = validated_data.pop('cv', None)

        # Génération automatique d'un nom d'utilisateur si non fourni
        email = validated_data['email']
        username = validated_data.get('username')
        if not username:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

        # Création de l'utilisateur (compte en attente de validation)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'APPRENANT'),
            est_valide=False
        )

        # Complétion des informations du profil (généré automatiquement via le signal Django)
        profile = user.profile
        if niveau_etude:
            profile.niveau_etude = niveau_etude
        if telephone:
            profile.telephone = telephone
        if adresse:
            profile.adresse = adresse
        if specialite:
            profile.specialite = specialite
        if centre_formation:
            profile.centre_formation = centre_formation
        if diplome:
            profile.diplome = diplome
        if cv:
            profile.cv = cv
        profile.save()

        return user
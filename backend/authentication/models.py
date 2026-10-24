from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrateur'),
        ('ENSEIGNANT', 'Enseignant'),
        ('APPRENANT', 'Apprenant'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='APPRENANT')
    
    # Validation admin obligatoire pour TOUS les rôles (par défaut False)
    est_valide = models.BooleanField(
        default=False, 
        help_text="Indique si l'inscription de l'utilisateur (enseignant ou apprenant) a été validée par l'administrateur."
    )

    def __str__(self):
        statut = "Validé" if self.est_valide else "En attente de validation"
        return f"{self.username} ({self.role}) - {statut}"


class Profile(models.Model):
    NIVEAU_CHOICES = (
        ('SECONDAIRE', 'Enseignement Secondaire'),
        ('LICENCE', 'Licence / Bachelor'),
        ('MASTER', 'Master'),
        ('DOCTORAT', 'Doctorat'),
        ('AUTRE', 'Autre / Professionnel'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    photo = models.ImageField(upload_to='profiles/photos/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    adresse = models.CharField(max_length=255, blank=True, null=True)
    niveau_etude = models.CharField(max_length=50, choices=NIVEAU_CHOICES, blank=True, null=True)
    
    # Nouveaux champs pour les inscriptions Figma
    specialite = models.CharField(max_length=150, blank=True, null=True)
    centre_formation = models.CharField(max_length=200, blank=True, null=True)
    diplome = models.FileField(upload_to='profiles/diplomes/', blank=True, null=True)
    cv = models.FileField(upload_to='profiles/cvs/', blank=True, null=True)

    def __str__(self):
        user = getattr(self, 'user', None)
        username = getattr(user, 'username', 'Utilisateur inconnu')
        return f"Profil de {username}"


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.created_at} - {self.user} : {self.action}"
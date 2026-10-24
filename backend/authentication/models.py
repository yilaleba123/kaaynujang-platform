from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('APPRENANT', 'Apprenant'),
        ('ENSEIGNANT', 'Enseignant'),
        ('ADMIN', 'Administrateur'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='APPRENANT')
    est_actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)
    speciality = models.CharField(max_length=150, blank=True)
    training_center = models.CharField(max_length=150, blank=True)
    credential_document = models.FileField(
        upload_to="credentials/",
        blank=True,
    )

    def __str__(self):
        return f"Profil de {self.user.username}"
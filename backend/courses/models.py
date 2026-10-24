from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Category(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "catégorie"
        verbose_name_plural = "catégories"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class Course(models.Model):
    LEVEL_CHOICES = (
        ("beginner", "Débutant"),
        ("intermediate", "Intermédiaire"),
        ("advanced", "Avancé"),
    )

    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    niveau = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")
    categorie = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="courses",
    )
    instructeur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_enseignes",
    )
    is_published = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "cours"
        verbose_name_plural = "cours"
        ordering = ["-created_at"]

    def __str__(self):
        return self.titre


class Module(models.Model):
    titre = models.CharField(max_length=200)
    ordre = models.PositiveIntegerField(default=0)
    cours = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules",
    )

    class Meta:
        verbose_name = "module"
        verbose_name_plural = "modules"
        ordering = ["cours", "ordre"]

    def __str__(self):
        return f"{self.cours.titre} - {self.ordre}. {self.titre}"


class Lesson(models.Model):
    TYPE_CHOICES = (
        ("video", "Vidéo"),
        ("text", "Texte"),
        ("pdf", "PDF"),
    )

    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="text")
    video_url = models.URLField(blank=True)
    ordre = models.PositiveIntegerField(default=0)
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="lessons",
    )

    class Meta:
        verbose_name = "leçon"
        verbose_name_plural = "leçons"
        ordering = ["module", "ordre"]

    def __str__(self):
        return f"{self.module.titre} - {self.ordre}. {self.titre}"


class Document(models.Model):
    titre = models.CharField(max_length=200)
    fichier = models.FileField(upload_to="documents/")
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    cours = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="documents",
        null=True,
        blank=True,
    )
    lecon = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="documents",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "document"
        verbose_name_plural = "documents"

    def clean(self):
        # Un document est rattaché soit à un cours, soit à une leçon (pas les deux, pas aucun).
        if bool(self.cours) == bool(self.lecon):
            raise ValidationError(
                "Un document doit être rattaché soit à un cours, soit à une leçon."
            )

    def __str__(self):
        cible = self.lecon or self.cours
        return f"{self.titre} ({cible})" if cible else self.titre

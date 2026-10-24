from django.db import models
from django.conf import settings

class Category(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"

    def __str__(self):
        return str(self.nom)


class Course(models.Model):
    NIVEAU_CHOICES = (
        ('DEBUTANT', 'Débutant'),
        ('INTERMEDIAIRE', 'Intermédiaire'),
        ('AVANCE', 'Avancé'),
    )
    STATUT_CHOICES = (
        ('BROUILLON', 'Brouillon'),
        ('PUBLIE', 'Publié'),
        ('ARCHIVE', 'Archivé'),
    )

    titre = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    categorie = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='cours')
    enseignant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='cours_enseignes',
        limit_choices_to={'role': 'ENSEIGNANT'}
    )
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default='DEBUTANT')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='BROUILLON')
    image_couverture = models.ImageField(upload_to='courses/images/', null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cours"
        verbose_name_plural = "Cours"

    def __str__(self):
        enseignant_name = getattr(self.enseignant, 'username', '')
        return f"{self.titre} ({enseignant_name})"


class Module(models.Model):
    cours = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    ordre = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['ordre']

    def __str__(self):
        cours_titre = getattr(self.cours, 'titre', '')
        return f"{cours_titre} - Module {self.ordre}: {self.titre}"


class Lesson(models.Model):
    TYPE_CHOICES = (
        ('PDF', 'Document PDF'),
        ('VIDEO', 'Vidéo'),
        ('EXERCICE', 'Exercice / Texte'),
    )

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lecons')
    titre = models.CharField(max_length=200)
    type_contenu = models.CharField(max_length=20, choices=TYPE_CHOICES, default='PDF')
    fichier = models.FileField(upload_to='courses/documents/', null=True, blank=True)
    url_video = models.URLField(null=True, blank=True)
    contenu_texte = models.TextField(blank=True, null=True)
    duree_minutes = models.PositiveIntegerField(default=0, help_text="Durée estimée en minutes")
    ordre = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['ordre']

    def __str__(self):
        module_titre = getattr(self.module, 'titre', '')
        return f"{module_titre} - Leçon {self.ordre}: {self.titre}"


class Enrollment(models.Model):
    STATUT_CHOICES = (
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('ABANDONNE', 'Abandonné'),
    )

    apprenant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='inscriptions',
        limit_choices_to={'role': 'APPRENANT'}
    )
    cours = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='inscriptions')
    date_inscription = models.DateTimeField(auto_now_add=True)
    taux_progression = models.FloatField(default=0.0)  # Pourcentage entre 0.0 et 100.0
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_COURS')

    class Meta:
        unique_together = ('apprenant', 'cours')

    def __str__(self):
        apprenant_name = getattr(self.apprenant, 'username', '')
        cours_titre = getattr(self.cours, 'titre', '')
        return f"{apprenant_name} inscrit à {cours_titre}"
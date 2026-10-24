import uuid
from django.db import models
from django.conf import settings
from courses.models import Course

class ForumTopic(models.Model):
    cours = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='forum_topics')
    auteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_topics')
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sujet du Forum"
        verbose_name_plural = "Sujets du Forum"

    def __str__(self):
        course_title = getattr(self.cours, 'titre', 'Cours inconnu')
        return f"{course_title} - {self.titre}"


class ForumPost(models.Model):
    sujet = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='posts')
    auteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_posts')
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Message du Forum"
        verbose_name_plural = "Messages du Forum"

    def __str__(self):
        auteur = getattr(self.auteur, 'username', str(self.auteur))
        sujet_titre = getattr(self.sujet, 'titre', 'Sujet inconnu')
        return f"Réponse de {auteur} sur {sujet_titre}"


class Notification(models.Model):
    destinataire = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=200)
    message = models.TextField()
    lu = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        destinataire = getattr(self.destinataire, 'username', str(self.destinataire))
        return f"Notification pour {destinataire} - {self.titre}"


class Certificate(models.Model):
    apprenant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='certificates',
        limit_choices_to={'role': 'APPRENANT'}
    )
    cours = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    code_unique = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    fichier_pdf = models.FileField(upload_to='certificates/pdfs/', null=True, blank=True)
    date_emission = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('apprenant', 'cours')
        verbose_name = "Certificat"
        verbose_name_plural = "Certificats"

    def __str__(self):
        apprenant_username = getattr(self.apprenant, 'username', str(self.apprenant))
        course_title = getattr(self.cours, 'titre', 'Cours inconnu')
        return f"Certificat {self.code_unique} - {apprenant_username} ({course_title})"
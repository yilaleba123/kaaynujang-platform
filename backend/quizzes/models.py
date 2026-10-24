from django.db import models
from django.conf import settings
from courses.models import Course, Module

class Quiz(models.Model):
    cours = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    note_passage = models.PositiveIntegerField(
        default=70, 
        help_text="Pourcentage minimum pour valider le quiz (ex: 70 pour 70%)"
    )
    duree_minutes = models.PositiveIntegerField(default=15, help_text="Durée maximale en minutes")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Quiz"
        verbose_name_plural = "Quizzes"

    def __str__(self):
        return str(self.titre)


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    texte = models.TextField()
    points = models.PositiveIntegerField(default=1)

    def __str__(self):
        quiz_titre = getattr(self.quiz, 'titre', 'Quiz inconnu')
        return f"{quiz_titre} - Question: {str(self.texte)[:50]}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    texte = models.CharField(max_length=255)
    est_correcte = models.BooleanField(default=False)

    def __str__(self):
        statut = "Correcte" if self.est_correcte else "Incorrecte"
        return f"{self.texte} ({statut})"


class Result(models.Model):
    apprenant = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='quiz_results',
        limit_choices_to={'role': 'APPRENANT'}
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    score_obtenu = models.FloatField()  # Pourcentage obtenu (ex: 85.5)
    reussi = models.BooleanField(default=False)
    date_passage = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Résultat"
        verbose_name_plural = "Résultats"

    def __str__(self):
        statut = "Réussi" if self.reussi else "Échoué"
        apprenant_nom = getattr(self.apprenant, 'username', 'Apprenant inconnu')
        quiz_titre = getattr(self.quiz, 'titre', 'Quiz inconnu')
        return f"{apprenant_nom} - {quiz_titre}: {self.score_obtenu}% ({statut})"
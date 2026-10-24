from django.contrib import admin
from .models import Quiz, Question, Choice, Result

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('texte', 'quiz', 'points')
    list_filter = ('quiz',)
    inlines = [ChoiceInline]

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('titre', 'cours', 'module', 'note_passage', 'duree_minutes', 'date_creation')
    list_filter = ('cours', 'module')

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('apprenant', 'quiz', 'score_obtenu', 'reussi', 'date_passage')
    list_filter = ('reussi', 'quiz')
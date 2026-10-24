from rest_framework import serializers
from authentication.serializers import UserSerializer
from .models import Quiz, Question, Choice, Result

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'texte', 'est_correcte']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'texte', 'points', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'cours', 'module', 'titre', 'description', 'note_passage', 'duree_minutes', 'date_creation', 'questions']


class QuizSubmissionSerializer(serializers.Serializer):
    """Format de soumission : liste de réponses {question_id, choice_id}"""
    answers = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField())
    )


class ResultSerializer(serializers.ModelSerializer):
    apprenant_detail = UserSerializer(source='apprenant', read_only=True)
    quiz_titre = serializers.CharField(source='quiz.titre', read_only=True)

    class Meta:
        model = Result
        fields = ['id', 'apprenant', 'apprenant_detail', 'quiz', 'quiz_titre', 'score_obtenu', 'reussi', 'date_passage']
        read_only_fields = ['id', 'apprenant', 'score_obtenu', 'reussi', 'date_passage']
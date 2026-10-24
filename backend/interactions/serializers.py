from rest_framework import serializers
from authentication.serializers import UserSerializer
from courses.serializers import CourseSerializer
from .models import ForumTopic, ForumPost, Notification, Certificate


class ForumPostSerializer(serializers.ModelSerializer):
    auteur_detail = UserSerializer(source='auteur', read_only=True)

    class Meta:
        model = ForumPost
        fields = ['id', 'sujet', 'auteur', 'auteur_detail', 'contenu', 'date_creation']
        read_only_fields = ['id', 'auteur', 'date_creation']


class ForumTopicSerializer(serializers.ModelSerializer):
    auteur_detail = UserSerializer(source='auteur', read_only=True)
    posts = ForumPostSerializer(many=True, read_only=True)

    class Meta:
        model = ForumTopic
        fields = ['id', 'cours', 'auteur', 'auteur_detail', 'titre', 'contenu', 'date_creation', 'posts']
        read_only_fields = ['id', 'auteur', 'date_creation']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'destinataire', 'titre', 'message', 'lu', 'date_creation']
        read_only_fields = ['id', 'destinataire', 'date_creation']


class CertificateSerializer(serializers.ModelSerializer):
    apprenant_detail = UserSerializer(source='apprenant', read_only=True)
    cours_detail = CourseSerializer(source='cours', read_only=True)

    class Meta:
        model = Certificate
        fields = ['id', 'apprenant', 'apprenant_detail', 'cours', 'cours_detail', 'code_unique', 'fichier_pdf', 'date_emission']
        read_only_fields = ['id', 'apprenant', 'code_unique', 'date_emission']
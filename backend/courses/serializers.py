from rest_framework import serializers
from authentication.serializers import UserSerializer
from .models import Category, Course, Module, Lesson, Enrollment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'nom', 'slug', 'description']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'titre', 'type_contenu', 'fichier', 'url_video', 'contenu_texte', 'ordre']


class ModuleSerializer(serializers.ModelSerializer):
    lecons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'cours', 'titre', 'description', 'ordre', 'lecons']


class CourseSerializer(serializers.ModelSerializer):
    categorie_detail = CategorySerializer(source='categorie', read_only=True)
    enseignant_detail = UserSerializer(source='enseignant', read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'titre', 'slug', 'description', 'categorie', 'categorie_detail',
            'enseignant', 'enseignant_detail', 'niveau', 'statut', 'image_couverture',
            'date_creation', 'date_mise_a_jour', 'modules'
        ]
        read_only_fields = ['id', 'enseignant', 'date_creation', 'date_mise_a_jour']


class EnrollmentSerializer(serializers.ModelSerializer):
    cours_detail = CourseSerializer(source='cours', read_only=True)
    apprenant_detail = UserSerializer(source='apprenant', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'apprenant', 'apprenant_detail', 'cours', 'cours_detail', 'date_inscription', 'taux_progression', 'statut']
        read_only_fields = ['id', 'apprenant', 'date_inscription']
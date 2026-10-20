from rest_framework import serializers

from .models import Category, Course, Document, Lesson, Module


class CategorySerializer(serializers.ModelSerializer):
    nombre_cours = serializers.IntegerField(source="courses.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "nom", "description", "created_at", "nombre_cours"]
        read_only_fields = ["created_at"]


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "titre", "fichier", "cours", "lecon"]

    def validate(self, attrs):
        # En mise à jour partielle (PATCH), on complète avec les valeurs déjà enregistrées.
        cours = attrs.get("cours", getattr(self.instance, "cours", None))
        lecon = attrs.get("lecon", getattr(self.instance, "lecon", None))

        if cours and lecon:
            raise serializers.ValidationError(
                "Un document ne peut pas être lié à la fois à un cours et à une leçon."
            )
        if not cours and not lecon:
            raise serializers.ValidationError(
                "Un document doit être lié à un cours ou à une leçon."
            )
        return attrs


class LessonSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ["id", "titre", "contenu", "video_url", "ordre", "module", "documents"]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "titre", "ordre", "cours", "lessons"]


class CourseListSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source="categorie.nom", read_only=True)
    instructeur = serializers.StringRelatedField(read_only=True)
    nombre_modules = serializers.IntegerField(source="modules.count", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "titre",
            "categorie",
            "categorie_nom",
            "instructeur",
            "is_published",
            "nombre_modules",
            "created_at",
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source="categorie.nom", read_only=True)
    instructeur = serializers.StringRelatedField(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "titre",
            "description",
            "categorie",
            "categorie_nom",
            "instructeur",
            "is_published",
            "created_at",
            "updated_at",
            "modules",
            "documents",
        ]
        read_only_fields = ["created_at", "updated_at"]

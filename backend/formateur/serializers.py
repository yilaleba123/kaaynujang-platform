from rest_framework import serializers

from courses.models import Course


class TeacherProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    firstName = serializers.CharField(source="first_name", required=False)
    lastName = serializers.CharField(source="last_name", required=False)
    email = serializers.EmailField(read_only=True)
    phone = serializers.CharField(source="profile.phone", required=False, allow_blank=True)
    bio = serializers.CharField(source="profile.bio", required=False, allow_blank=True)


class CourseLessonSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    type = serializers.ChoiceField(choices=["video", "text", "pdf"])
    contentUrl = serializers.CharField(allow_blank=True, required=False)


class CourseModuleSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    lessons = CourseLessonSerializer(many=True)


class CoursePayloadSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    categoryId = serializers.IntegerField()
    description = serializers.CharField()
    level = serializers.ChoiceField(choices=["beginner", "intermediate", "advanced"])
    status = serializers.ChoiceField(choices=["draft", "published"])
    modules = CourseModuleSerializer(many=True)

    def validate_categoryId(self, value):
        from courses.models import Category

        if not Category.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Catégorie introuvable.")
        return value


class QuizQuestionPayloadSerializer(serializers.Serializer):
    text = serializers.CharField()
    options = serializers.ListField(
        child=serializers.CharField(allow_blank=False),
        min_length=2,
    )
    correctIndex = serializers.IntegerField(min_value=0)

    def validate(self, attrs):
        if attrs["correctIndex"] >= len(attrs["options"]):
            raise serializers.ValidationError(
                {"correctIndex": "L'index de la bonne réponse est invalide."}
            )
        return attrs


class QuizPayloadSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    courseId = serializers.IntegerField()
    durationMinutes = serializers.IntegerField(min_value=1)
    questions = QuizQuestionPayloadSerializer(many=True, min_length=1)

    def validate_courseId(self, value):
        if not Course.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Cours introuvable.")
        return value

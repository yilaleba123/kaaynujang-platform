from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Category, Course, Document, Lesson, Module
from .serializers import (
    CategorySerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    DocumentSerializer,
    LessonSerializer,
    ModuleSerializer,
)


def get_course_owner(obj):
    """Retrouve l'instructeur du cours auquel appartient un objet."""
    if isinstance(obj, Course):
        return obj.instructeur
    if isinstance(obj, Module):
        return obj.cours.instructeur
    if isinstance(obj, Lesson):
        return obj.module.cours.instructeur
    if isinstance(obj, Document):
        return (obj.cours or obj.lecon.module.cours).instructeur
    return None


class IsInstructorOrReadOnly(permissions.BasePermission):
    """Lecture pour tous ; modification réservée à l'instructeur du cours."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return get_course_owner(obj) == request.user


def visible_courses_filter(user, prefix=""):
    """Cours publiés, plus les brouillons de l'utilisateur connecté."""
    condition = Q(**{f"{prefix}is_published": True})
    if user.is_authenticated:
        condition |= Q(**{f"{prefix}instructeur": user})
    return condition


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsInstructorOrReadOnly]

    def get_queryset(self):
        return (
            Course.objects.filter(visible_courses_filter(self.request.user))
            .select_related("categorie", "instructeur")
            .prefetch_related("modules__lessons__documents", "documents")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return CourseListSerializer
        return CourseDetailSerializer

    def perform_create(self, serializer):
        serializer.save(instructeur=self.request.user)


class CourseContentViewSet(viewsets.ModelViewSet):
    """Base commune : on ne peut ajouter du contenu qu'à ses propres cours."""

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsInstructorOrReadOnly]

    def check_ownership(self, serializer):
        # On construit un objet temporaire pour retrouver le cours parent.
        obj = serializer.Meta.model(**serializer.validated_data)
        if get_course_owner(obj) != self.request.user:
            raise PermissionDenied("Vous n'êtes pas l'instructeur de ce cours.")

    def perform_create(self, serializer):
        self.check_ownership(serializer)
        serializer.save()

    def perform_update(self, serializer):
        # Empêche de déplacer un contenu vers le cours d'un autre instructeur.
        data = {
            field: serializer.validated_data.get(field, getattr(serializer.instance, field))
            for field in ("cours", "module", "lecon")
            if hasattr(serializer.instance, field)
        }
        obj = serializer.Meta.model(**data)
        if get_course_owner(obj) != self.request.user:
            raise PermissionDenied("Vous n'êtes pas l'instructeur de ce cours.")
        serializer.save()


class ModuleViewSet(CourseContentViewSet):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        return (
            Module.objects.filter(visible_courses_filter(self.request.user, "cours__"))
            .select_related("cours__instructeur")
            .prefetch_related("lessons__documents")
        )


class LessonViewSet(CourseContentViewSet):
    serializer_class = LessonSerializer

    def get_queryset(self):
        return (
            Lesson.objects.filter(visible_courses_filter(self.request.user, "module__cours__"))
            .select_related("module__cours__instructeur")
            .prefetch_related("documents")
        )


class DocumentViewSet(CourseContentViewSet):
    serializer_class = DocumentSerializer

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            visible_courses_filter(user, "cours__")
            | visible_courses_filter(user, "lecon__module__cours__")
        ).select_related("cours__instructeur", "lecon__module__cours__instructeur")


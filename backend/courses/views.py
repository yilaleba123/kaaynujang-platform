from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from authentication.permissions import IsAccountValidated, IsEnseignant, IsApprenant, IsAdminRole
from .models import Category, Course, Module, Lesson, Enrollment
from django.utils.translation import gettext_lazy as _
from .serializers import (
    CategorySerializer, CourseSerializer, ModuleSerializer,
    LessonSerializer, EnrollmentSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category._default_manager.all()  # pylint: disable=no-member
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Course._default_manager.all()  # pylint: disable=no-member
        if user.role == 'ENSEIGNANT':
            return Course._default_manager.filter(enseignant=user)  # pylint: disable=no-member
        # Pour les apprenants, afficher uniquement les cours publiés
        return Course._default_manager.filter(statut='PUBLIE')  # pylint: disable=no-member

    def perform_create(self, serializer):
        # Assigner automatiquement l'enseignant connecté lors de la création
        serializer.save(enseignant=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsApprenant])
    def enroll(self, request, pk=None):
        """Action permettant à un apprenant de s'inscrire à un cours."""
        cours = self.get_object()
        apprenant = request.user

        enrollment, created = Enrollment._default_manager.get_or_create(  # pylint: disable=no-member
            apprenant=apprenant,
            cours=cours
        )
        if not created:
            return Response(
                {'detail': "Vous êtes déjà inscrit à ce cours."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'status': f"Inscription réussie au cours '{cours.titre}'."},
            status=status.HTTP_201_CREATED
        )


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module._default_manager.all()  # pylint: disable=no-member
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson._default_manager.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Enrollment._default_manager.all()  # pylint: disable=no-member
        elif user.role == 'ENSEIGNANT':
            return Enrollment._default_manager.filter(cours__enseignant=user)  # pylint: disable=no-member
        return Enrollment._default_manager.filter(apprenant=user)  # pylint: disable=no-member 
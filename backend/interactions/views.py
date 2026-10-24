from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from authentication.permissions import IsAccountValidated
from .models import ForumTopic, ForumPost, Notification, Certificate
from .serializers import (
    ForumTopicSerializer, ForumPostSerializer,
    NotificationSerializer, CertificateSerializer
)


class ForumTopicViewSet(viewsets.ModelViewSet):
    queryset = ForumTopic.objects.all().order_by('-date_creation')  # pylint: disable=no-member
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


class ForumPostViewSet(viewsets.ModelViewSet):
    queryset = ForumPost.objects.all().order_by('date_creation')  # pylint: disable=no-member
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    def get_queryset(self):
        return Notification.objects.filter(destinataire=self.request.user)  # pylint: disable=no-member

    @action(detail=True, methods=['post'], url_path='mark-as-read')
    def mark_as_read(self, request, pk=None):
        """Marque une notification comme lue."""
        notification = self.get_object()
        notification.lu = True
        notification.save()
        return Response({'status': "Notification marquée comme lue."}, status=status.HTTP_200_OK)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Certificate.objects.all()  # pylint: disable=no-member
        if user.role == 'ENSEIGNANT':
            return Certificate.objects.filter(cours__enseignant=user)  # pylint: disable=no-member
        return Certificate.objects.filter(apprenant=user)  # pylint: disable=no-member
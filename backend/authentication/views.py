from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAdminRole
from .serializers import ProfileSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


# 1. API Connexion (Connexion par Email + Vérification validation admin + Jetons JWT)
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'Veuillez fournir un e-mail et un mot de passe.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Identifiants incorrects ou compte introuvable.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            return Response(
                {'detail': 'Identifiants incorrects.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.est_valide:
            return Response(
                {'detail': 'Votre compte est en attente de validation par l\'administration.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'est_valide': user.est_valide,
                },
            },
            status=status.HTTP_200_OK,
        )


# 2. API Inscription (Ouverte à tous + Gestion des fichiers diplôme/CV)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser] # <-- AJOUTÉ pour supporter les téléversements FormData


# 3. API Profil de l'utilisateur connecté (Lecture / Modification avec Photo)
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        user_serializer = self.get_serializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        # Mise à jour du profil (incluant la photo de profil)
        profile_serializer = ProfileSerializer(user.profile, data=request.data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()

        return Response(UserSerializer(user).data)


# 4. API Administration des Utilisateurs (Admin uniquement : Liste, Validation, Rôles)
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    @action(detail=True, methods=['post'], url_path='validate')
    def validate_user(self, request, pk=None):
        """Endpoint pour valider l'inscription d'un utilisateur par l'admin."""
        user = self.get_object()
        user.est_valide = True
        user.save()
        return Response({'status': f"Compte de {user.username} validé avec succès."})

    @action(detail=True, methods=['post'], url_path='invalidate')
    def invalidate_user(self, request, pk=None):
        """Endpoint pour suspendre ou invalider un utilisateur."""
        user = self.get_object()
        user.est_valide = False
        user.save()
        return Response({'status': f"Compte de {user.username} suspendu."})
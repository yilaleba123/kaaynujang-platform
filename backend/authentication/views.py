from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if user is None or not user.is_active or not user.est_actif:
            raise serializers.ValidationError("Identifiants invalides.")
        attrs["user"] = user
        return attrs


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"id": user.id, "email": user.email, "role": user.role},
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not isinstance(email, str):
            return Response(
                {"email": "Une adresse e-mail est requise."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            token = signing.dumps(
                {
                    "user_id": user.pk,
                    "token": default_token_generator.make_token(user),
                },
                salt="authentication.password-reset",
            )
            reset_url = (
                f"{settings.FRONTEND_URL}/reinitialiser-mot-de-passe"
                f"?token={token}"
            )
            send_mail(
                "Réinitialisation de votre mot de passe",
                f"Réinitialisez votre mot de passe en suivant ce lien : {reset_url}",
                None,
                [user.email],
                fail_silently=False,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        password = request.data.get("password")
        if not isinstance(token, str) or not isinstance(password, str):
            return Response(
                {"detail": "Le jeton et le nouveau mot de passe sont requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            payload = signing.loads(
                token,
                salt="authentication.password-reset",
                max_age=60 * 60,
            )
        except signing.BadSignature:
            return Response(
                {"token": "Lien invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.filter(pk=payload.get("user_id"), is_active=True).first()
        if (
            user is None
            or not default_token_generator.check_token(user, payload.get("token", ""))
        ):
            return Response(
                {"token": "Lien invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response(
                {"password": error.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(password)
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)

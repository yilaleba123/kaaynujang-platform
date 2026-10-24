from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from authentication.permissions import IsAccountValidated, IsApprenant
from interactions.models import Certificate, Notification
from .models import Quiz, Question, Choice, Result
from .serializers import QuizSerializer, QuestionSerializer, ResultSerializer, QuizSubmissionSerializer
from django.utils.translation import gettext_lazy as _

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()  # pylint: disable=no-member
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    @action(detail=True, methods=['post'], permission_classes=[IsApprenant], serializer_class=QuizSubmissionSerializer)
    def submit(self, request, pk=None):
        """Soumission d'un quiz avec calcul automatique du score et génération de certificat."""
        quiz = self.get_object()
        user = request.user
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_answers = serializer.validated_data['answers']
        total_points = 0
        earned_points = 0

        questions = {q.id: q for q in quiz.questions.all()}

        for ans in user_answers:
            q_id = ans.get('question_id')
            c_id = ans.get('choice_id')

            if q_id in questions:
                question = questions[q_id]
                total_points += question.points
                
                # Vérifier si le choix sélectionné est correct
                correct_choice = Choice.objects.filter(  # pylint: disable=no-member
                    id=c_id, question=question, est_correcte=True
                ).exists()  # pylint: disable=no-member
                if correct_choice:
                    earned_points += question.points

        if total_points == 0:
            return Response({'error': "Ce quiz ne contient aucune question valides."}, status=status.HTTP_400_BAD_REQUEST)

        score_pourcentage = round((earned_points / total_points) * 100, 2)
        est_reussi = score_pourcentage >= quiz.note_passage

        # pylint: disable=no-member
        result = Result.objects.create(
            apprenant=user,
            quiz=quiz,
            score_obtenu=score_pourcentage,
            reussi=est_reussi
        )

        # Délivrance automatique du certificat si le quiz est rattaché à un cours et réussi
        if est_reussi and quiz.cours:
            Certificate.objects.get_or_create(apprenant=user, cours=quiz.cours)
            Notification.objects.create(
                destinataire=user,
                titre="Félicitations !",
                message=f"Vous avez réussi le quiz '{quiz.titre}' avec un score de {score_pourcentage}%. Votre certificat est disponible."
            )

        return Response(ResultSerializer(result).data, status=status.HTTP_201_CREATED)


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()  # pylint: disable=no-member
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]


class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountValidated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Result.objects.all()  # pylint: disable=no-member
        if user.role == 'ENSEIGNANT':
            return Result.objects.filter(quiz__cours__enseignant=user)  # pylint: disable=no-member
        return Result.objects.filter(apprenant=user)  # pylint: disable=no-member
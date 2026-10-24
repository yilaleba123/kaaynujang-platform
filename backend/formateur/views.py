from django.contrib.auth import get_user_model, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.exceptions import ValidationError

from apprenant.models import Enrollment, LessonProgress
from authentication.models import UserProfile
from courses.models import Category, Course, Document, Lesson, Module
from .models import Conversation, Message, Notification, Quiz, QuizQuestion, Submission
from .serializers import CoursePayloadSerializer, QuizPayloadSerializer

User = get_user_model()


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "ENSEIGNANT"
        )


class IsLearner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "APPRENANT"
        )


def _user_name(user):
    return f"{user.first_name} {user.last_name}".strip() or user.username


def _course_status(course):
    if course.is_archived:
        return "archived"
    return "published" if course.is_published else "draft"


def _course_summary(course):
    return {
        "id": str(course.id),
        "title": course.titre,
        "category": course.categorie.nom,
        "learnersCount": course.enrollments.count(),
        "status": _course_status(course),
        "updatedAt": course.updated_at,
    }


def _course_detail(course):
    return {
        **_course_summary(course),
        "categoryId": str(course.categorie_id),
        "description": course.description,
        "level": course.niveau,
        "modules": [
            {
                "title": module.titre,
                "lessons": [
                    {
                        "title": lesson.titre,
                        "type": lesson.type,
                        "contentUrl": lesson.video_url or lesson.contenu,
                    }
                    for lesson in module.lessons.all()
                ],
            }
            for module in course.modules.all()
        ],
    }


def _save_course_payload(course, data):
    course.titre = data["title"]
    course.categorie = Category.objects.get(pk=data["categoryId"])
    course.description = data["description"]
    course.niveau = data["level"]
    course.is_published = data["status"] == "published"
    course.is_archived = False
    course.save()

    existing_modules = list(course.modules.all())
    for module_index, module_data in enumerate(data["modules"]):
        if module_index < len(existing_modules):
            module = existing_modules[module_index]
            module.titre = module_data["title"]
            module.ordre = module_index
            module.save()
        else:
            module = Module.objects.create(
                cours=course,
                titre=module_data["title"],
                ordre=module_index,
            )

        existing_lessons = list(module.lessons.all())
        for lesson_index, lesson_data in enumerate(module_data["lessons"]):
            content = lesson_data.get("contentUrl", "")
            lesson_values = {
                "titre": lesson_data["title"],
                "type": lesson_data["type"],
                "contenu": content,
                "video_url": content if lesson_data["type"] == "video" else "",
                "ordre": lesson_index,
            }
            if lesson_index < len(existing_lessons):
                lesson = existing_lessons[lesson_index]
                for field, value in lesson_values.items():
                    setattr(lesson, field, value)
                lesson.save()
            else:
                Lesson.objects.create(module=module, **lesson_values)
        for lesson in existing_lessons[len(module_data["lessons"]):]:
            lesson.delete()
    for module in existing_modules[len(data["modules"]):]:
        module.delete()


def _quiz_summary(quiz):
    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "courseTitle": quiz.course.titre,
        "questionsCount": quiz.questions.count(),
        "updatedAt": quiz.updated_at,
    }


def _save_quiz_payload(quiz, data):
    quiz.title = data["title"]
    quiz.course_id = data["courseId"]
    quiz.duration_minutes = data["durationMinutes"]
    quiz.save()
    quiz.questions.all().delete()
    QuizQuestion.objects.bulk_create(
        [
            QuizQuestion(
                quiz=quiz,
                text=question["text"],
                options=question["options"],
                correct_index=question["correctIndex"],
                order=index,
            )
            for index, question in enumerate(data["questions"])
        ]
    )


def _submission_data(submission, detail=False):
    quiz = submission.quiz
    result = {
        "id": str(submission.id),
        "learnerName": _user_name(submission.learner),
        "assessmentTitle": quiz.title,
        "courseTitle": quiz.course.titre,
        "submittedAt": submission.submitted_at,
        "status": "graded" if submission.grade is not None else "pending",
        "grade": submission.grade,
    }
    if detail:
        answers = []
        for question, selected_index in zip(
            quiz.questions.all(),
            submission.answers,
        ):
            options = question.options
            selected = (
                options[selected_index]
                if isinstance(selected_index, int)
                and 0 <= selected_index < len(options)
                else "Aucune réponse"
            )
            answers.append(
                f"{question.text}\nRéponse choisie : {selected}"
            )
        result.update(
            {
                "maxGrade": submission.max_grade,
                "textContent": "\n\n".join(answers),
                "fileUrl": None,
                "comment": submission.teacher_comment or None,
            }
        )
    return result


def _document_data(document):
    return {
        "id": str(document.id),
        "name": document.titre,
        "sizeBytes": document.fichier.size if document.fichier else 0,
        "courseTitle": (
            document.cours.titre
            if document.cours_id
            else document.lecon.module.cours.titre
        ),
        "uploadedAt": document.created_at,
        "url": document.fichier.url if document.fichier else "",
    }


def _notification_data(notification):
    return {
        "id": str(notification.id),
        "title": notification.title,
        "message": notification.message,
        "createdAt": notification.created_at,
        "read": notification.read_at is not None,
        "link": notification.link or None,
    }


@api_view(["GET"])
@permission_classes([IsTeacher])
def me(request):
    return Response(
        {
            "id": str(request.user.id),
            "firstName": request.user.first_name,
            "lastName": request.user.last_name,
        }
    )


@api_view(["GET"])
@permission_classes([IsTeacher])
def dashboard_stats(request):
    teacher_courses = Course.objects.filter(instructeur=request.user)
    return Response(
        {
            "publishedCourses": teacher_courses.filter(
                is_published=True, is_archived=False
            ).count(),
            "draftCourses": teacher_courses.filter(
                is_published=False, is_archived=False
            ).count(),
            "enrolledLearners": Enrollment.objects.filter(
                course__instructeur=request.user
            ).values("learner_id").distinct().count(),
            "pendingSubmissions": Submission.objects.filter(
                quiz__course__instructeur=request.user,
                grade__isnull=True,
            ).count(),
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsTeacher])
def courses(request):
    if request.method == "GET":
        queryset = Course.objects.filter(instructeur=request.user).select_related(
            "categorie"
        )
        search = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status")
        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search) | Q(categorie__nom__icontains=search)
            )
        if status_filter in {"published", "draft", "archived"}:
            queryset = queryset.filter(
                is_archived=status_filter == "archived",
                **(
                    {"is_published": True}
                    if status_filter == "published"
                    else {"is_published": False}
                    if status_filter == "draft"
                    else {}
                ),
            )
        limit = request.query_params.get("limit")
        if limit:
            try:
                queryset = queryset[:max(0, min(int(limit), 100))]
            except ValueError:
                return Response(
                    {"limit": "La limite doit être un entier."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response([_course_summary(course) for course in queryset])

    serializer = CoursePayloadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        course = Course(instructeur=request.user)
        _save_course_payload(course, serializer.validated_data)
    return Response(_course_summary(course), status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsTeacher])
def course_detail(request, course_id):
    course = get_object_or_404(
        Course.objects.prefetch_related("modules__lessons"),
        pk=course_id,
        instructeur=request.user,
    )
    if request.method == "GET":
        return Response(_course_detail(course))
    serializer = CoursePayloadSerializer(data=request.data, partial=request.method == "PATCH")
    serializer.is_valid(raise_exception=True)
    data = {
        "title": serializer.validated_data.get("title", course.titre),
        "categoryId": serializer.validated_data.get("categoryId", course.categorie_id),
        "description": serializer.validated_data.get("description", course.description),
        "level": serializer.validated_data.get("level", course.niveau),
        "status": serializer.validated_data.get("status", _course_status(course)),
        "modules": serializer.validated_data.get(
            "modules",
            [
                {
                    "title": module.titre,
                    "lessons": [
                        {
                            "title": lesson.titre,
                            "type": lesson.type,
                            "contentUrl": lesson.video_url or lesson.contenu,
                        }
                        for lesson in module.lessons.all()
                    ],
                }
                for module in course.modules.all()
            ],
        ),
    }
    with transaction.atomic():
        _save_course_payload(course, data)
    return Response(_course_summary(course))


@api_view(["PATCH"])
@permission_classes([IsTeacher])
def archive_course(request, course_id):
    course = get_object_or_404(Course, pk=course_id, instructeur=request.user)
    course.is_archived = True
    course.save(update_fields=["is_archived", "updated_at"])
    return Response(_course_summary(course))


@api_view(["GET"])
@permission_classes([IsTeacher])
def categories(request):
    return Response(
        [{"id": str(category.id), "name": category.nom} for category in Category.objects.all()]
    )


@api_view(["GET", "POST"])
@permission_classes([IsTeacher])
def quizzes(request):
    if request.method == "GET":
        queryset = Quiz.objects.filter(course__instructeur=request.user).select_related(
            "course"
        )
        return Response([_quiz_summary(quiz) for quiz in queryset])
    serializer = QuizPayloadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    course = get_object_or_404(
        Course, pk=serializer.validated_data["courseId"], instructeur=request.user
    )
    with transaction.atomic():
        quiz = Quiz(course=course)
        _save_quiz_payload(quiz, serializer.validated_data)
    return Response(_quiz_summary(quiz), status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsTeacher])
def quiz_detail(request, quiz_id):
    quiz = get_object_or_404(
        Quiz.objects.prefetch_related("questions"),
        pk=quiz_id,
        course__instructeur=request.user,
    )
    if request.method == "DELETE":
        if quiz.submissions.exists():
            return Response(
                {"detail": "Un quiz remis par des apprenants ne peut pas être supprimé."},
                status=status.HTTP_409_CONFLICT,
            )
        quiz.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    if request.method == "GET":
        return Response(
            {
                "id": str(quiz.id),
                "title": quiz.title,
                "courseId": str(quiz.course_id),
                "durationMinutes": quiz.duration_minutes,
                "questions": [
                    {
                        "text": question.text,
                        "options": question.options,
                        "correctIndex": question.correct_index,
                    }
                    for question in quiz.questions.all()
                ],
            }
        )
    if quiz.submissions.exists():
        return Response(
            {"detail": "Un quiz déjà remis ne peut plus être modifié."},
            status=status.HTTP_409_CONFLICT,
        )
    serializer = QuizPayloadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    course = get_object_or_404(
        Course,
        pk=serializer.validated_data["courseId"],
        instructeur=request.user,
    )
    with transaction.atomic():
        quiz.course = course
        _save_quiz_payload(quiz, serializer.validated_data)
    return Response(_quiz_summary(quiz))


@api_view(["GET"])
@permission_classes([IsTeacher])
def submissions(request):
    queryset = Submission.objects.filter(
        quiz__course__instructeur=request.user
    ).select_related("learner", "quiz__course")
    requested_status = request.query_params.get("status")
    if requested_status == "pending":
        queryset = queryset.filter(grade__isnull=True)
    elif requested_status == "graded":
        queryset = queryset.filter(grade__isnull=False)
    elif requested_status:
        return Response(
            {"status": "Valeur invalide."}, status=status.HTTP_400_BAD_REQUEST
        )
    return Response([_submission_data(item) for item in queryset])


@api_view(["GET"])
@permission_classes([IsTeacher])
def submissions_pending(request):
    queryset = Submission.objects.filter(
        quiz__course__instructeur=request.user,
        grade__isnull=True,
    ).select_related("learner", "quiz__course")
    limit = request.query_params.get("limit")
    if limit:
        try:
            queryset = queryset[:max(0, min(int(limit), 100))]
        except ValueError:
            return Response(
                {"limit": "La limite doit être un entier."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    return Response(
        [
            {
                "id": str(item.id),
                "title": item.quiz.title,
                "courseTitle": item.quiz.course.titre,
                "submissionsCount": 1,
            }
            for item in queryset
        ]
    )


@api_view(["GET"])
@permission_classes([IsTeacher])
def submission_detail(request, submission_id):
    submission = get_object_or_404(
        Submission.objects.select_related("learner", "quiz__course"),
        pk=submission_id,
        quiz__course__instructeur=request.user,
    )
    return Response(_submission_data(submission, detail=True))


@api_view(["POST"])
@permission_classes([IsTeacher])
def grade_submission(request, submission_id):
    submission = get_object_or_404(
        Submission,
        pk=submission_id,
        quiz__course__instructeur=request.user,
    )
    grade = request.data.get("grade")
    comment = request.data.get("comment", "")
    if not isinstance(grade, int) or not 0 <= grade <= 100:
        return Response(
            {"grade": "La note doit être un entier entre 0 et 100."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not isinstance(comment, str):
        return Response(
            {"comment": "Le commentaire doit être du texte."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    submission.grade = grade
    submission.teacher_comment = comment
    submission.graded_at = timezone.now()
    submission.save(update_fields=["grade", "teacher_comment", "graded_at"])
    Notification.objects.create(
        recipient=submission.learner,
        title="Votre quiz a été corrigé",
        message=f"Votre résultat pour « {submission.quiz.title} » est disponible.",
        link="/apprenant/resultats",
    )
    return Response(_submission_data(submission))


@api_view(["GET", "POST"])
@permission_classes([IsTeacher])
def documents(request):
    if request.method == "GET":
        queryset = Document.objects.filter(
            Q(cours__instructeur=request.user)
            | Q(lecon__module__cours__instructeur=request.user)
        ).select_related("cours", "lecon__module__cours")
        return Response([_document_data(document) for document in queryset])

    upload = request.FILES.get("file")
    course_id = request.data.get("courseId")
    if upload is None or not course_id:
        return Response(
            {"detail": "Le fichier et le cours sont requis."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    course = get_object_or_404(Course, pk=course_id, instructeur=request.user)
    document = Document.objects.create(
        titre=request.data.get("name") or upload.name,
        fichier=upload,
        cours=course,
    )
    return Response(_document_data(document), status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsTeacher])
def document_detail(request, document_id):
    document = get_object_or_404(
        Document.objects.filter(
            Q(cours__instructeur=request.user)
            | Q(lecon__module__cours__instructeur=request.user)
        ),
        pk=document_id,
    )
    if document.fichier:
        document.fichier.delete(save=False)
    document.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsTeacher])
def learners(request):
    enrollments = Enrollment.objects.filter(
        course__instructeur=request.user
    ).select_related("learner", "course").prefetch_related("lesson_progress")
    rows = []
    for enrollment in enrollments:
        total_lessons = Lesson.objects.filter(module__cours=enrollment.course).count()
        completed_lessons = enrollment.lesson_progress.count()
        rows.append(
            {
                "id": str(enrollment.learner_id),
                "fullName": _user_name(enrollment.learner),
                "email": enrollment.learner.email,
                "courseTitle": enrollment.course.titre,
                "progress": round(completed_lessons * 100 / total_lessons)
                if total_lessons
                else 0,
                "lastActivityAt": enrollment.enrolled_at,
            }
        )
    return Response(rows)


@api_view(["GET"])
@permission_classes([IsTeacher])
def stats(request):
    teacher_courses = Course.objects.filter(instructeur=request.user)
    learners_count = Enrollment.objects.filter(
        course__instructeur=request.user
    ).values("learner_id").distinct().count()
    grades = Submission.objects.filter(
        quiz__course__instructeur=request.user,
        grade__isnull=False,
    )
    course_stats = []
    total_expected_completions = 0
    total_completed_lessons = 0
    for course in teacher_courses:
        course_lessons = Lesson.objects.filter(module__cours=course).count()
        enrollment_count = Enrollment.objects.filter(course=course).count()
        course_progress = LessonProgress.objects.filter(
            enrollment__course=course
        ).count()
        total_expected_completions += course_lessons * enrollment_count
        total_completed_lessons += course_progress
        average_grade = Submission.objects.filter(
            quiz__course=course, grade__isnull=False
        ).aggregate(value=Avg("grade"))["value"]
        course_stats.append(
            {
                "courseTitle": course.titre,
                "learners": enrollment_count,
                "completionRate": round(course_progress * 100 / (course_lessons * enrollment_count))
                if course_lessons and enrollment_count
                else 0,
                "averageGrade": round(average_grade) if average_grade is not None else 0,
            }
        )
    return Response(
        {
            "learners": learners_count,
            "completionRate": round(
                total_completed_lessons * 100 / total_expected_completions
            )
            if total_expected_completions
            else 0,
            "averageGrade": round(grades.aggregate(value=Avg("grade"))["value"] or 0),
            "courses": course_stats,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsTeacher])
def conversations(request):
    queryset = Conversation.objects.filter(teacher=request.user).select_related("learner")
    if request.method == "POST":
        learner_id = request.data.get("learnerId")
        learner = get_object_or_404(User, pk=learner_id, role="APPRENANT")
        course_id = request.data.get("courseId")
        course = None
        if course_id:
            course = get_object_or_404(
                Course, pk=course_id, instructeur=request.user
            )
        conversation, _ = Conversation.objects.get_or_create(
            teacher=request.user,
            learner=learner,
            course=course,
        )
        return Response({"id": str(conversation.id)}, status=status.HTTP_201_CREATED)

    result = []
    for conversation in queryset:
        latest = conversation.messages.order_by("-sent_at").first()
        unread = conversation.messages.filter(
            sender=conversation.learner,
            read_at__isnull=True,
        ).count()
        result.append(
            {
                "id": str(conversation.id),
                "participantName": _user_name(conversation.learner),
                "lastMessage": latest.content if latest else "",
                "lastMessageAt": latest.sent_at if latest else conversation.created_at,
                "unreadCount": unread,
            }
        )
    return Response(result)


@api_view(["GET", "POST"])
@permission_classes([IsTeacher])
def messages(request, conversation_id):
    conversation = get_object_or_404(
        Conversation, pk=conversation_id, teacher=request.user
    )
    if request.method == "POST":
        content = request.data.get("content", "").strip()
        if not content:
            return Response(
                {"content": "Le message ne peut pas être vide."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
        )
        conversation.save(update_fields=["updated_at"])
        Notification.objects.create(
            recipient=conversation.learner,
            title="Nouveau message",
            message=f"{_user_name(request.user)} vous a envoyé un message.",
            link="/apprenant/messagerie",
        )
        return Response(
            {
                "id": str(message.id),
                "fromMe": True,
                "content": message.content,
                "sentAt": message.sent_at,
            },
            status=status.HTTP_201_CREATED,
        )

    conversation.messages.filter(
        sender=conversation.learner,
        read_at__isnull=True,
    ).update(read_at=timezone.now())
    return Response(
        [
            {
                "id": str(message.id),
                "fromMe": message.sender_id == request.user.id,
                "content": message.content,
                "sentAt": message.sent_at,
            }
            for message in conversation.messages.all()
        ]
    )


@api_view(["GET", "PUT"])
@permission_classes([IsTeacher])
def profile(request):
    user = request.user
    profile_data, _ = UserProfile.objects.get_or_create(user=user)
    if request.method == "PUT":
        for field in ("firstName", "lastName"):
            if field in request.data:
                setattr(user, "first_name" if field == "firstName" else "last_name", request.data[field])
        if "email" in request.data and request.data["email"] != user.email:
            if User.objects.filter(email__iexact=request.data["email"]).exclude(pk=user.pk).exists():
                return Response(
                    {"email": "Cette adresse e-mail est déjà utilisée."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.email = request.data["email"]
            user.username = request.data["email"]
        for field in ("phone", "bio"):
            if field in request.data:
                setattr(profile_data, field, request.data[field])
        user.save()
        profile_data.save()
    return Response(
        {
            "id": str(user.id),
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "phone": profile_data.phone or None,
            "bio": profile_data.bio or None,
        }
    )


@api_view(["POST"])
@permission_classes([IsTeacher])
def change_password(request):
    current_password = request.data.get("currentPassword")
    new_password = request.data.get("newPassword")
    if not isinstance(current_password, str) or not request.user.check_password(current_password):
        return Response(
            {"currentPassword": "Le mot de passe actuel est incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not isinstance(new_password, str) or len(new_password) < 8:
        return Response(
            {"newPassword": "Le nouveau mot de passe doit contenir au moins 8 caractères."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        validate_password(new_password, request.user)
    except ValidationError as error:
        return Response(
            {"newPassword": error.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )
    request.user.set_password(new_password)
    request.user.save(update_fields=["password"])
    update_session_auth_hash(request, request.user)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST", "PATCH"])
@permission_classes([IsTeacher])
def notifications(request, notification_id=None):
    queryset = Notification.objects.filter(recipient=request.user)
    if request.method == "GET":
        return Response([_notification_data(item) for item in queryset])
    if request.path.endswith("/read-all/"):
        queryset.filter(read_at__isnull=True).update(read_at=timezone.now())
        return Response(status=status.HTTP_204_NO_CONTENT)
    notification = get_object_or_404(queryset, pk=notification_id)
    if request.method == "PATCH":
        notification.read_at = timezone.now()
        notification.save(update_fields=["read_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

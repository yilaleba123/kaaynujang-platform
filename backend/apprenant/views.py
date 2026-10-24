from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from authentication.models import UserProfile
from courses.models import Course, Lesson
from formateur.models import Conversation, Message, Notification, Quiz, Submission
from apprenant.models import (
    Certificate,
    DiscussionComment,
    DiscussionPost,
    Enrollment,
    LessonProgress,
)

User = get_user_model()


class IsLearner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "APPRENANT"
        )


def _user_name(user):
    return f"{user.first_name} {user.last_name}".strip() or user.username


def _course_progress(enrollment):
    total = Lesson.objects.filter(module__cours=enrollment.course).count()
    completed = enrollment.lesson_progress.count()
    return round(completed * 100 / total) if total else 0


def _course_data(course, learner=None, detail=False):
    enrollment = None
    if learner is not None:
        enrollment = Enrollment.objects.filter(learner=learner, course=course).first()
    modules = []
    if detail:
        for module in course.modules.prefetch_related("lessons"):
            modules.append(
                {
                    "id": module.id,
                    "titre": module.titre,
                    "lecons": [
                        {
                            "id": lesson.id,
                            "titre": lesson.titre,
                            "contenu": lesson.contenu if enrollment else "",
                            "type": lesson.type,
                            "video_url": lesson.video_url if enrollment else "",
                            "completed": bool(
                                enrollment
                                and enrollment.lesson_progress.filter(lesson=lesson).exists()
                            ),
                        }
                        for lesson in module.lessons.all()
                    ],
                }
            )
    return {
        "id": course.id,
        "titre": course.titre,
        "description": course.description,
        "image": "",
        "niveau": course.get_niveau_display(),
        "categorie": course.categorie.nom,
        "formateur": _user_name(course.instructeur),
        "progression": _course_progress(enrollment) if enrollment else 0,
        "est_inscrit": enrollment is not None,
        "modules": modules,
    }


@api_view(["GET", "PUT"])
@permission_classes([IsLearner])
def learner_profile(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if request.method == "PUT":
        for key, field in (("firstName", "first_name"), ("lastName", "last_name")):
            if key in request.data:
                setattr(user, field, request.data[key])
        if "phone" in request.data:
            profile.phone = request.data["phone"]
        if "bio" in request.data:
            profile.bio = request.data["bio"]
        user.save()
        profile.save()
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role,
            "phone": profile.phone,
            "bio": profile.bio,
        }
    )


@api_view(["GET"])
@permission_classes([IsLearner])
def catalogue(request):
    queryset = Course.objects.filter(
        is_published=True,
        is_archived=False,
    ).select_related("categorie", "instructeur")
    search = request.query_params.get("search", "").strip()
    if search:
        queryset = queryset.filter(
            Q(titre__icontains=search)
            | Q(description__icontains=search)
            | Q(categorie__nom__icontains=search)
        )
    return Response([_course_data(course, request.user) for course in queryset])


@api_view(["GET", "POST"])
@permission_classes([IsLearner])
def learner_courses(request, course_id=None):
    if request.method == "POST":
        course = get_object_or_404(
            Course,
            pk=course_id,
            is_published=True,
            is_archived=False,
        )
        enrollment, created = Enrollment.objects.get_or_create(
            learner=request.user,
            course=course,
        )
        return Response(
            {
                "courseId": course.id,
                "enrolled": True,
                "enrolledAt": enrollment.enrolled_at,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    if course_id is not None:
        course = get_object_or_404(
            Course.objects.select_related("categorie", "instructeur").prefetch_related(
                "modules__lessons"
            ),
            pk=course_id,
            is_published=True,
            is_archived=False,
        )
        return Response(_course_data(course, request.user, detail=True))

    queryset = Course.objects.filter(
        enrollments__learner=request.user,
        is_archived=False,
    ).select_related("categorie", "instructeur").prefetch_related(
        "modules__lessons",
        "enrollments__lesson_progress",
    ).distinct()
    return Response([_course_data(course, request.user, detail=True) for course in queryset])


@api_view(["POST", "DELETE"])
@permission_classes([IsLearner])
def complete_lesson(request, lesson_id):
    lesson = get_object_or_404(
        Lesson.objects.select_related("module__cours"),
        pk=lesson_id,
        module__cours__is_published=True,
        module__cours__is_archived=False,
    )
    enrollment = get_object_or_404(
        Enrollment,
        learner=request.user,
        course=lesson.module.cours,
    )
    progress, created = LessonProgress.objects.get_or_create(
        enrollment=enrollment,
        lesson=lesson,
    )
    if request.method == "DELETE":
        progress.delete()
        Certificate.objects.filter(enrollment=enrollment).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    total_lessons = Lesson.objects.filter(module__cours=lesson.module.cours).count()
    completed_lessons = enrollment.lesson_progress.count()
    if total_lessons and total_lessons == completed_lessons:
        Certificate.objects.get_or_create(enrollment=enrollment)
    return Response(
        {"lessonId": lesson.id, "completed": True},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsLearner])
def learner_progress(request):
    enrollments = Enrollment.objects.filter(
        learner=request.user
    ).select_related("course").prefetch_related("lesson_progress")
    return Response(
        [
            {
                "courseId": enrollment.course_id,
                "courseTitle": enrollment.course.titre,
                "progress": _course_progress(enrollment),
                "completedLessons": enrollment.lesson_progress.count(),
                "totalLessons": Lesson.objects.filter(
                    module__cours=enrollment.course
                ).count(),
                "updatedAt": enrollment.enrolled_at,
            }
            for enrollment in enrollments
        ]
    )


@api_view(["GET"])
@permission_classes([IsLearner])
def learner_results(request):
    submissions = Submission.objects.filter(
        learner=request.user
    ).select_related("quiz__course")
    return Response(
        [
            {
                "id": str(submission.id),
                "quizTitle": submission.quiz.title,
                "courseTitle": submission.quiz.course.titre,
                "grade": submission.grade,
                "maxGrade": submission.max_grade,
                "submittedAt": submission.submitted_at,
                "comment": submission.teacher_comment or None,
            }
            for submission in submissions
        ]
    )


@api_view(["GET"])
@permission_classes([IsLearner])
def learner_certificates(request):
    certificates = Certificate.objects.filter(
        enrollment__learner=request.user
    ).select_related("enrollment__course")
    return Response(
        [
            {
                "id": str(certificate.certificate_number),
                "courseTitle": certificate.enrollment.course.titre,
                "issuedAt": certificate.issued_at,
            }
            for certificate in certificates
        ]
    )


@api_view(["GET"])
@permission_classes([IsLearner])
def learner_quizzes(request):
    quizzes = Quiz.objects.filter(
        course__enrollments__learner=request.user,
        course__is_published=True,
        course__is_archived=False,
    ).select_related("course").distinct()
    return Response(
        [
            {
                "id": str(quiz.id),
                "title": quiz.title,
                "courseTitle": quiz.course.titre,
                "durationMinutes": quiz.duration_minutes,
                "questionsCount": quiz.questions.count(),
                "updatedAt": quiz.updated_at,
                "attempted": Submission.objects.filter(
                    quiz=quiz,
                    learner=request.user,
                ).exists(),
            }
            for quiz in quizzes
        ]
    )


@api_view(["GET", "POST"])
@permission_classes([IsLearner])
def learner_quiz(request, quiz_id):
    quiz = get_object_or_404(
        Quiz.objects.prefetch_related("questions"),
        pk=quiz_id,
        course__enrollments__learner=request.user,
        course__is_published=True,
        course__is_archived=False,
    )
    if request.method == "GET":
        return Response(
            {
                "id": str(quiz.id),
                "title": quiz.title,
                "courseTitle": quiz.course.titre,
                "durationMinutes": quiz.duration_minutes,
                "questionsCount": quiz.questions.count(),
                "attempted": Submission.objects.filter(
                    quiz=quiz,
                    learner=request.user,
                ).exists(),
                "questions": [
                    {
                        "id": question.id,
                        "text": question.text,
                        "options": question.options,
                    }
                    for question in quiz.questions.all()
                ],
            }
        )

    if Submission.objects.filter(quiz=quiz, learner=request.user).exists():
        return Response(
            {"detail": "Cette évaluation a déjà été remise."},
            status=status.HTTP_409_CONFLICT,
        )
    answers = request.data.get("answers")
    if not isinstance(answers, list) or len(answers) != quiz.questions.count():
        return Response(
            {"answers": "Une réponse est requise pour chaque question."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    questions = list(quiz.questions.all())
    if any(
        not isinstance(answer, int)
        or isinstance(answer, bool)
        or answer < 0
        or answer >= len(question.options)
        for question, answer in zip(questions, answers)
    ):
        return Response(
            {"answers": "Une ou plusieurs réponses sont invalides."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    correct = sum(
        answer == question.correct_index
        for question, answer in zip(questions, answers)
    )
    grade = round(correct * 100 / len(questions)) if questions else 0
    submission, created = Submission.objects.get_or_create(
        quiz=quiz,
        learner=request.user,
        defaults={
            "answers": answers,
            "grade": grade,
        },
    )
    if not created:
        return Response(
            {"detail": "Cette évaluation a déjà été remise."},
            status=status.HTTP_409_CONFLICT,
        )
    return Response(
        {
            "id": str(submission.id),
            "grade": grade,
            "maxGrade": 100,
            "submittedAt": submission.submitted_at,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([IsLearner])
def conversations(request):
    queryset = Conversation.objects.filter(learner=request.user).select_related("teacher")
    if request.method == "POST":
        teacher_id = request.data.get("teacherId")
        course_id = request.data.get("courseId")
        course = None
        if course_id:
            course = get_object_or_404(
                Course,
                pk=course_id,
                enrollments__learner=request.user,
            )
            teacher = get_object_or_404(
                User,
                pk=teacher_id,
                role="ENSEIGNANT",
                courses_enseignes=course,
            )
        else:
            teacher = get_object_or_404(
                User,
                pk=teacher_id,
                role="ENSEIGNANT",
                courses_enseignes__enrollments__learner=request.user,
            )
        conversation, created = Conversation.objects.get_or_create(
            teacher=teacher,
            learner=request.user,
            course=course,
        )
        return Response(
            {"id": str(conversation.id)},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
    result = []
    for conversation in queryset:
        latest = conversation.messages.order_by("-sent_at").first()
        unread = conversation.messages.filter(
            sender=conversation.teacher,
            read_at__isnull=True,
        ).count()
        result.append(
            {
                "id": str(conversation.id),
                "participantName": _user_name(conversation.teacher),
                "lastMessage": latest.content if latest else "",
                "lastMessageAt": latest.sent_at if latest else conversation.created_at,
                "unreadCount": unread,
            }
        )
    return Response(result)


@api_view(["GET", "POST"])
@permission_classes([IsLearner])
def conversation_messages(request, conversation_id):
    conversation = get_object_or_404(
        Conversation,
        pk=conversation_id,
        learner=request.user,
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
            recipient=conversation.teacher,
            title="Nouveau message",
            message=f"{_user_name(request.user)} vous a envoyé un message.",
            link="/formateur/messagerie",
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
        sender=conversation.teacher,
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


@api_view(["GET", "PATCH", "POST"])
@permission_classes([IsLearner])
def learner_notifications(request, notification_id=None):
    queryset = Notification.objects.filter(recipient=request.user)
    if request.method == "GET":
        return Response(
            [
                {
                    "id": str(item.id),
                    "title": item.title,
                    "message": item.message,
                    "createdAt": item.created_at,
                    "read": item.read_at is not None,
                    "link": item.link or None,
                }
                for item in queryset
            ]
        )
    if request.path.endswith("/read-all/"):
        queryset.filter(read_at__isnull=True).update(read_at=timezone.now())
        return Response(status=status.HTTP_204_NO_CONTENT)
    notification = get_object_or_404(queryset, pk=notification_id)
    notification.read_at = timezone.now()
    notification.save(update_fields=["read_at"])
    return Response(status=status.HTTP_204_NO_CONTENT)


def _discussion_post_data(post):
    return {
        "id": post.id,
        "courseId": post.course_id,
        "courseTitle": post.course.titre,
        "author": _user_name(post.author),
        "content": post.content,
        "createdAt": post.created_at,
        "comments": [
            {
                "id": comment.id,
                "author": _user_name(comment.author),
                "content": comment.content,
                "createdAt": comment.created_at,
            }
            for comment in post.comments.select_related("author").all()
        ],
    }


@api_view(["GET", "POST"])
@permission_classes([IsLearner])
def discussion_posts(request):
    if request.method == "GET":
        queryset = DiscussionPost.objects.filter(
            course__enrollments__learner=request.user
        ).select_related("course", "author").prefetch_related("comments__author")
        course_id = request.query_params.get("courseId")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return Response([_discussion_post_data(post) for post in queryset])

    course_id = request.data.get("courseId")
    content = request.data.get("content", "").strip()
    if not course_id or not content:
        return Response(
            {"detail": "Le cours et le contenu du message sont requis."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    enrollment = get_object_or_404(
        Enrollment.objects.select_related("course__instructeur"),
        learner=request.user,
        course_id=course_id,
    )
    post = DiscussionPost.objects.create(
        course=enrollment.course,
        author=request.user,
        content=content,
    )
    Notification.objects.create(
        recipient=enrollment.course.instructeur,
        title="Nouvelle discussion",
        message=f"{_user_name(request.user)} a publié un message dans « {enrollment.course.titre} ».",
        link="/formateur/apprenants",
    )
    return Response(_discussion_post_data(post), status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsLearner])
def discussion_comments(request, post_id):
    post = get_object_or_404(
        DiscussionPost.objects.select_related("course", "author"),
        pk=post_id,
        course__enrollments__learner=request.user,
    )
    if request.method == "GET":
        return Response(
            [
                {
                    "id": comment.id,
                    "author": _user_name(comment.author),
                    "content": comment.content,
                    "createdAt": comment.created_at,
                }
                for comment in post.comments.select_related("author").all()
            ]
        )

    content = request.data.get("content", "").strip()
    if not content:
        return Response(
            {"content": "Le commentaire ne peut pas être vide."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    comment = DiscussionComment.objects.create(
        post=post,
        author=request.user,
        content=content,
    )
    if post.author_id != request.user.id:
        Notification.objects.create(
            recipient=post.author,
            title="Réponse à votre discussion",
            message=f"{_user_name(request.user)} a répondu à votre message.",
            link="/apprenant/forum",
        )
    return Response(
        {
            "id": comment.id,
            "author": _user_name(comment.author),
            "content": comment.content,
            "createdAt": comment.created_at,
        },
        status=status.HTTP_201_CREATED,
    )

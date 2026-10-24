from django.urls import path

from .views import (
    catalogue,
    complete_lesson,
    conversation_messages,
    conversations,
    discussion_comments,
    discussion_posts,
    learner_courses,
    learner_certificates,
    learner_notifications,
    learner_profile,
    learner_progress,
    learner_quiz,
    learner_quizzes,
    learner_results,
)

urlpatterns = [
    path("profile/", learner_profile, name="apprenant-profile"),
    path("catalogue/", catalogue, name="apprenant-catalogue"),
    path("courses/", learner_courses, name="apprenant-courses"),
    path("courses/<int:course_id>/", learner_courses, name="apprenant-course-detail"),
    path("courses/<int:course_id>/enroll/", learner_courses, name="apprenant-course-enroll"),
    path("lessons/<int:lesson_id>/complete/", complete_lesson, name="apprenant-lesson-complete"),
    path("progress/", learner_progress, name="apprenant-progress"),
    path("results/", learner_results, name="apprenant-results"),
    path("certificates/", learner_certificates, name="apprenant-certificates"),
    path("quizzes/", learner_quizzes, name="apprenant-quizzes"),
    path("quizzes/<int:quiz_id>/", learner_quiz, name="apprenant-quiz"),
    path("conversations/", conversations, name="apprenant-conversations"),
    path("forum/posts/", discussion_posts, name="apprenant-forum-posts"),
    path(
        "forum/posts/<int:post_id>/comments/",
        discussion_comments,
        name="apprenant-forum-comments",
    ),
    path(
        "conversations/<int:conversation_id>/messages/",
        conversation_messages,
        name="apprenant-conversation-messages",
    ),
    path("notifications/", learner_notifications, name="apprenant-notifications"),
    path(
        "notifications/read-all/",
        learner_notifications,
        name="apprenant-notifications-read-all",
    ),
    path(
        "notifications/<int:notification_id>/read/",
        learner_notifications,
        name="apprenant-notification-read",
    ),
]

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from courses.models import Category
from formateur.models import Submission

User = get_user_model()


class TeacherApiTests(TestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            username="teacher@example.test",
            email="teacher@example.test",
            password="Strong-Testing-Password-827!",
            role="ENSEIGNANT",
        )
        self.learner = User.objects.create_user(
            username="learner@example.test",
            email="learner@example.test",
            password="Strong-Testing-Password-827!",
            role="APPRENANT",
        )
        self.category = Category.objects.create(nom="Développement")
        self.client = APIClient()
        self.client.force_authenticate(self.teacher)

    def test_course_quiz_submission_and_grading_flow(self):
        course_response = self.client.post(
            "/api/formateur/courses/",
            {
                "title": "Django",
                "categoryId": self.category.id,
                "description": "Cours de test",
                "level": "beginner",
                "status": "published",
                "modules": [
                    {
                        "title": "Bases",
                        "lessons": [
                            {
                                "title": "Installation",
                                "type": "text",
                                "contentUrl": "Contenu",
                            }
                        ],
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(course_response.status_code, 201)
        course_id = course_response.data["id"]

        quiz_response = self.client.post(
            "/api/formateur/quizzes/",
            {
                "title": "Quiz Django",
                "courseId": int(course_id),
                "durationMinutes": 10,
                "questions": [
                    {
                        "text": "Quel framework ?",
                        "options": ["Django", "Vue"],
                        "correctIndex": 0,
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(quiz_response.status_code, 201)
        quiz_id = quiz_response.data["id"]

        from apprenant.models import Enrollment
        from formateur.models import Quiz

        quiz = Quiz.objects.get(pk=quiz_id)
        Enrollment.objects.create(learner=self.learner, course=quiz.course)
        self.client.force_authenticate(self.learner)
        response = self.client.post(
            f"/api/apprenant/quizzes/{quiz_id}/",
            {"answers": [0]},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        submission = Submission.objects.get(pk=response.data["id"])
        self.assertEqual(submission.grade, 100)

        self.client.force_authenticate(self.teacher)
        response = self.client.get("/api/formateur/submissions/?status=pending")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        response = self.client.post(
            f"/api/formateur/submissions/{submission.id}/grade/",
            {"grade": 95, "comment": "Bon travail."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["grade"], 95)

    def test_teacher_sees_only_own_courses(self):
        response = self.client.get("/api/formateur/courses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])

    def test_learner_cannot_access_teacher_api(self):
        self.client.force_authenticate(self.learner)
        response = self.client.get("/api/formateur/courses/")
        self.assertEqual(response.status_code, 403)

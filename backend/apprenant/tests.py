from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from courses.models import Category, Course, Lesson, Module

User = get_user_model()


class LearnerApiTests(TestCase):
    def setUp(self):
        self.learner = User.objects.create_user(
            username="learner@example.test",
            email="learner@example.test",
            password="Strong-Testing-Password-827!",
            role="APPRENANT",
        )
        self.teacher = User.objects.create_user(
            username="teacher@example.test",
            email="teacher@example.test",
            password="Strong-Testing-Password-827!",
            role="ENSEIGNANT",
        )
        category = Category.objects.create(nom="Développement")
        self.course = Course.objects.create(
            titre="Django",
            description="Cours de test",
            categorie=category,
            instructeur=self.teacher,
            is_published=True,
        )
        module = Module.objects.create(cours=self.course, titre="Bases")
        self.lesson = Lesson.objects.create(
            module=module,
            titre="Installation",
            contenu="Contenu de test",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.learner)

    def test_catalogue_enrollment_and_progress_are_persisted(self):
        response = self.client.get("/api/apprenant/catalogue/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertFalse(response.data[0]["est_inscrit"])

        response = self.client.post(
            f"/api/apprenant/courses/{self.course.id}/enroll/",
            {},
        )
        self.assertEqual(response.status_code, 201)

        response = self.client.get("/api/apprenant/courses/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data[0]["est_inscrit"])
        self.assertEqual(response.data[0]["modules"][0]["lecons"][0]["id"], self.lesson.id)

        response = self.client.post(
            f"/api/apprenant/lessons/{self.lesson.id}/complete/",
            {},
        )
        self.assertEqual(response.status_code, 201)
        response = self.client.get("/api/apprenant/progress/")
        self.assertEqual(response.data[0]["progress"], 100)
        response = self.client.get("/api/apprenant/certificates/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_learner_cannot_read_an_unpublished_course(self):
        self.course.is_published = False
        self.course.save()
        response = self.client.get(f"/api/apprenant/courses/{self.course.id}/")
        self.assertEqual(response.status_code, 404)

    def test_catalogue_does_not_expose_lesson_content_before_enrollment(self):
        response = self.client.get(f"/api/apprenant/courses/{self.course.id}/")
        self.assertEqual(response.status_code, 200)
        lesson = response.data["modules"][0]["lecons"][0]
        self.assertEqual(lesson["contenu"], "")

    def test_teacher_cannot_use_learner_endpoints(self):
        self.client.force_authenticate(self.teacher)
        response = self.client.get("/api/apprenant/courses/")
        self.assertEqual(response.status_code, 403)

    def test_enrolled_learner_can_create_forum_post_and_comment(self):
        from apprenant.models import Enrollment

        Enrollment.objects.create(learner=self.learner, course=self.course)
        response = self.client.post(
            "/api/apprenant/forum/posts/",
            {"courseId": self.course.id, "content": "Question sur la leçon"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        post_id = response.data["id"]
        response = self.client.post(
            f"/api/apprenant/forum/posts/{post_id}/comments/",
            {"content": "Voici une réponse."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        response = self.client.get(
            f"/api/apprenant/forum/posts/?courseId={self.course.id}"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["comments"][0]["content"], "Voici une réponse.")

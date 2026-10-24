from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def test_register_and_login_with_email(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "learner@example.test",
                "password": "Strong-Testing-Password-827!",
                "firstName": "Awa",
                "lastName": "Diop",
                "role": "student",
                "trainingCenter": "Centre de Dakar",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="learner@example.test")
        self.assertEqual(user.role, "APPRENANT")
        self.assertTrue(user.check_password("Strong-Testing-Password-827!"))
        self.assertEqual(user.profile.training_center, "Centre de Dakar")

        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "learner@example.test",
                "password": "Strong-Testing-Password-827!",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["token"])
        self.assertEqual(response.data["role"], "APPRENANT")

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="existing@example.test",
            email="existing@example.test",
            password="Strong-Testing-Password-827!",
        )
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "EXISTING@example.test",
                "password": "Another-Strong-Password-843!",
                "firstName": "Awa",
                "lastName": "Diop",
                "role": "teacher",
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 400)

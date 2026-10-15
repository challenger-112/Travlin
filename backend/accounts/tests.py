from datetime import timedelta

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from accounts.models import UserSession
from accounts.serializers import UserProfileSerializer


class JwtLoginTests(APITestCase):
    def setUp(self):
        cache.clear()

    def create_user(self):
        response = self.client.post(
            "/api/signup/",
            {
                "username": "traveler",
                "email": "traveler@example.com",
                "password": "safe-password-123",
                "confirm_password": "safe-password-123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_login_returns_tokens_that_authorize_post_creation(self):
        self.create_user()
        response = self.client.post(
            "/api/login/",
            {"username": "traveler@example.com", "password": "safe-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertTrue(User.objects.filter(username="traveler").exists())

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        post_response = self.client.post(
            "/api/posts/add/",
            {"place": "Ladakh", "caption": "A trip to remember"},
            format="json",
        )

        self.assertEqual(post_response.status_code, 201)

    def test_refresh_extends_active_session_and_rejects_idle_session(self):
        self.create_user()
        login_response = self.client.post(
            "/api/login/",
            {"username": "traveler", "password": "safe-password-123"},
            format="json",
        )
        refresh_response = self.client.post(
            "/api/token/refresh/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(refresh_response.status_code, 200)
        self.assertIn("access", refresh_response.data)
        self.assertIn("refresh", refresh_response.data)

        session = UserSession.objects.get(user__username="traveler")
        UserSession.objects.filter(pk=session.pk).update(
            last_activity=timezone.now() - timedelta(minutes=6)
        )
        expired_response = self.client.post(
            "/api/token/refresh/",
            {"refresh": refresh_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(expired_response.status_code, 401)
        self.assertFalse(UserSession.objects.filter(pk=session.pk).exists())

    def test_login_ignores_invalid_existing_bearer_token(self):
        self.create_user()
        self.client.credentials(HTTP_AUTHORIZATION="Bearer stale-or-refresh-token")

        response = self.client.post(
            "/api/login/",
            {"username": "traveler", "password": "safe-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)


    def test_logout_deletes_only_the_session_from_its_refresh_token(self):
        self.create_user()
        login_response = self.client.post(
            "/api/login/",
            {"username": "traveler", "password": "safe-password-123"},
            format="json",
        )
        current_session = UserSession.objects.get(user__username="traveler")
        other_user = User.objects.create_user(
            username="another-traveler",
            password="safe-password-123",
        )
        other_session = UserSession.objects.create(user=other_user)

        response = self.client.post(
            "/api/logout/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(UserSession.objects.filter(pk=current_session.pk).exists())
        self.assertTrue(UserSession.objects.filter(pk=other_session.pk).exists())

        refresh_response = self.client.post(
            "/api/token/refresh/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, 401)

    def test_logout_cleans_up_idle_database_sessions(self):
        self.create_user()
        login_response = self.client.post(
            "/api/login/",
            {"username": "traveler", "password": "safe-password-123"},
            format="json",
        )
        session = UserSession.objects.get(user__username="traveler")
        UserSession.objects.filter(pk=session.pk).update(
            last_activity=timezone.now() - timedelta(minutes=6)
        )

        response = self.client.post(
            "/api/logout/",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(UserSession.objects.filter(pk=session.pk).exists())


class UserProfileApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        response = self.client.post(
            "/api/signup/",
            {
                "username": "profileuser",
                "email": "profile@example.com",
                "password": "safe-password-123",
                "confirm_password": "safe-password-123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        login_response = self.client.post(
            "/api/login/",
            {"username": "profileuser", "password": "safe-password-123"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

    def test_profile_returns_signed_in_user_details(self):
        response = self.client.get("/api/profile/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "profileuser")
        self.assertEqual(response.data["email"], "profile@example.com")
        self.assertIn("date_of_birth", response.data)

    def test_profile_updates_personal_details(self):
        response = self.client.patch(
            "/api/profile/",
            {
                "first_name": "Taylor",
                "last_name": "Traveler",
                "date_of_birth": "1995-05-12",
                "bio": "I love hiking.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], "Taylor")
        self.assertEqual(response.data["last_name"], "Traveler")
        self.assertEqual(response.data["date_of_birth"], "1995-05-12")

    def test_profile_picture_over_one_megabyte_is_rejected(self):
        picture = SimpleUploadedFile(
            "large.png",
            b"x" * (1024 * 1024 + 1),
            content_type="image/png",
        )

        with self.assertRaises(ValidationError):
            UserProfileSerializer().validate_profile_picture(picture)

from datetime import timedelta
import tempfile

from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import UserSession
from operations.models import Post


class JwtCommentTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="traveler", password="safe-password-123")
        self.post = Post.objects.create(
            place="Ladakh",
            caption="A trip to remember",
            author=self.user,
        )
        self.session = UserSession.objects.create(user=self.user)
        refresh = RefreshToken.for_user(self.user)
        refresh["sid"] = str(self.session.pk)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    def test_comment_creation_uses_authenticated_user_and_updates_count(self):
        response = self.client.post(
            f"/api/posts/{self.post.pk}/comments/",
            {"content": "What a view!"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.post.comments.count(), 1)
        self.post.refresh_from_db()
        self.assertEqual(self.post.comments_count, 1)

    def test_my_posts_only_returns_authenticated_users_posts(self):
        other_user = User.objects.create_user(
            username="other-traveler",
            password="safe-password-123",
        )
        Post.objects.create(
            place="Ooty",
            caption="Someone else's post",
            author=other_user,
        )

        response = self.client.get("/api/posts/mine/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["place"], "Ladakh")

    def test_authenticated_user_can_create_post_with_multiple_media_files(self):
        files = [
            SimpleUploadedFile(
                "mountain.jpg",
                b"image content",
                content_type="image/jpeg",
            ),
            SimpleUploadedFile(
                "walkthrough.mp4",
                b"video content",
                content_type="video/mp4",
            ),
        ]

        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                response = self.client.post(
                    "/api/posts/add/",
                    {
                        "place": "Ladakh",
                        "caption": "A trip to remember",
                        "media": files,
                    },
                    format="multipart",
                )

                self.assertEqual(response.status_code, 201, response.data)
                self.assertEqual(response.data["author"], self.user.username)
                self.assertEqual(len(response.data["media_items"]), 2)
                self.assertEqual(
                    [item["type"] for item in response.data["media_items"]],
                    ["image", "video"],
                )
                created_post = Post.objects.get(pk=response.data["id"])
                self.assertEqual(created_post.media_items.count(), 2)

    def test_comment_creation_requires_jwt(self):
        self.client.credentials()
        response = self.client.post(
            f"/api/posts/{self.post.pk}/comments/",
            {"content": "What a view!"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_activity_after_five_minutes_invalidates_the_session(self):
        UserSession.objects.filter(pk=self.session.pk).update(
            last_activity=timezone.now() - timedelta(minutes=6)
        )

        response = self.client.post("/api/session/activity/", format="json")

        self.assertEqual(response.status_code, 401)
        self.assertFalse(UserSession.objects.filter(pk=self.session.pk).exists())

    def test_activity_within_five_minutes_keeps_session_alive(self):
        previous_activity = timezone.now() - timedelta(minutes=4)
        UserSession.objects.filter(pk=self.session.pk).update(
            last_activity=previous_activity
        )

        response = self.client.post("/api/session/activity/", format="json")

        self.assertEqual(response.status_code, 200)
        self.session.refresh_from_db()
        self.assertGreater(self.session.last_activity, previous_activity)

    def test_post_operations_reject_idle_session(self):
        UserSession.objects.filter(pk=self.session.pk).update(
            last_activity=timezone.now() - timedelta(minutes=6)
        )

        response = self.client.post(
            f"/api/posts/{self.post.pk}/comments/",
            {"content": "This should be rejected"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

from datetime import timedelta

from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import UserSession


SESSION_IDLE_TIMEOUT = timedelta(minutes=5)


def delete_expired_sessions():
    cutoff = timezone.now() - SESSION_IDLE_TIMEOUT
    return UserSession.objects.filter(last_activity__lt=cutoff).delete()


class ActivityJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        delete_expired_sessions()
        user, validated_token = result
        session_id = validated_token.get("sid")
        if not session_id:
            raise AuthenticationFailed("Session is invalid. Please log in again.")

        try:
            session = UserSession.objects.get(pk=session_id, user=user)
        except UserSession.DoesNotExist as exc:
            raise AuthenticationFailed("Session is invalid. Please log in again.") from exc

        if timezone.now() - session.last_activity > SESSION_IDLE_TIMEOUT:
            session.delete()
            raise AuthenticationFailed("Session expired due to inactivity. Please log in again.")

        session.save(update_fields=["last_activity"])
        return user, validated_token

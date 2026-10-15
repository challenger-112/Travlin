from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from accounts.authentication import ActivityJWTAuthentication
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .authentication import SESSION_IDLE_TIMEOUT, delete_expired_sessions
from .models import UserProfile, UserRegistration, UserSession
from .serializers import SignupSerializer, UserProfileSerializer


class SignUp(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data["username"]
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        confirm_password = serializer.validated_data["confirm_password"]

        if password != confirm_password:
            return Response(
                {"message": "Password and Confirm Password do not match"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            UserRegistration.objects.filter(username=username).exists()
            or User.objects.filter(username=username).exists()
        ):
            return Response(
                {"message": "Username is taken, try with different username"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            UserRegistration.objects.filter(email__iexact=email).exists()
            or User.objects.filter(email__iexact=email).exists()
        ):
            return Response(
                {"message": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            User.objects.create_user(username=username, email=email, password=password)
            registration = serializer.save(
                password=make_password(password),
                confirm_password=make_password(confirm_password),
            )
            UserProfile.objects.create(user=registration)

        return Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED,
        )


class Login(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = []

    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        if not username_or_email or not password:
            return Response(
                {"message": "Username/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_by_email = User.objects.filter(email__iexact=username_or_email).first()
        username = user_by_email.username if user_by_email else username_or_email
        user = authenticate(request, username=username, password=password)

        if not user:
            return Response(
                {"message": "Invalid Credentials"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = UserSession.objects.create(user=user)
        refresh = RefreshToken.for_user(user)
        refresh["sid"] = str(session.pk)
        return Response({
            "message": "Login Successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.get_username(),
            },
        })


class ActivityTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh = RefreshToken(attrs["refresh"])
        session_id = refresh.get("sid")
        user_id = refresh.get("user_id")

        try:
            session = UserSession.objects.get(pk=session_id, user_id=user_id)
        except (UserSession.DoesNotExist, ValueError, TypeError) as exc:
            raise InvalidToken("Session is invalid. Please log in again.") from exc

        if timezone.now() - session.last_activity > SESSION_IDLE_TIMEOUT:
            session.delete()
            raise InvalidToken("Session expired due to inactivity. Please log in again.")

        session.save(update_fields=["last_activity"])
        new_refresh = RefreshToken.for_user(session.user)
        new_refresh["sid"] = str(session.pk)
        return {
            "access": str(new_refresh.access_token),
            "refresh": str(new_refresh),
        }


class SessionActivity(APIView):
    throttle_classes = []

    def post(self, request):
        return Response({"active": True})


class Logout(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = []

    def post(self, request):
        delete_expired_sessions()
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"refresh": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session_id = token.get("sid")
        user_id = token.get("user_id")
        if session_id and user_id:
            UserSession.objects.filter(pk=session_id, user_id=user_id).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class MyProfile(APIView):
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    permission_classes = [IsAuthenticated]
    authentication_classes = [ActivityJWTAuthentication]
    throttle_classes = []

    def get_profile(self, user):
        registration = UserRegistration.objects.get(username=user.get_username())
        profile, _ = UserProfile.objects.get_or_create(user=registration)
        return profile

    def get(self, request):
        serializer = UserProfileSerializer(
            self.get_profile(request.user),
            context={"request": request},
        )
        return Response(serializer.data)

    def put(self, request):
        profile = self.get_profile(request.user)
        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        profile = self.get_profile(request.user)
        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

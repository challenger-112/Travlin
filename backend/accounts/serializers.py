from rest_framework import serializers
from .models import UserRegistration, UserProfile

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegistration
        fields = ["username", "email", "password", "confirm_password", "role"]
        extra_kwargs = {
            "password": {"write_only": True},
            "confirm_password": {"write_only": True},
        }

    # def create(self, validated_data):
    #     user = User.objects.create_user(
    #         username=validated_data["username"],
    #         email=validated_data["email"],
    #         password=validated_data["password"]
    #     )
    #     return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "date_of_birth",
            "bio",
            "profile_picture",
            "places_traveled",
        ]

    def validate_profile_picture(self, picture):
        if picture.size > 1024 * 1024:
            raise serializers.ValidationError("Profile pictures must be 1 MB or smaller.")
        return picture
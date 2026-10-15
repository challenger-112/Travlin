from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.
class UserRegistration(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    confirm_password = models.CharField(max_length=128)
    role = models.CharField(max_length=50, choices=[('user', 'User'), ('admin', 'Admin')], default='user')

    def __str__(self):
        return self.username

class UserProfile(models.Model):
    user = models.OneToOneField(UserRegistration, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    places_traveled = models.TextField(blank=True)

    def __str__(self):
        return self.user.username


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jwt_sessions")
    last_activity = models.DateTimeField(auto_now=True)

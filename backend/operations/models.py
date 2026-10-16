from django.db import models
from accounts.models import UserProfile

# Create your models here.
class Post(models.Model):
    place = models.CharField(max_length=20)
    caption = models.TextField(max_length=100)
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    size = models.IntegerField(default=0)
    upload_content = models.FileField(upload_to='posts/', null=True, blank=True)
    comments_count = models.IntegerField(default=0)

    def __str__(self):
        return self.place


class PostMedia(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="media_items",
    )
    file = models.FileField(upload_to="posts/")
    content_type = models.CharField(max_length=100, blank=True)


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    content = models.TextField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.place}'
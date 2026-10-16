from rest_framework import serializers
from operations.models import Post, PostMedia, Comment


class PostMediaSerializer(serializers.ModelSerializer):
    url = serializers.FileField(source="file", read_only=True)
    type = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = ["url", "type"]

    def get_type(self, media):
        if media.content_type.startswith("video/"):
            return "video"
        return "image"

class PostSerializer(serializers.ModelSerializer):

    author = serializers.StringRelatedField(read_only=True)
    author_profile_picture = serializers.ImageField(
        source="author.profile_picture",
        read_only=True,
    )
    media = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    media_items = PostMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = "__all__"

    def create(self, validated_data):
        media_files = validated_data.pop("media", [])
        post = Post.objects.create(**validated_data)

        for uploaded_file in media_files:
            PostMedia.objects.create(
                post=post,
                file=uploaded_file,
                content_type=getattr(uploaded_file, "content_type", ""),
            )

        return post

    def update(self, instance, validated_data):
        media_files = validated_data.pop("media", [])
        post = super().update(instance, validated_data)

        for uploaded_file in media_files:
            PostMedia.objects.create(
                post=post,
                file=uploaded_file,
                content_type=getattr(uploaded_file, "content_type", ""),
            )

        return post

class CommentSerializer(serializers.ModelSerializer):

    author = serializers.StringRelatedField(read_only=True)
    post = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
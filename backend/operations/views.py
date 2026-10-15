from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.throttling import AnonRateThrottle,UserRateThrottle

from accounts.authentication import ActivityJWTAuthentication
from operations.permissions import IsCommentUserOrReadOnly
from operations.models import Post, Comment
from operations.serializers import PostSerializer, CommentSerializer

class PostList(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [ActivityJWTAuthentication]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request):
        posts = Post.objects.all()
        serializer = PostSerializer(
            posts,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class MyPosts(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [ActivityJWTAuthentication]

    def get(self, request):
        posts = Post.objects.filter(author=request.user).order_by("-created_at")
        serializer = PostSerializer(posts, many=True, context={"request": request})
        return Response(serializer.data)


class AddPost(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [ActivityJWTAuthentication]

    def post(self, request):
        serializer = PostSerializer(
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid():
            post = serializer.save(author=request.user)
            response_serializer = PostSerializer(
                post,
                context={"request": request},
            )
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostOperations(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    authentication_classes = [ActivityJWTAuthentication]

    def put(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        serializer = PostSerializer(post, data=request.data)
        if request.user != post.author:
            return Response({"detail": "You do not have permission to edit this post."}, status=status.HTTP_403_FORBIDDEN)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if request.user != post.author:
            return Response({"detail": "You do not have permission to delete this post."}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostComments(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [ActivityJWTAuthentication]

    def get(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        serializer = CommentSerializer(post.comments.all(), many=True)
        return Response(serializer.data)

    def post(self, request, post_pk):
        post = get_object_or_404(Post, pk=post_pk)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, author=request.user)
            post.comments_count = post.comments.count()
            post.save(update_fields=["comments_count"])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentOperations(APIView):
    permission_classes = [IsAuthenticated, IsCommentUserOrReadOnly]
    authentication_classes = [ActivityJWTAuthentication]

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        self.check_object_permissions(request, comment)
        post = comment.post
        comment.delete()
        post.comments_count = post.comments.count()
        post.save(update_fields=["comments_count"])
        return Response(status=status.HTTP_204_NO_CONTENT)

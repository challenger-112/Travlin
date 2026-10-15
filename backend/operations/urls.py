from django.urls import path

from operations.views import AddPost, CommentOperations, MyPosts, PostComments, PostList, PostOperations

urlpatterns = [
    path("posts/", PostList.as_view(), name="post-list"),
    path("posts/mine/", MyPosts.as_view(), name="my-posts"),
    path("posts/add/", AddPost.as_view(), name="post-add"),
    path("posts/<int:pk>/", PostOperations.as_view(), name="post-operations"),
    path("posts/<int:post_pk>/comments/", PostComments.as_view(), name="post-comments"),
    path("comments/<int:pk>/", CommentOperations.as_view(), name="comment-operations"),
]

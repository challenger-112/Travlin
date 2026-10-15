from django.urls import path
# from . import views
from .views import Login, Logout, MyProfile, SessionActivity, SignUp

urlpatterns = [
    path("signup/", SignUp.as_view(),name="signup"),
    path("login/", Login.as_view(),name="login"),
    path("session/activity/", SessionActivity.as_view(), name="session-activity"),
    path("logout/", Logout.as_view(), name="logout"),
    path("profile/", MyProfile.as_view(), name="my-profile"),
    # path("signup/", views.signup),
    # path("login/", views.login),
]
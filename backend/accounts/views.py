from django.shortcuts import render
from django.contrib.auth import authenticate
# from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from .serializers import SignupSerializer

class SignUp(APIView):
    def post(self,request):
        data = request.data.copy()
        # hash password before serializer/save so raw password is not stored
        if data.get('password'):
            data['password'] = make_password(data.get('password'))

        serializer = SignupSerializer(data=data)
        
        if User.objects.filter(username=data['username']).exists():
            return Response({'message': 'Username is taken, try again'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=data['email']).exists():
            return Response({'message': 'Email is already used'}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"},status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
# @api_view(["POST"])
# def signup(request):

#     serializer = SignupSerializer(data=request.data)

#     if serializer.is_valid():
#         serializer.save()
#         return Response(
#             {"message": "User created successfully"},
#             status=status.HTTP_201_CREATED
#         )

#     return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
class Login(APIView):
    def post(self,request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        try:
            user = User.objects.get(email__iexact=username_or_email)
            username = user.username

        except User.DoesNotExist:
            # Treat input as username
            username = username_or_email
        
        user = authenticate(
            username=username,
            password=password
        )

        if user:
            return Response({"message": "Login Successful"})

        return Response({"message": "Invalid Credentials"}, status=400)

# @api_view(["POST"])
# def login(request):

#     username_or_email = request.data.get("username")
#     password = request.data.get("password")

#     try:
#         user = User.objects.get(email__iexact=username_or_email)
#         username = user.username

#     except User.DoesNotExist:
#         # Treat input as username
#         username = username_or_email
    
#     user = authenticate(
#         username=username,
#         password=password
#     )

#     if user:
#         return Response({"message": "Login Successful"})

#     return Response({"message": "Invalid Credentials"}, status=400)
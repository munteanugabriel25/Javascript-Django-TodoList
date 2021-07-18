from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from .serializers import TaskListCreateSerializer, UserCreateSerializer, UserLoginSerializer, UserSerializer, TaskUpdateSerializer
from rest_framework.response import Response
from .models import Task
from rest_framework.views import csrf_exempt
from django.contrib.auth import login, authenticate
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated


# Create your views here.

class ListCreateApiView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        filter = request.GET.get("period", None)
        user = get_object_or_404(User, username=request.user)
        
        if filter != None:
            if filter == 'week':
                query = Task.objects.next_week_tasks(user.id)
                
            else:
                query = Task.objects.today_tasks(user.id)
              
        else:
            query = Task.objects.all_tasks(user.id)
        serializer = TaskListCreateSerializer(query, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        user = get_object_or_404(User,username=request.user)
        serializer = TaskListCreateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegisterApiView(APIView):
    serializer_class = UserCreateSerializer
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginApiView(APIView):
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user, context={"request":request})
        return Response(user_serializer.data, status=status.HTTP_200_OK)


class RetrieveDeleteUpdateApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        task_object = get_object_or_404(Task, pk=pk)
        user = get_object_or_404(User, username=request.user)
        if task_object.user == user:
            serializer = TaskUpdateSerializer(task_object)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"status": "you don't have permissions for this task"}, status=status.HTTP_400_BAD_REQUEST)
        
    
    def delete(self, request, pk):
        task_object = get_object_or_404(Task, pk=pk)
        user = get_object_or_404(User, username=request.user)
        if task_object.user == user:
            task_object.delete()
            return Response({"status": "deleted"}, status=status.HTTP_200_OK)
        else:
            return Response({"status": "you don't have permissions for this task"}, status=status.HTTP_400_BAD_REQUEST)
        
    def put(self, request, pk):
        task_object = get_object_or_404(Task, pk=pk)
        user = get_object_or_404(User, username=request.user)
        serializer = TaskUpdateSerializer(task_object, data =request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "updated"}, status=status.HTTP_200_OK)
        else:
            print(serializer.errors)
            return Response({"status": "you don't have permissions for this task"}, status=status.HTTP_400_BAD_REQUEST)
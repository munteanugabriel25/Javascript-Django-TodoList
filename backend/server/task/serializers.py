from rest_framework import serializers
from datetime import date
from .models import Task,User_profile
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, authenticate


class TaskListCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"
        
    def validate_deadline_date(self, value):
        today = date.today()
        if value < today:
            raise serializers.ValidationError("Deadline date can not be in the past")
        return value
    
class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta :
        model  = Task
        fields = "__all__"
        
        
class UserCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    password2 = serializers.CharField(required=True, write_only=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]
        extra_kwargs = {'password': {'write_only': True},
                        'password2': {'write_only': True}}
    
    def validate(self, data):
        if (User.objects.filter(Q(username=data["username"]) | Q(email=data["email"]))).exists():
            raise serializers.ValidationError("Username/email field already exists")
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        user = User(username=validated_data["username"], email=validated_data["email"])
        password = validated_data.get("password")
        user.set_password(password)
        user.save()
        profile = User_profile(user=user)
        profile.save()
        return user
    
    

    
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    
    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        if username is None or password is None:
            raise serializers.ValidationError("Must provide username and password")
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError("Unable to log in. User not found or wrong password")
        data["user"] = user
        return data
    
    
class UserSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()
    picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["username", "id", "email", "token", "picture"]
    
    def get_token(self, object):
        token = Token.objects.get(user=object)
        return token.key
    
    def get_picture(self, object):
        request = self.context["request"]
        picture_url = object.user_profile.picture.url
        absolute_url = request.build_absolute_uri(picture_url)
        return absolute_url
    
    

    
        
        
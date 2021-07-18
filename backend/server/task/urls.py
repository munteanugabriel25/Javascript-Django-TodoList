from django.urls import path, include
from .views import ListCreateApiView,UserRegisterApiView, UserLoginApiView,RetrieveDeleteUpdateApiView


urlpatterns = [
    path('task/', ListCreateApiView.as_view(), name="list-create"),
    path('task/<int:pk>/', RetrieveDeleteUpdateApiView.as_view(), name="list-create-update-delete"),
    path('register/', UserRegisterApiView.as_view(), name="register"),
    path('login/', UserLoginApiView.as_view(), name="login"),
]

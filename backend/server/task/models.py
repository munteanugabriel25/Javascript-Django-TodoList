from django.db import models
from django.contrib.auth.models import User
from datetime import datetime,timedelta
from django.db.models import Q
from django.conf import settings
# Create your models here.

def user_directory_path(instance,filename):
    return 'user_media/user_{0}/{1}'.format(instance.user.username, filename)


class TaskManager(models.Manager):
    
    def all_tasks(self,user_id):
        return self.filter(user__id=user_id)
    
    def today_tasks(self,user_id):
        today_date = datetime.today().date()
        return self.filter(Q(deadline_date=today_date) & Q(user__id=user_id))
    
    def next_week_tasks(self, user_id):
        today_date = datetime.today().date()
        week_later = today_date + timedelta(days=8)
        return self.filter(Q(deadline_date__lte=week_later) & Q(user__id=user_id) & Q(deadline_date__gt=today_date))


    
class Task(models.Model):
    IMPORTANCE = [("high", "High Priority"),
                  ("medium", "Medium Priority"),
                  ("low", "Low Priority"),
                  ]
    STATUS = [("completed", "Completed"),
              ("pending", "Pending"),
              ("postponed", "Postponed"),
              ("delayed", "Delayed"),
              ]
    
    description = models.TextField(max_length=100)
    deadline_date = models.DateField(null=False)
    importance = models.CharField(choices=IMPORTANCE, max_length=17)
    status = models.CharField(max_length=100, choices=STATUS, default="pending")
    created = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    details = models.CharField(max_length=250, null=True,blank=True)
    deadline_time = models.TimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    
    objects = TaskManager()
    
    def __str__(self):
        string = '{0} with a task of {1}'.format(self.id, self.description)
        return string



class User_profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    picture = models.FileField(upload_to=user_directory_path, null=True, default="{}/user_media/default.jpg".format(settings.MEDIA_ROOT))
    
    def __str__(self):
        return self.user.username + " profile"
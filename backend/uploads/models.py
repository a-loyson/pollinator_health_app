from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Sighting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.URLField()
    description = models.TextField(blank=True)
    prediction = models.JSONField()
    location = models.JSONField()
    date = models.DateTimeField()

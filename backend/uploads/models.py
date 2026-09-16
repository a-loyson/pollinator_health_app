from django.db import models


class Sighting(models.Model):
    firebase_uid = models.CharField(max_length=128)
    image = models.URLField()
    description = models.TextField(blank=True)
    prediction = models.JSONField()
    location = models.JSONField()
    date = models.DateTimeField()

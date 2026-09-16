from django.urls import path
from .views import health, upload_image, create_sighting, get_sightings, chat

urlpatterns = [
    path("health/", health),
    path("upload-image/", upload_image),
    path("sightings/create/", create_sighting),
    path("sightings/", get_sightings),
    path("chat/", chat),
]

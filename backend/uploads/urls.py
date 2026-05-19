from django.urls import path
from .views import health, upload_image, register, login_view, me, logout_view, create_sighting, get_sightings

urlpatterns = [
    path("health/", health),
    path("upload-image/", upload_image),
    path("register/", register),
    path("login_view/", login_view),
    path("me/", me),
    path("logout/", logout_view),
    path("sightings/create/", create_sighting),
    path("sightings/", get_sightings),
]

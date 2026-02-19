from django.urls import path
from .views import health
from .views import upload_image

urlpatterns = [
    path("health/", health),
    path("upload-image/", upload_image),
]

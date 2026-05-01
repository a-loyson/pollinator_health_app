from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from uploads.storage.drive import upload_bytes
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Sighting
import json
from uuid import uuid4

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

@login_required
def me(request):
    return JsonResponse({
        "username": request.user.username,
        "id": request.user.id
    })

@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Logged out"})
    
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse({"error": "Missing fields"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        User.objects.create_user(username=username, password=password)

        return JsonResponse({"message": "User created"})

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Logged in"})

        return JsonResponse({"error": "Invalid credentials"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

@login_required
@csrf_exempt
def upload_image(request):
    if request.method == "POST":
        files = request.FILES.getlist("photos")

        uploaded_files = []

        for file in files:
            file_bytes = file.read()
            filename = file.name

            username = str(request.user.username)
            result = upload_bytes(file_bytes, filename, username)
            uploaded_files.append(result)

        return JsonResponse({"files": uploaded_files})

    return JsonResponse({"error": "Invalid request"}, status=400)

@login_required
@csrf_exempt
def create_sighting(request):
    data = json.loads(request.body or "{}")

    sighting = Sighting.objects.create(
    user=request.user,
    image=data["image"],
    description=data.get("description", ""),
    prediction=data.get("prediction", {}),
    location=data.get("location"),
    date=data.get("date")
)

    print("CREATED:", sighting.id)

    return JsonResponse({"status": "ok"})

@login_required
def get_sightings(request):
    sightings = Sighting.objects.filter(user=request.user)

    data = [
        {
            "image": s.image,
            "description": s.description,
            "prediction": s.prediction,
            "location": s.location,
            "date": s.date,
        }
        for s in sightings
    ]

    return JsonResponse(data, safe=False)

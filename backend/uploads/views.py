from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from uploads.storage.drive import upload_bytes
from django.views.decorators.csrf import csrf_exempt
from uuid import uuid4

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

@csrf_exempt
def upload_image(request):
    if request.method == "POST":
        files = request.FILES.getlist("photos")

        uploaded_files = []

        for file in files:
            file_bytes = file.read()
            filename = file.name

            result = upload_bytes(file_bytes, filename)
            uploaded_files.append(result)

        return JsonResponse({"files": uploaded_files})

    return JsonResponse({"error": "Invalid request"}, status=400)



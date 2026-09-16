from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .models import Sighting
from .firebase_auth import verify_token
import json
import os


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


@csrf_exempt
def upload_image(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    uid, err = verify_token(request)
    if err:
        return err

    # Imported lazily: the Google Drive path needs googleapiclient, which the
    # live app no longer uses (images upload straight to Firebase Storage).
    from uploads.storage.drive import upload_bytes

    files = request.FILES.getlist("photos")
    uploaded_files = []

    for file in files:
        file_bytes = file.read()
        filename = file.name
        result = upload_bytes(file_bytes, filename, uid)
        uploaded_files.append(result)

    return JsonResponse({"files": uploaded_files})


@csrf_exempt
def create_sighting(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    uid, err = verify_token(request)
    if err:
        return err

    data = json.loads(request.body or "{}")

    sighting = Sighting.objects.create(
        firebase_uid=uid,
        image=data["image"],
        description=data.get("description", ""),
        prediction=data.get("prediction", {}),
        location=data.get("location"),
        date=data.get("date"),
    )

    print("CREATED:", sighting.id)
    return JsonResponse({"status": "ok"})


@csrf_exempt
def chat(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=400)

    data = json.loads(request.body or "{}")
    message = (data.get("message") or "").strip()
    species = data.get("species") or "an unidentified Solidago (goldenrod) species"

    if not message:
        return JsonResponse({"error": "Empty message"}, status=400)

    # Read the OpenAI key from the environment (loaded from backend/.env via
    # load_dotenv() in settings.py). Never hardcode the key in source.
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return JsonResponse(
            {"response": "The chat service is not configured (missing OPENAI_API_KEY)."},
            status=500,
        )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful botanist assistant for a pollinator health app. "
                        "Answer concisely and accurately about Solidago (goldenrod) species, "
                        "their identification, ecology, and value to pollinators. "
                        f"The plant in question was identified as: {species}."
                    ),
                },
                {"role": "user", "content": message},
            ],
            max_tokens=500,
        )
        text = completion.choices[0].message.content.strip()
        return JsonResponse({"response": text})
    except Exception as e:
        print("CHAT ERROR:", e)
        return JsonResponse(
            {"response": "Sorry, I couldn't process that request right now."},
            status=502,
        )


def get_sightings(request):
    uid, err = verify_token(request)
    if err:
        return err

    sightings = Sighting.objects.filter(firebase_uid=uid)

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

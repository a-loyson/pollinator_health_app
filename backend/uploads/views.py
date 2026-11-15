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
    if not files:
        return JsonResponse({"error": "No photos received"}, status=400)

    uploaded_files = []

    # Return JSON on failure: an uncaught error gives Django's HTML 500 page,
    # which the app can't parse, hiding the real cause.
    try:
        for file in files:
            file_bytes = file.read()
            filename = file.name
            result = upload_bytes(file_bytes, filename, uid)
            uploaded_files.append(result)
    except Exception as e:
        print(f"UPLOAD ERROR ({type(e).__name__}):", e)
        return JsonResponse(
            {"error": f"Upload to storage failed: {e}", "uploaded": uploaded_files},
            status=502,
        )

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
    # Strip whitespace/quotes that often sneak in when pasting into Render's
    # environment settings and make the key invalid.
    api_key = (os.environ.get("OPENAI_API_KEY") or "").strip().strip('"').strip("'")
    if not api_key:
        return JsonResponse(
            {"response": "The chat service is not configured (missing OPENAI_API_KEY)."},
            status=500,
        )

    # Model can be changed from Render's environment without a code change.
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()

    try:
        import openai
        from openai import OpenAI
    except ImportError:
        print("CHAT ERROR: the 'openai' package is not installed on the server")
        return JsonResponse(
            {"response": "Chat is unavailable: the server is missing the OpenAI library."},
            status=500,
        )

    # Map OpenAI failures to a short, user-safe reason (never includes the key)
    # so the cause is visible in the app instead of a generic apology.
    error_reasons = [
        (openai.AuthenticationError, "the OpenAI API key was rejected (invalid or revoked)"),
        (openai.PermissionDeniedError, "the OpenAI key does not have access to this model"),
        (openai.NotFoundError, f"the model '{model}' is not available to this account"),
        (openai.RateLimitError, "the OpenAI account is out of credit or over its rate limit"),
        (openai.APITimeoutError, "the request to OpenAI timed out"),
        (openai.APIConnectionError, "the server could not reach OpenAI"),
        (openai.BadRequestError, "OpenAI rejected the request format"),
    ]

    try:
        client = OpenAI(api_key=api_key, timeout=30)
        completion = client.chat.completions.create(
            model=model,
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
        # Full detail goes to the Render logs.
        print(f"CHAT ERROR ({type(e).__name__}):", repr(e))
        reason = next(
            (msg for exc_type, msg in error_reasons if isinstance(e, exc_type)),
            f"an unexpected server error occurred ({type(e).__name__})",
        )
        return JsonResponse(
            {"response": f"Sorry, I couldn't process that request: {reason}."},
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

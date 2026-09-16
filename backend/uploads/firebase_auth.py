import os
import json
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from django.http import JsonResponse


def _get_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cred_json = os.getenv("FIREBASE_CREDENTIALS")
    if cred_json:
        cred = credentials.Certificate(json.loads(cred_json))
    else:
        # Fallback: path to service account JSON file via GOOGLE_APPLICATION_CREDENTIALS
        cred = credentials.ApplicationDefault()

    return firebase_admin.initialize_app(cred)


def verify_token(request):
    """
    Verifies the Firebase ID token from the Authorization header.
    Returns (uid, None) on success or (None, JsonResponse error) on failure.
    """
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return None, JsonResponse({"error": "Authorization header required"}, status=401)

    token = auth_header[len("Bearer "):]

    try:
        _get_app()
        decoded = firebase_auth.verify_id_token(token)
        return decoded["uid"], None
    except Exception as e:
        return None, JsonResponse({"error": f"Invalid token: {e}"}, status=401)

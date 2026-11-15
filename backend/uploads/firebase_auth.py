import os

from django.http import JsonResponse
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "pollinator-app-ede7c")

# Reused across requests so Google's public signing certificates are fetched
# over a pooled connection instead of a fresh one every time.
_transport = google_requests.Request()


def verify_token(request):
    """
    Verifies the Firebase ID token from the Authorization header.
    Returns (uid, None) on success or (None, JsonResponse error) on failure.

    Uses google-auth directly rather than firebase_admin: verifying a Firebase
    ID token only needs Google's public certificates and the project ID, so no
    service account or Application Default Credentials are required (Render
    has neither, which made firebase_admin fail with "default credentials
    were not found").
    """
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return None, JsonResponse({"error": "Authorization header required"}, status=401)

    token = auth_header[len("Bearer "):].strip()

    try:
        # Checks signature, expiry, audience (project ID) and issuer.
        claims = id_token.verify_firebase_token(
            token, _transport, audience=FIREBASE_PROJECT_ID
        )
        uid = claims.get("user_id") or claims.get("sub")
        if not uid:
            raise ValueError("token has no user id")
        return uid, None
    except Exception as e:
        print(f"AUTH ERROR ({type(e).__name__}):", e)
        return None, JsonResponse({"error": f"Invalid token: {e}"}, status=401)

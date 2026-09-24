import json
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

_service = None


def _get_service():
    """Lazily build the Drive API client on first use.

    Credentials come from the GOOGLE_OAUTH_TOKEN_JSON env var (the contents
    of the old token.json, as a single-line JSON string) instead of a file
    on disk, since Render's filesystem is ephemeral and token.json must
    never be committed to git.
    """
    global _service
    if _service is not None:
        return _service

    raw = os.getenv("GOOGLE_OAUTH_TOKEN_JSON")
    if not raw:
        raise RuntimeError(
            "GOOGLE_OAUTH_TOKEN_JSON environment variable is not set. "
            "Set it to the JSON contents of your Google OAuth token "
            "(token, refresh_token, client_id, client_secret, scopes)."
        )

    data = json.loads(raw)
    creds = Credentials(
        token=data['token'],
        refresh_token=data['refresh_token'],
        token_uri='https://oauth2.googleapis.com/token',
        client_id=data['client_id'],
        client_secret=data['client_secret'],
        scopes=data['scopes'],
    )

    _service = build('drive', 'v3', credentials=creds)
    return _service


def get_or_create_user_folder(username):
    service = _get_service()
    query = f"name='{username}' and '{FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    folders = results.get("files", [])

    if folders:
        return folders[0]["id"]

    folder_metadata = {
        "name": str(username),
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [FOLDER_ID],
    }

    folder = service.files().create(
        body=folder_metadata,
        fields="id"
    ).execute()

    return folder["id"]


def upload_bytes(file_bytes, filename, username):
    service = _get_service()
    user_folder_id = get_or_create_user_folder(username)
    media = MediaInMemoryUpload(file_bytes)
    file_metadata = {
        'name': filename,
        'parents': [user_folder_id]
    }

    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, webViewLink'
    ).execute()

    return {"id": file['id'], "url": file['webViewLink'], "name": filename}

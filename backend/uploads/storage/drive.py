import json
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

# Load OAuth token
with open('token.json') as f:
    data = json.load(f)

creds = Credentials(
    token=data['token'],
    refresh_token=data['refresh_token'],
    token_uri='https://oauth2.googleapis.com/token',
    client_id=data['client_id'],
    client_secret=data['client_secret'],
    scopes=data['scopes']
)

service = build('drive', 'v3', credentials=creds)

def get_or_create_user_folder(username):
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

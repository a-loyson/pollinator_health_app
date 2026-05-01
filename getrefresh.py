from google_auth_oauthlib.flow import InstalledAppFlow
import json

SCOPES = ['https://www.googleapis.com/auth/drive.file']

flow = InstalledAppFlow.from_client_secrets_file(
    'C:/Users/aloys/git-repos/pollinator_health_app/backend/credentials.json', SCOPES)

creds = flow.run_local_server(port=0)
print("ACCESS TOKEN:", creds.token)
print("REFRESH TOKEN:", creds.refresh_token)

# Save token for backend use
with open('token.json', 'w') as f:
    json.dump({
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }, f)

/**
 * Uploads the TF.js model files to Firebase Storage.
 *
 * Usage:
 *   1. Download your service account key from Firebase Console →
 *      Project Settings → Service accounts → Generate new private key
 *   2. Save the JSON file as serviceAccountKey.json in this directory
 *   3. Run: node upload_models.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'pollinator-app-ede7c-firebase-adminsdk-fbsvc-9e4ecb1c1e.json');
const MODELS_DIR = path.join(__dirname, 'models');
const BUCKsET = 'pollinator-app-ede7c.firebasestorage.app';

if (!fs.existsSync(sSERVICE_ACCOUNT_PATH)) {
  console.error('serviceAccountKey.json not found. Download it from Firebase Console → Project Settings → Service accounts.');
  process.exit(1);
}

initializeApp({
  credential: cert(SERVICE_ACCOUNT_PATH),
  storageBucket: BUCKET,
});

const bucket = getStorage().bucket();

async function uploadFile(localPath, remotePath) {
  await bucket.upload(localPath, {
    destination: remotePath,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  console.log(`  ✓ ${remotePath}`);
}

async function uploadDir(localDir, remoteDir) {
  const entries = fs.readdirSync(localDir);
  for (const entry of entries) {
    const localPath = path.join(localDir, entry);
    const remotePath = `${remoteDir}/${entry}`;
    if (fs.statSync(localPath).isDirectory()) {
      await uploadDir(localPath, remotePath);
    } else {
      await uploadFile(localPath, remotePath);
    }
  }
}

(async () => {
  console.log('Uploading models to Firebase Storage...\n');
  try {
    await uploadDir(MODELS_DIR, 'models');
    console.log('\nAll models uploaded successfully.');
    console.log(`\nVerify at: https://console.firebase.google.com/project/pollinator-app-ede7c/storage`);
  } catch (err) {
    console.error('Upload failed:', err.message);
    process.exit(1);
  }
})();

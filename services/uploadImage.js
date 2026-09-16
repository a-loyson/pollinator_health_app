import { storage, auth } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadToFirebase = async (imageUri) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // Read the local file into a native-backed Blob via XHR. In React Native,
    // fetch(uri).blob() yields a blob the Firebase SDK can't send ("Network
    // request failed"), and uploadString(base64) fails with "Creating blobs
    // from ArrayBuffer are not supported". An XHR with responseType "blob"
    // returns a real native blob that uploadBytes can upload.
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError("Failed to read image file"));
      xhr.responseType = "blob";
      xhr.open("GET", imageUri, true);
      xhr.send(null);
    });

    // Unique file name
    const filename = `sightings/${user.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });

    // Native blobs from XHR must be closed manually to release memory.
    if (typeof blob.close === "function") blob.close();

    // Get public URL
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.log("Upload error:", error);
    throw error;
  }
};

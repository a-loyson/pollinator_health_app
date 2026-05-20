import { storage, auth } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadToFirebase = async (imageUri) => {
  try {
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const userId = auth.currentUser.uid;

    // Unique file name
    const filename = `sightings/${userId}/${Date.now()}.jpg`;

    const storageRef = ref(storage, filename);

    // Upload
    console.log("AUTH USER:", auth.currentUser);
    console.log("UID:", auth.currentUser?.uid);
    await uploadBytes(storageRef, blob);

    // Get public URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.log("Upload error:", error);
    throw error;
  }
};
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOMiVBSJ8WDMA5nrKkbjQNIkxT955AToA",
  authDomain: "flower-prediction-6cd67.firebaseapp.com",
  projectId: "flower-prediction-6cd67",
  storageBucket: "flower-prediction-6cd67.firebasestorage.app",
  messagingSenderId: "624626524973",
  appId: "1:624626524973:web:c237324106909d305829a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
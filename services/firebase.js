// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOa96WuQNUAUm9qpA7dUDM9I8sOrHj7os",
  authDomain: "pollinator-app-ede7c.firebaseapp.com",
  projectId: "pollinator-app-ede7c",
  storageBucket: "pollinator-app-ede7c.firebasestorage.app",
  messagingSenderId: "1059439499121",
  appId: "1:1059439499121:web:09fe71594c85f1f531c8d0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, "gs://pollinator-app-ede7c.firebasestorage.app");
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
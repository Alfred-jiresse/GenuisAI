// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8PHjRMln_s_znJwdctGQm5fZUV71OefI",
  authDomain: "genuisai-b4574.firebaseapp.com",
  projectId: "genuisai-b4574",
  storageBucket: "genuisai-b4574.appspot.com",
  messagingSenderId: "355181203722",
  appId: "1:355181203722:web:9e75c3cc14f64a6b7baaf3"
};

// Initialize Firebase safely (prevent double initialization in dev)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
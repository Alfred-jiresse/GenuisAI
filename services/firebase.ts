// firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8PHjRMln_s_znJwdctGQm5fZUV71OefI",
  authDomain: "genuisai-b4574.firebaseapp.com",
  projectId: "genuisai-b4574",
  storageBucket: "genuisai-b4574.appspot.com",
  messagingSenderId: "355181203722",
  appId: "1:355181203722:web:9e75c3cc14f64a6b7baaf3"
};

// Empêche Firebase de s'initialiser deux fois
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporte les services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

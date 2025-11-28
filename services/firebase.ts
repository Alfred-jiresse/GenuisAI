// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8PHjRMln_s_znJwdctGQm5fZUV71OefI",
  authDomain: "genuisai-b4574.firebaseapp.com",
  projectId: "genuisai-b4574",
  storageBucket: "genuisai-b4574.firebasestorage.app",
  messagingSenderId: "355181203722",
  appId: "1:355181203722:web:9e75c3cc14f64a6b7baaf3",
  measurementId: "G-HX6W1YYZNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };

// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBENWqkrR2NELWECjJRnThaSIMfB-DKJIo",
  authDomain: "login-app-6dd0f.firebaseapp.com",
  projectId: "login-app-6dd0f",
  storageBucket: "login-app-6dd0f.firebasestorage.app",
  messagingSenderId: "986674542868",
  appId: "1:986674542868:web:c7f9385ffb944678f8ea01",
  measurementId: "G-4SDL3M8VF2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

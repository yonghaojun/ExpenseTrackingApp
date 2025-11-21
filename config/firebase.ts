
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaLJXDaWA--1GSySp3b4XAHDs02dCNJq4",
  authDomain: "expense-tracker-app-7b17a.firebaseapp.com",
  projectId: "expense-tracker-app-7b17a",
  storageBucket: "expense-tracker-app-7b17a.firebasestorage.app",
  messagingSenderId: "950136356060",
  appId: "1:950136356060:web:d59116aabfcd210d7b4819",
  measurementId: "G-RZHF4LG7B0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, db, googleProvider };


// firebase login
// firebase init
// firebase deploy

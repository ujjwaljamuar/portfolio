import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: "react-portfolio-ujjwal.firebaseapp.com",
  projectId: "react-portfolio-ujjwal",
  storageBucket: "react-portfolio-ujjwal.appspot.com",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();

import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { FIREBASE_API_KEY, MESSAGING_SENDER_ID, APP_ID } from "./config/constants";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "react-portfolio-ujjwal.firebaseapp.com",
  projectId: "react-portfolio-ujjwal",
  storageBucket: "react-portfolio-ujjwal.appspot.com",
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore();

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-mnWI1hHcGDz3mh84gNdtV0qu2B7sjpY",
  authDomain: "attendify-e468f.firebaseapp.com",
  projectId: "attendify-e468f",
  storageBucket: "attendify-e468f.firebasestorage.app",
  messagingSenderId: "254379652178",
  appId: "1:254379652178:web:f931ad9738c0181ea01b8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

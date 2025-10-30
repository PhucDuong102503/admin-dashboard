import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHCg8GP_WbeQGJJEr_Zqvv0tMj9agPMDE",
  authDomain: "appbanhang-fd9f6.firebaseapp.com",
  projectId: "appbanhang-fd9f6",
  storageBucket: "appbanhang-fd9f6.appspot.com",
  messagingSenderId: "874696475193",
  appId: "1:874696475193:android:ffe944ecef993b2055c3e8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
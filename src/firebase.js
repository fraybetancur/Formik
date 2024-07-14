// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyxWoh8jMYF9rOYwZWSjqYWCkkRee_S2U",
  authDomain: "dm-app-v.firebaseapp.com",
  projectId: "dm-app-v",
  storageBucket: "dm-app-v.appspot.com",
  messagingSenderId: "344831814353",
  appId: "1:344831814353:web:b6e919dfdd525ee80773f0",
  measurementId: "G-56QR22BQ4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
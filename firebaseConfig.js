// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEHPrwgAIJuCBQDPFscREa3HTs5vODBTU",
  authDomain: "moodjournalapp-a3999.firebaseapp.com",
  projectId: "moodjournalapp-a3999",
  storageBucket: "moodjournalapp-a3999.firebasestorage.app",
  messagingSenderId: "458597382735",
  appId: "1:458597382735:web:c01422cf0cdd74f17c883a",
  measurementId: "G-T1GTBBFX97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export { auth, analytics };
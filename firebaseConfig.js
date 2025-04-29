import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAEHPrwgAIJuCBQDPFscREa3HTs5vODBTU",
  authDomain: "moodjournalapp-a3999.firebaseapp.com",
  projectId: "moodjournalapp-a3999",
  storageBucket: "moodjournalapp-a3999.firebasestorage.app",
  messagingSenderId: "458597382735",
  appId: "1:458597382735:web:c01422cf0cdd74f17c883a",
  measurementId: "G-T1GTBBFX97"
};

let app, auth, db, analytics;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Initialize Analytics only if supported (for web only)
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
} catch (error) {
  console.error('Firebase initialization error: ', error);
}

export { app, auth, db, analytics };

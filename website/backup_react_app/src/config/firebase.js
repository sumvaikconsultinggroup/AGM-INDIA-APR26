import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREASE_MESSAGEING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREASE_APP_ID,
  measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export { auth, provider };

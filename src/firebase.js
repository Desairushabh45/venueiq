import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Validate required env variables on startup
const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

requiredKeys.forEach(key => {
  if (!import.meta.env[key]) {
    throw new Error(`CRITICAL SECURITY ERROR: Missing required environment variable: ${key}`);
  }
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

let app = null;
let analytics = null;
let perf = null;
let db = null;
let auth = null;
const provider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);

  // Analytics and Performance (only in browser)
  if (typeof window !== "undefined") {
    try {
      analytics = getAnalytics(app);
      perf = getPerformance(app);
    } catch (analyticsError) {
      console.warn("Firebase Analytics/Performance skipped:", analyticsError.message);
    }
  }

  // Realtime Database (only initialize if DATABASE_URL is provided)
  if (import.meta.env.VITE_FIREBASE_DATABASE_URL) {
    db = getDatabase(app);
  } else {
    console.warn("VenueIQ: VITE_FIREBASE_DATABASE_URL not set — using simulated data fallback.");
  }

  // Auth
  auth = getAuth(app);
  provider.setCustomParameters({ prompt: "select_account" });
} catch (error) {
  console.warn("Firebase initialization failed — running in offline mode:", error.message);
}

/**
 * Safe wrapper around Firebase logEvent.
 * Silently fails if Analytics is not initialized.
 */
export function logEvent(eventName, params = {}) {
  try {
    if (analytics) {
      firebaseLogEvent(analytics, eventName, params);
    }
  } catch (e) {
    // Silently swallow Analytics errors in development
  }
}

export { app, analytics, db, auth, provider };

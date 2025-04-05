import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration object.
 * This object holds the necessary credentials and project details to connect to your Firebase project.
 * The values are typically sourced from environment variables for security and configuration management.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Check if any of the Firebase configuration values are missing.
 * It's crucial to ensure all configuration parameters are provided to successfully initialize Firebase.
 * If any value is missing, it throws an error to prevent the application from running without proper Firebase setup.
 */
if (Object.values(firebaseConfig).some(value => !value)) {
  throw new Error("Missing Firebase environment variables");
}

/**
 * Initialize Firebase application.
 * `getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)` ensures that Firebase is initialized only once.
 * It checks if a Firebase app already exists; if so, it reuses the existing app to avoid conflicts and redundant initializations.
 * If no app exists, it initializes a new one using the `firebaseConfig`.
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
/**
 * Get Firestore instance.
 * `getFirestore(app)` retrieves the Firestore service instance associated with the initialized Firebase app.
 * Firestore is a NoSQL cloud database used to store and sync data for web and mobile apps.
 */
const db = getFirestore(app);

/**
 * Export initialized Firebase app and Firestore database instances.
 * These exported instances, `app` and `db`, can be imported and used throughout the application to interact with Firebase services,
 * such as Firestore, Authentication, etc.
 */
export { app, db };
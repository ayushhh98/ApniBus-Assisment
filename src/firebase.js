import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug: Check if config is loaded
if (!firebaseConfig.apiKey) {
    console.error("FIREBASE: API Key is missing! Check your .env file.");
} else {
    console.log("FIREBASE: Config loaded. Project ID:", firebaseConfig.projectId);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Using initializeFirestore with experimentalForceLongPolling to prevent network hangs
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

// Enable Offline Persistence (Multi-Tab Support)
enableMultiTabIndexedDbPersistence(db)
    .then(() => {
        console.log("FIREBASE: Offline Persistence Enabled (Multi-Tab)");
    })
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn("Firebase persistence failed: Multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Firebase persistence not supported in this browser.");
        } else {
            console.error("Firebase persistence error:", err);
        }
    });

export default app;

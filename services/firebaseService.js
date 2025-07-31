// services/firebaseService.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc 
} from 'firebase/firestore';

import { v4 as uuidv4 } from 'uuid';

// Your Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDyEYsX2tVADbZ5o_HtyOULW7K0MIXGI6E",
  authDomain: "sahha-demo.firebaseapp.com",
  projectId: "sahha-demo",
  storageBucket: "sahha-demo.firebasestorage.app",
  messagingSenderId: "560499676685",
  appId: "1:560499676685:web:c41aa18c3fb2e139d0e744",
  measurementId: "G-5JE06NMHRE"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'sahha-test-db');

export { db, doc, getDoc };

// --- Authentication Functions ---

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const externalId = uuidv4(); // Generate a unique ID
    const userProfileRef = doc(db, "user_profiles", user.uid); // Use user.uid as document ID

    await setDoc(userProfileRef, {
      email: user.email,
      external_id: externalId, // Store the generated ID
      createdAt: new Date().toISOString(),
    });

    console.log(`Firebase Service: User profile created in Firestore for UID: ${user.uid}`);

    // User signed up and logged in
    return { success: true, user: userCredential.user, externalId: externalId };
  } catch (error) {
    console.error("Firebase Registration Error:", error.code, error.message);
    let errorMessage = "Registration failed. Please try again.";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'That email address is already in use!';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'That email address is invalid!';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  console.log(`Firebase Service: Attempting to log in user: ${email}`);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log(`Firebase Service: Login SUCCESS for UID: ${user.uid}`);

    // --- OPTIONAL: Fetch externalId on login ---
    // If you need the externalId immediately after login, you can fetch it here
    const userProfileRef = doc(db, "user_profiles", user.uid);
    const docSnap = await getDoc(userProfileRef);

    let externalId = null;
    if (docSnap.exists()) {
      externalId = docSnap.data().external_id;
      console.log(`got user id ${externalId}`)
    } else {
      console.warn("User profile not found in Firestore for UID:", user.uid);
    }
    // User signed in
    return { success: true, user: user, externalId: externalId };
  } catch (error) {
    console.error("Firebase Login Error:", error.code, error.message);
    let errorMessage = "Login failed. Please check your credentials.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The email address is not valid.';
    }
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Firebase Logout Error:", error.code, error.message);
    return { success: false, error: "Logout failed." };
  }
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// --- Firestore Data Functions ---

/**
 * Fetches protected data from a specific Firestore document.
 * Assumes a 'protected_data' collection and a 'demo_doc' document for this example.
 * @returns {Promise<{data: any}|{error: string}>}
 */
export const fetchProtectedDataFromFirestore = async () => {
  try {
    const docRef = doc(db, "/protected_data/user"); // Adjust collection/document as needed
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      console.warn("No such document!");
      return { success: false, error: "No protected data found." };
    }
  } catch (error) {
    console.error("Firestore Data Fetch Error:", error);
    return { success: false, error: "Failed to fetch data from Firestore." };
  }
};
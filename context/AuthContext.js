// context/AuthContext.js

import React, { createContext, useState, useEffect, useMemo } from "react";
// Import all necessary Firebase functions directly from the service
import {
  loginUser,
  registerUser,
  logoutUser,
  observeAuthState,
  db, // <--- Import the initialized Firestore instance
  doc, // <--- Import doc
  getDoc, // <--- Import getDoc
} from "../services/firebaseService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [externalId, setExternalId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Setting up auth state observer."); // <-- New log
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      // --- CRUCIAL NEW LOG HERE ---
      console.log("AuthContext: onAuthStateChanged fired. firebaseUser:", firebaseUser ? firebaseUser.email : null);
      // --- END NEW LOG ---
      setUser(firebaseUser);
      if (firebaseUser) {
        // If a user is logged in, try to fetch their profile to get externalId
        console.log("AuthContext: User detected/logged in. UID:", firebaseUser.uid);
        const userProfileRef = doc(db, "user_profiles", firebaseUser.uid);
        try {
          const docSnap = await getDoc(userProfileRef);
          if (docSnap.exists()) {
            setExternalId(docSnap.data().external_id);
            console.log("Fetched externalId:", docSnap.data().external_id);
          } else {
            console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
            setExternalId(null);
          }
        } catch (fetchError) {
          console.error("Error fetching user profile:", fetchError);
          setExternalId(null);
        }
      } else {
        console.log("AuthContext: No user detected (logged out). Clearing externalId.\
                    --------------------------------------------------------------------------------------------\
                    ");
        setExternalId(null); // Clear externalId on logout
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency array means this runs once on mount

  const authContext = useMemo(
    () => ({
      signIn: async (email, password) => {
        setIsLoading(true);
        const result = await loginUser(email, password);
        // The onAuthStateChanged listener handles setting user and externalId
        setIsLoading(false);
        return result;
      },

      signUp: async (email, password) => {
        setIsLoading(true);
        const result = await registerUser(email, password);
        // The onAuthStateChanged listener handles setting user and externalId
        setIsLoading(false);
        return result;
      },

      signOut: async () => {
        setIsLoading(true);
        const result = await logoutUser();
        // The onAuthStateChanged listener handles setting user and externalId
        setIsLoading(false);
        return result;
      },
      user,
      externalId,
      isLoading,
    }),
    [user, externalId, isLoading]
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
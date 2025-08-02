// context/AuthContext.js

import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { AppState } from "react-native"; // <--- IMPORT AppState
// Import all necessary Firebase functions directly from the service
import Sahha, { SahhaSensor, SahhaSensorStatus } from 'sahha-react-native';
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

  const [sensorStatus, setSensorStatus] = useState("Unknown");

  const checkSensorStatus = useCallback(() => {
    console.log("AuthContext: Checking sensor status...");
    const sensors = [SahhaSensor.sleep, SahhaSensor.steps];

    Sahha.getSensorStatus(sensors, (error, statusResult) => {
      if (error) {
        console.error("AuthContext: Error getting sensor status:", error);
        setSensorStatus("Error");
        return;
      }
      console.log("AuthContext: Got sensor status map:", statusResult);
      // Logic to determine a simple overall status for the UI.
      // We check 'steps' as a representative sensor.
      // --- NEW LOGIC TO HANDLE BOTH OBJECT AND NUMBER ---
      let finalStatus = "Not Enabled"; // Default status

      if (typeof statusResult === 'number') {
        if (statusResult === 3) { // As per docs, 3 means enabled
          finalStatus = "Enabled";
        } else if (statusResult === 0) { // Assuming 0 might be pending, based on common enum patterns
          finalStatus = "Pending Permission";
        }
      } 
      // Then, handle the documented/expected case (an object) as a fallback
      else if (typeof statusResult === 'object' && statusResult !== null) {
        if (statusResult.steps === SahhaSensorStatus.enabled || statusResult.sleep === SahhaSensorStatus.enabled) {
          finalStatus = "Enabled";
        } else if (statusResult.steps === SahhaSensorStatus.pending || statusResult.sleep === SahhaSensorStatus.pending) {
          finalStatus = "Pending Permission";
        }
      }
      
      console.log("AuthContext: Final determined sensor status:", finalStatus);
      setSensorStatus(finalStatus);
      // --- END NEW LOGIC ---
    });
  }, []);

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
        console.log("AuthContext: No user detected (logged out). Clearing externalId.\n--------------------------------------------------------------------------------------------\n");
        setExternalId(null); // Clear externalId on logout
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency array means this runs once on mount

  // --- NEW: Listen for App State Changes ---
  useEffect(() => {
    // This function will be called whenever the app's state changes
    const handleAppStateChange = (nextAppState) => {
      // We only care about when the app becomes 'active' (comes to the foreground)
      if (nextAppState === 'active') {
        console.log("AuthContext: App has come to the foreground. Re-checking sensor status.");
        checkSensorStatus();
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Unsubscribe when the component unmounts (cleanup)
    return () => {
      subscription.remove();
    };
  }, [checkSensorStatus]); // Re-run if checkSensorStatus function changes (it won't, due to useCallback)
  // --- END NEW LOGIC ---

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
      checkSensorStatus,
      user,
      externalId,
      isLoading,
      sensorStatus,
    }),
    [user, externalId, isLoading, sensorStatus, checkSensorStatus]
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
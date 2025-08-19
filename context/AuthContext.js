// context/AuthContext.js

import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { AppState } from "react-native";  
 
import Sahha, { SahhaSensor, SahhaSensorStatus } from 'sahha-react-native';
import {
  loginUser,
  registerUser,
  logoutUser,
  observeAuthState,
  db,  
  doc,  
  getDoc,  
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
      let finalStatus = "Not Enabled"; 

      if (typeof statusResult === 'number') {
        if (statusResult === 3) { 
          finalStatus = "Enabled";
        } else if (statusResult === 0) { 
          finalStatus = "Pending Permission";
        }
      } 
      else if (typeof statusResult === 'object' && statusResult !== null) {
        if (statusResult.steps === SahhaSensorStatus.enabled || statusResult.sleep === SahhaSensorStatus.enabled) {
          finalStatus = "Enabled";
        } else if (statusResult.steps === SahhaSensorStatus.pending || statusResult.sleep === SahhaSensorStatus.pending) {
          finalStatus = "Pending Permission";
        }
      }
      
      console.log("AuthContext: Final determined sensor status:", finalStatus);
      setSensorStatus(finalStatus);
    });
  }, []);

  useEffect(() => {
    console.log("AuthContext: Setting up auth state observer.");
    const unsubscribe = observeAuthState(async (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged fired. firebaseUser:", firebaseUser ? firebaseUser.email : null);
      setUser(firebaseUser);
      if (firebaseUser) {
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
  }, []); 

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        console.log("AuthContext: App has come to the foreground. Re-checking sensor status.");
        checkSensorStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [checkSensorStatus]); 

  const authContext = useMemo(
    () => ({
      signIn: async (email, password) => {
        setIsLoading(true);
        const result = await loginUser(email, password);
        setIsLoading(false);
        return result;
      },

      signUp: async (email, password) => {
        setIsLoading(true);
        const result = await registerUser(email, password);
        setIsLoading(false);
        return result;
      },

      signOut: async () => {
        setIsLoading(true);
        const result = await logoutUser();
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

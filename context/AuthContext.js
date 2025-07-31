// context/AuthContext.js

import React, { createContext, useState, useEffect, useMemo } from "react";
import { loginUser, registerUser, logoutUser, observeAuthState } from "../services/firebaseService"; // Import Firebase functions

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the Firebase User object (or null)
  const [isLoading, setIsLoading] = useState(true); // To check if authentication state is being restored

  useEffect(() => {
    // This listener will automatically update the user state when auth state changes (login/logout/registration)
    const unsubscribe = observeAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, []);

  const authContext = useMemo(
    () => ({
      // Login function
      signIn: async (email, password) => {
        setIsLoading(true);
        const result = await loginUser(email, password);
        // setUser is handled by the onAuthStateChanged listener
        setIsLoading(false);
        return result; // { success: boolean, error?: string }
      },

      // Register function
      signUp: async (email, password) => {
        setIsLoading(true);
        const result = await registerUser(email, password);
        // setUser is handled by the onAuthStateChanged listener
        setIsLoading(false);
        return result; // { success: boolean, error?: string }
      },

      // Logout function
      signOut: async () => {
        setIsLoading(true);
        const result = await logoutUser();
        // setUser is handled by the onAuthStateChanged listener
        setIsLoading(false);
        return result; // { success: boolean, error?: string }
      },
      user, // The actual Firebase User object (or null if logged out)
      isLoading, // True while checking initial auth state or during auth operations
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
// App.js
import 'react-native-get-random-values'; 
import 'react-native-gesture-handler';

import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AuthContext, { AuthProvider } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen"; // Import the new screen

import Sahha, { SahhaSensor, SahhaSensorStatus } from 'sahha-react-native';

const SAHHA_CLIENT_ID = process.env.EXPO_PUBLIC_SAHHA_CLIENT_ID;
const SAHHA_CLIENT_SECRET = process.env.EXPO_PUBLIC_SAHHA_CLIENT_SECRET;
const SAHHA_ENVIRONMENT = process.env.EXPO_PUBLIC_SAHHA_ENVIRONMENT;

const initializeSahha = () => {
  try {
    console.log("App.js: Attempting to configure Sahha SDK...");
    // --- ADD THIS LOG TO SEE WHAT WAS IMPORTED ---
    console.log('App.js: Imported Sahha object:', Sahha);

    const config = { 
      client_id: SAHHA_CLIENT_ID,
        client_secret: SAHHA_CLIENT_SECRET,
        environment: SAHHA_ENVIRONMENT,
     };

    // --- CORRECTED FUNCTION CALL (No SahhaSDK prefix) ---
    Sahha.configure(config, (error, success) => {
      if (error) {
        console.error("App.js: Sahha configure callback reports an error:", error);
        return;
      }
      console.log("App.js: Sahha configure callback reports success:", success);
      // We will move the checkSensorStatus call to AuthContext to keep things clean
    });
  } catch (error) {
    console.error("App.js: Failed to configure Sahha SDK (try/catch block):", error);
  }
};

const Stack = createStackNavigator();

// This component uses the AuthContext to decide which screen to show
function AppNavigator() {
  const { user, isLoading, checkSensorStatus } = useContext(AuthContext); // Use 'user' instead of 'userToken'
  
  useEffect(() => {
    initializeSahha();
  }, []); // Empty dependency array means this runs once on mount

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user == null ? (
        // No user logged in, show Auth flow
        <Stack.Group>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Sign in" }}
          />
          <Stack.Screen
            name="Register" // Add the Register screen
            component={RegisterScreen}
            options={{ title: "Register" }}
          />
        </Stack.Group>
      ) : (
        // User is logged in
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
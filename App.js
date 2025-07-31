// App.js
import 'react-native-get-random-values'; 

import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import AuthContext, { AuthProvider } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen"; // Import the new screen

const Stack = createStackNavigator();

// This component uses the AuthContext to decide which screen to show
function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext); // Use 'user' instead of 'userToken'

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
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
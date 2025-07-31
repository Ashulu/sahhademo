// screens/LoginScreen.js

import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity, // Add this import
} from "react-native";
import AuthContext from "../context/AuthContext";

const LoginScreen = ({ navigation }) => { // Add navigation prop
  const [email, setEmail] = useState(""); // Change to email
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    const result = await signIn(email, password); // Use email
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Something went wrong.");
      Alert.alert("Login Failed", result.error || "Please try again.");
    }
    // No explicit navigation here, AuthContext change will handle it in App.js
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email" // Change placeholder
        value={email} // Use email
        onChangeText={setEmail} // Use setEmail
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
      />
      {isLoading && <ActivityIndicator size="small" color="#0000ff" />}

      {/* Add Register Link */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Register")} // Navigate to RegisterScreen
        style={styles.registerLink}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  // New styles for the register link
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    color: "#007bff",
    fontSize: 16,
  }
});

export default LoginScreen;
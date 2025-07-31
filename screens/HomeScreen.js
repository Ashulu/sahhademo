// screens/HomeScreen.js

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import AuthContext from "../context/AuthContext";
import { fetchProtectedDataFromFirestore } from "../services/firebaseService"; // Import from Firebase service

const HomeScreen = () => {
  const { user, signOut } = useContext(AuthContext); // Use 'user' instead of 'userToken'
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  const handleLinkAccount = () => {
    Alert.alert(
      "Link Account",
      "This button would trigger the process to link an external account. (e.g., redirect to OAuth provider)"
    );
    console.log("Link Account button pressed.");
    // Here you would integrate with your actual "Link Account" API
  };

  const handleFetchData = async () => {
    setData(null);
    setDataError("");
    setLoadingData(true);
    try {
      // Call the Firestore fetching function
      const response = await fetchProtectedDataFromFirestore();
      if (response.success) { // Check for success property from firebaseService
        setData(response.data);
      } else {
        setDataError(response.error || "Failed to fetch data.");
        Alert.alert("Fetch Data Failed", response.error || "Please try again.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataError("Network error or unexpected issue.");
      Alert.alert("Error", "Could not connect to API or unexpected error.");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <Text style={styles.subtitle}>
        You are authenticated as:{" "}
        <Text style={styles.tokenText}>
          {user ? user.email : "N/A"} {/* Display user email */}
        </Text>
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Link Account" onPress={handleLinkAccount} />
        <View style={{ marginVertical: 10 }} />
        <Button
          title={loadingData ? "Fetching Data..." : "Fetch Data"}
          onPress={handleFetchData}
          disabled={loadingData}
        />
      </View>

      {loadingData && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loaderText}>Loading Data...</Text>
        </View>
      )}

      {dataError ? (
        <Text style={styles.errorText}>{dataError}</Text>
      ) : null}

      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Fetched Data from Firestore:</Text>
          <Text style={styles.dataText}>
            {JSON.stringify(data, null, 2)}
          </Text>
        </View>
      )}

      <View style={styles.spacer} />
      <Button title="Logout" onPress={signOut} color="red" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#555",
  },
  tokenText: {
    fontWeight: "bold",
    color: "#007bff",
  },
  buttonContainer: {
    width: "80%",
    marginBottom: 30,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  dataContainer: {
    marginTop: 20,
    width: "100%",
    padding: 15,
    backgroundColor: "#e6f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b3e0ff",
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0056b3",
  },
  dataText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#333",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  spacer: {
    flex: 1,
  },
});

export default HomeScreen;
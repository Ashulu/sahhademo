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
import { fetchProtectedDataFromFirestore } from "../services/firebaseService";

import  Sahha  from 'sahha-react-native';

const SAHHA_APP_ID = "xYJOA4zzraZaZlXUPtNDrZt5p1MEh59r";
const SAHHA_APP_SECRET = "YR72qh0KAgyIVpn15cVMYb999GRhM1KQo6GpZATO0Pz6zwzBoTiB5jfwBIIonyCa";

const HomeScreen = () => {
  const { user, externalId, signOut } = useContext(AuthContext); // <--- Get externalId
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");
  const [sahhaAuthStatus, setSahhaAuthStatus] = useState("Not Authenticated with Sahha"); // Initial status
  const [isSahhaAuthenticating, setIsSahhaAuthenticating] = useState(false);

  // const handleLinkAccount = async () => {
  //   if (!externalId) {
  //     Alert.alert("Error", "External ID not available. Please ensure user profile is created/fetched.");
  //     console.warn("HomeScreen: Cannot link account: externalId is N/A.");
  //     return;
  //   }

  //   setIsSahhaAuthenticating(true);
  //   setSahhaAuthStatus("Authenticating with Sahha...");
  //   console.log("HomeScreen: Attempting to authenticate with Sahha using external ID:", externalId);

  //   try {
  //     // Call Sahha's authenticate method with the external_id
  //     // Refer to Sahha's API-docs for the exact expected response structure.
  //     // https://sandbox-api.sahha.ai/api-docs/index.html#tag/Profile-Authentication
  //     const authResult = await Sahha.authenticate({ external_id: externalId });

  //     console.log("HomeScreen: Sahha Authentication Result:", authResult);

  //     // Assuming Sahha.authenticate returns a success indicator (e.g., authResult.status or just a successful promise resolve)
  //     // You might need to adjust this `if` condition based on the actual Sahha SDK response.
  //     if (authResult) { // Simplistic check, adjust based on Sahha's success response
  //       setSahhaAuthStatus("Authenticated with Sahha! (Check Console)");
  //       Alert.alert("Sahha Success", "Successfully authenticated with Sahha! Check console for full result.");
  //       // If Sahha returns an access token or session info, you'd store it here (e.g., with SecureStore)
  //       // await SecureStore.setItemAsync('sahhaAccessToken', authResult.access_token);
  //     } else {
  //       setSahhaAuthStatus("Sahha Auth Failed: Unknown result.");
  //       Alert.alert("Sahha Failed", "Could not authenticate with Sahha. Unknown result.");
  //     }
  //   } catch (error) {
  //     console.error("HomeScreen: Error during Sahha authentication:", error);
  //     setSahhaAuthStatus(`Sahha Auth Error: ${error.message || 'Network issue / SDK problem'}`);
  //     Alert.alert("Sahha Error", `Failed to authenticate with Sahha: ${error.message || 'Please check network and Sahha configuration.'}`);
  //   } finally {
  //     setIsSahhaAuthenticating(false);
  //   }
  // };

  const handleLinkAccount = () => {
    if (!externalId) {
      Alert.alert("Error", "External ID not available.");
      return;
    }

    setIsSahhaAuthenticating(true);
    setSahhaAuthStatus("Authenticating with Sahha...");
    console.log("HomeScreen: Attempting to authenticate with Sahha using external ID:", externalId);

    // CORRECTED CALL: Pass arguments individually as per the native signature.
    Sahha.authenticate(SAHHA_APP_ID, SAHHA_APP_SECRET, externalId, (error, result) => {
      if (error) {
        console.error("HomeScreen: Sahha.authenticate callback reports an error:", error);
        setSahhaAuthStatus(`Sahha Auth Error: ${error.message || 'Unknown error'}`);
        Alert.alert("Sahha Error", `Failed to authenticate: ${error.message || 'Please check logs.'}`);
      } else {
        console.log("HomeScreen: Sahha.authenticate callback reports success. Result:", result);
        setSahhaAuthStatus("Authenticated with Sahha! (Check Console)");
        Alert.alert("Sahha Success", "Successfully authenticated with Sahha! Check console for full result.");
      }
      setIsSahhaAuthenticating(false);
    });
  };

  const handleFetchData = async () => {
    console.log("--- Fetch Data Attempt ---");
    if (user) {
      console.log("User IS logged in. Email:", user.email, "UID:", user.uid);
      console.log("User External ID:", externalId); // Log the external ID
    } else {
      console.log("User is NOT logged in.");
      Alert.alert("Authentication Required", "Please log in before fetching data.");
      setLoadingData(false);
      return;
    }
    console.log("Attempting to fetch data from Firestore...");

    setData(null);
    setDataError("");
    setLoadingData(true);
    try {
      const response = await fetchProtectedDataFromFirestore();
      if (response.success) {
        setData(response.data);
        console.log("Data fetched successfully:", response.data);
      } else {
        setDataError(response.error || "Failed to fetch data.");
        Alert.alert("Fetch Data Failed", response.error || "Please try again.");
        console.error("Failed to fetch data with error:", response.error);
      }
    } catch (error) {
      console.error("Catch block error during data fetch:", error);
      setDataError("Network error or unexpected issue.");
      Alert.alert("Error", "Could not connect to API or unexpected error.");
    } finally {
      setLoadingData(false);
    }
    console.log("--- End Fetch Data Attempt ---");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Home!</Text>
      <Text style={styles.subtitle}>
        You are authenticated as:{" "}
        <Text style={styles.tokenText}>
          {user ? user.email : "N/A"}
        </Text>
      </Text>
      {externalId && ( // Only show if externalId exists
        <Text style={styles.subtitle}>
          Your Sahha External ID:{" "}
          <Text style={styles.tokenText}>{externalId}...</Text>
        </Text>
      )}

      {/* Display Sahha Auth Status */}
      <Text style={styles.sahhaStatus}>Sahha Status: {sahhaAuthStatus}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isSahhaAuthenticating ? "Linking..." : "Link Account"}
          onPress={handleLinkAccount}
          disabled={isSahhaAuthenticating || !externalId} // Disable if no externalId
        />
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
    marginBottom: 10, // Adjusted for second subtitle
    textAlign: "center",
    color: "#555",
  },
  tokenText: {
    fontWeight: "bold",
    color: "#007bff",
  },
  buttonContainer: {
    width: "80%",
    marginTop: 20, // Adjusted margin
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
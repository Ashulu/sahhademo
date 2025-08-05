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
  Linking,
  FlatList,
} from "react-native";
import AuthContext from "../context/AuthContext";
import { fetchProtectedDataFromFirestore } from "../services/firebaseService";

import Sahha, { SahhaSensor, SahhaScoreType } from 'sahha-react-native';

import StatCard from '../components/StatCard';

const SAHHA_APP_ID = "xYJOA4zzraZaZlXUPtNDrZt5p1MEh59r";
const SAHHA_APP_SECRET = "YR72qh0KAgyIVpn15cVMYb999GRhM1KQo6GpZATO0Pz6zwzBoTiB5jfwBIIonyCa";

const HomeScreen = () => {
  const { user, externalId, signOut, sensorStatus, checkSensorStatus } = useContext(AuthContext); // <--- Get externalId
  const [sahhaAuthStatus, setSahhaAuthStatus] = useState("Not Authenticated with Sahha"); // Initial status
  const [isSahhaAuthenticating, setIsSahhaAuthenticating] = useState(false);
  const [isEnablingSensors, setIsEnablingSensors] = useState(false);

  const [analysisData, setAnalysisData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");


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

  const handleEnableSensors = () => {
    // Logic Branch 1: If sensors are already enabled, do nothing.
    if (sensorStatus === 'Enabled') {
      Alert.alert("Already Enabled", "Sensor data collection is already active.");
      return;
    }

    // Logic Branch 2: If permissions were previously denied, guide user to settings.
    if (sensorStatus === 'Not Enabled') {
      Alert.alert(
        "Permission Required",
        "To enable sensors, you must grant permission in your iPhone's Settings. Please go to Settings > Privacy > Motion & Fitness.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Sahha.openAppSettings() } // This opens the app's specific settings page
        ]
      );
      return;
    }

    // Logic Branch 3: Default case (status is "Pending" or "Unknown").
    // This will trigger the iOS pop-up the first time the app is run.
    setIsEnablingSensors(true);
    console.log("HomeScreen: Attempting to enable Sahha sensors using enableSensors()...");
    const sensorsToEnable = [String(SahhaSensor.sleep), String(SahhaSensor.steps)];

    Sahha.enableSensors(sensorsToEnable, (error, result) => {
      if (error) {
        console.error("HomeScreen: Sahha.enableSensors callback reports an error:", error);
        Alert.alert("Sensor Error", `Failed to enable sensors: ${error.message || 'Please check logs.'}`);
      } else {
        console.log("HomeScreen: Sahha.enableSensors callback reports success. Result:", result);
        Alert.alert("Permission Flow Complete", "Checking the new sensor status...");
      }
      // Always re-check the status to get the definitive new state after the flow.
      checkSensorStatus();
      setIsEnablingSensors(false);
    });
  };


// --- NEW: Placeholder handler function for Step 3 ---
const handleGetSleepStats = () => {
  console.log("HomeScreen: 'Get Sleep Stats' button pressed.");
  
  setIsLoadingAnalysis(true);
  setAnalysisData(null);
  setAnalysisError("");

  // Create date objects for the last 7 days.
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 1);

  console.log(`HomeScreen: Fetching stats from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  // CORRECTED: Call Sahha.getStats() with the sensor enum and DATES CONVERTED TO MILLISECONDS.
  Sahha.getScores(
    [SahhaScoreType.sleep, SahhaScoreType.activity, SahhaScoreType.wellbeing],
    startDate.getTime(), // Pass milliseconds
    endDate.getTime(),   // Pass milliseconds
    (error, value) => {
      if (error) {
        console.error("HomeScreen: Sahha.getStats for Sleep callback reports an error:", error);
        setAnalysisError(`Failed to get sleep stats: ${error}`);
        Alert.alert("Stats Error", `Failed to get sleep stats: ${error}`);
      } else if (value) {
        try {
          // The documentation shows 'value' is a JSON string that needs to be parsed.
          const statsArray = JSON.parse(value);
          console.log("HomeScreen: Sahha.getStats for Sleep callback reports success. Parsed Data:", statsArray);
          setAnalysisData(statsArray);
        } catch (parseError) {
          console.error("HomeScreen: Failed to parse stats JSON:", parseError);
          setAnalysisError("Failed to parse stats data.");
          Alert.alert("Data Error", "Received stats but could not parse the data.");
        }
      }
      
      setIsLoadingAnalysis(false);
    }
  );
};
// --- END NEW ---

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
      <Text style={styles.sahhaStatus}>Sensor Status: {sensorStatus}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isSahhaAuthenticating ? "Linking..." : "Link Account"}
          onPress={handleLinkAccount}
          disabled={isSahhaAuthenticating || !externalId} // Disable if no externalId
        />
        <View style={{ marginVertical: 10 }} />

        <Button
          title={isEnablingSensors ? "Enabling Sensors..." : "Enable Sahha Sensors"}
          onPress={handleEnableSensors}
          disabled={!sahhaAuthStatus.includes('Authenticated') || isEnablingSensors}
        />

        {/* --- NEW: "Get Sahha Analysis" Button --- */}
        <Button
          title={isLoadingAnalysis ? "Fetching Stats..." : "Get Sahha Stats"}
          onPress={handleGetSleepStats}
          disabled={sensorStatus !== 'Enabled' || isLoadingAnalysis}
        />
        {/* --- END NEW --- */}

      </View>

      {/* --- NEW: Placeholder UI for Analysis Data --- */}
      {isLoadingAnalysis && <ActivityIndicator size="large" color="#0000ff" />}

      {analysisError ? (
        <Text style={styles.errorText}>{analysisError}</Text>
      ) : null}

      {analysisData && (
        <View style={styles.listContainer}>
          <Text style={styles.dataTitle}>Sahha Analysis</Text>
          <FlatList
            data={analysisData}
            renderItem={({ item }) => <StatCard item={item} />}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}
      {/* --- END NEW --- */}


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
  listContainer: { // <--- ADD THIS NEW STYLE
    width: '100%',
    marginTop: 20,
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
  sahhaStatus: {
    fontSize: 14,
    marginTop: 5, // Reduced margin to fit more status text
    marginBottom: 5,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

export default HomeScreen;
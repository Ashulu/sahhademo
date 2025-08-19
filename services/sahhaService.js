// services/sahhaService.js

import Constants from 'expo-constants'; // To access env variables
import * as SecureStore from 'expo-secure-store'; // To store Sahha tokens securely
import Sahha from 'sahha-react-native'; // Sahha SDK

// Get Sahha credentials from environment variables
const SAHHA_CLIENT_ID = process.env.EXPO_PUBLIC_SAHHA_CLIENT_ID;
const SAHHA_CLIENT_SECRET = process.env.EXPO_PUBLIC_SAHHA_CLIENT_SECRET;
const SAHHA_ENVIRONMENT = process.env.EXPO_PUBLIC_SAHHA_ENVIRONMENT; // 'sandbox' or 'production'

const SAHHA_AUTH_URL = `https://${SAHHA_ENVIRONMENT}-api.sahha.ai/v2/auth/token`; // Dynamically get URL
const SAHHA_ACCESS_TOKEN_KEY = 'sahhaAccessToken';
const SAHHA_REFRESH_TOKEN_KEY = 'sahhaRefreshToken';

/**
 * Exchanges client credentials and externalId for Sahha access and refresh tokens.
 * @param {string} externalId - The unique ID for the user from your system (Firebase Firestore).
 * @returns {Promise<{success: boolean, accessToken?: string, refreshToken?: string, error?: string}>}
 */
export const authenticateWithSahhaApi = async (externalId) => {
  if (!SAHHA_CLIENT_ID || !SAHHA_CLIENT_SECRET) {
    console.error("Sahha credentials missing. Check .env and app.config.js");
    return { success: false, error: "Sahha API credentials not configured." };
  }

  console.log("Authenticating with Sahha API using externalId:", externalId);
  try {
    const response = await fetch(SAHHA_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SAHHA_CLIENT_ID,
        client_secret: SAHHA_CLIENT_SECRET,
        grant_type: 'client_credentials', // This is typical for initial client auth
        external_id: externalId, // Pass your user's unique external ID
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      if (accessToken && refreshToken) {
        // Store tokens securely
        await SecureStore.setItemAsync(SAHHA_ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(SAHHA_REFRESH_TOKEN_KEY, refreshToken);
        console.log("Sahha tokens obtained and stored securely.");
        return { success: true, accessToken, refreshToken };
      } else {
        console.error("Sahha API response missing tokens:", data);
        return { success: false, error: "Sahha API did not return expected tokens." };
      }
    } else {
      console.error("Sahha API authentication failed:", response.status, data);
      return { success: false, error: data.message || "Sahha API authentication failed." };
    }
  } catch (error) {
    console.error("Network error during Sahha API authentication:", error);
    return { success: false, error: "Network error during Sahha API call." };
  }
};

/**
 * Initializes and authenticates the Sahha SDK.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const initializeSahhaSdk = async () => {
  console.log("Initializing Sahha SDK...");
  try {
    const accessToken = await SecureStore.getItemAsync(SAHHA_ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(SAHHA_REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return { success: false, error: "Sahha tokens not found. Please link account first." };
    }

    // Configure Sahha SDK
    await Sahha.configure({
      environment: SAHHA_ENVIRONMENT,
      // You might need more configuration here based on Sahha's docs (e.g. privacy settings, permissions etc)
    });
    console.log("Sahha SDK configured.");

    // Authenticate Sahha SDK with the tokens
    const authResult = await Sahha.authenticate(accessToken, refreshToken);
    if (authResult === true) { // Sahha.authenticate returns true on success
      console.log("Sahha SDK authenticated successfully.");
      return { success: true };
    } else {
      console.error("Sahha SDK authentication failed:", authResult);
      return { success: false, error: "Sahha SDK authentication failed." };
    }
  } catch (error) {
    console.error("Error initializing Sahha SDK:", error);
    return { success: false, error: error.message || "Failed to initialize Sahha SDK." };
  }
};

/**
 * Checks if Sahha SDK is configured and authenticated.
 * @returns {Promise<boolean>}
 */
export const isSahhaSdkReady = async () => {
  const status = await Sahha.getSahhaStatus();
  return status.authenticated && status.configured; // Assuming these properties exist
};

/**
 * Example function to get Sahha data (replace with actual Sahha SDK methods for data collection/fetching)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const getSahhaData = async () => {
  console.log("Attempting to get Sahha data (placeholder)...");
  try {
    const ready = await isSahhaSdkReady();
    if (!ready) {
      return { success: false, error: "Sahha SDK not ready or authenticated." };
    }
    // Replace with actual Sahha SDK call, e.g., Sahha.getInsights() or Sahha.collectData()
    const dummySahhaData = {
      sahhaMessage: "This is simulated Sahha data!",
      profileScore: 85,
      lastUpdate: new Date().toISOString()
    };
    return { success: true, data: dummySahhaData };
  } catch (error) {
    console.error("Error getting Sahha data:", error);
    return { success: false, error: "Failed to get Sahha data." };
  }
};

/**
 * Clears Sahha tokens from secure storage (e.g., on logout).
 */
export const clearSahhaTokens = async () => {
  console.log("Clearing Sahha tokens...");
  await SecureStore.deleteItemAsync(SAHHA_ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SAHHA_REFRESH_TOKEN_KEY);
  // You might also want to call Sahha.deauthenticate() if available
};
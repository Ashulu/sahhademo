
const MOCK_USERS = {
  "user@example.com": "password123",
  "demo@test.com": "demo",
};

const MOCK_PROTECTED_DATA = {
  message: "This is sensitive data from the backend!",
  items: ["Item A", "Item B", "Item C"],
  timestamp: new Date().toISOString(),
};

/**
 * Simulates a login API call.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token: string}|{error: string}>}
 */
export const loginUser = async (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_USERS[username] === password) {
        // In a real app, the backend would generate a JWT token
        const token = `dummy-jwt-token-for-${username}-${Date.now()}`;
        resolve({ token });
      } else {
        reject({ error: "Invalid username or password" });
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Simulates fetching protected data from an API.
 * @param {string} token - The authentication token.
 * @returns {Promise<{data: any}|{error: string}>}
 */
export const fetchProtectedData = async (token) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, the backend would validate the token
      if (token && token.startsWith("dummy-jwt-token-for-")) {
        resolve({ data: MOCK_PROTECTED_DATA });
      } else {
        reject({ error: "Unauthorized. Invalid or missing token." });
      }
    }, 1500); // Simulate network delay
  });
};

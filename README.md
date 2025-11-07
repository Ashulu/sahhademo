# React Native Sahha API Demo

> A proof-of-concept mobile application built with React Native and Expo, demonstrating a complete user authentication flow and integration with a third-party wellness API (Sahha).

This project serves as a template for building a mobile app that requires user registration, secure login, and interaction with a protected external API. It features a clean, component-based structure and handles complex native integrations, such as permissions for iOS HealthKit, through an Expo Dev Client.

---

## Core Features

*   **Full User Authentication:** Secure user registration and login handled by **Firebase Authentication**.
*   **User Profile System:** Upon registration, a user profile is created in a **Firestore** database with a unique, securely generated `external_id` for linking with third-party services.
*   **Third-Party API Integration (Sahha):**
    *   Authenticates the user with the Sahha wellness API using their `external_id`.
    *   Manages permissions for native sensor data (e.g., Apple HealthKit).
    *   Fetches and displays user wellness statistics (e.g., Sleep and Activity scores) from the Sahha backend.
*   **Native Permissions Handling:** Intelligently detects if sensor permissions have been denied and provides a button to guide the user directly to the app's settings page on their device.
*   **Custom Development Build:** Utilizes an **Expo Dev Client** to incorporate the native Sahha SDK, which is not possible in the standard Expo Go environment.
*   **Dynamic UI:** The interface updates based on authentication and permission status, and displays fetched data in custom, formatted components.

---

## Tech Stack

### Frontend & Core Logic
*   **React Native:** Core framework for building the native application.
*   **Expo (SDK & Dev Client):** Toolchain for building, running, and managing the app.
*   **JavaScript (ES6+):** Primary programming language.
*   **React Navigation:** For handling screen transitions and navigation logic.

### Backend & Services
*   **Firebase:**
    *   **Firebase Authentication:** For managing user accounts.
    *   **Firestore:** NoSQL database for storing user profiles.
*   **Sahha API:** Third-party wellness API for user authentication and fetching health stats.

### Development Tools
*   **npm:** Package management.
*   **Xcode:** For building the native iOS project and managing native capabilities.
*   **Expo CLI:** Command-line tool for running the development server and build commands.
*   **Git & GitHub:** Version control.

---

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### Prerequisites

You must have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (LTS version recommended) and npm
*   [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
*   [Xcode](https://developer.apple.com/xcode/) and its Command Line Tools (for iOS development)
*   [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    This project uses a `.env` file to manage secret keys.
    *   Create a copy of the example file:
        ```bash
        cp .env.example .env
        ```
    *   Open the newly created `.env` file and add your actual credentials for Firebase and Sahha. All variables must be prefixed with `EXPO_PUBLIC_`.

4.  **Set up the native iOS project:**
    *   Navigate to the `ios` directory:
        ```bash
        cd ios
        ```
    *   Install the native dependencies (Pods):
        ```bash
        pod install
        ```
    *   Return to the project root:
        ```bash
        cd ..
        ```

5.  **Configure Xcode Workspace:**
    *   Open the native project in Xcode:
        ```bash
        xed ios
        ```
    *   Select the project target, go to **"Signing & Capabilities"**, and ensure the **HealthKit** capability is added.
    *   Go to the **"Info"** tab and ensure the `Privacy - Health Share Usage Description` and `Privacy - Health Update Usage Description` keys are present.

### Running the App

Because this project uses a custom dev client, you need two terminal windows.

1.  **Terminal 1: Start the Metro Bundler**
    ```bash
    npx expo start
    ```
    Keep this terminal running. It serves your JavaScript code.

2.  **Terminal 2: Build and Launch the App**
    *   In a new terminal window, run the build command:
        ```bash
        npx expo run:ios
        ```
    *   This will build the native app, install it on your simulator, and automatically connect to the Metro server.

3.  **Subsequent Launches:**
    After the first successful build, you only need to run `npx expo start`. Then, you can open the `my-api-demo` app icon directly from your simulator's home screen to connect to the server.

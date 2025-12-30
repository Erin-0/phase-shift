# Firebase Setup for Phase Shift

To enable the backend features (Leaderboards, Auth, Cloud Save), you must set up a Firebase project and connect it.

## Steps

1.  **Create Project**: Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a new project named `phase-shift`.
2.  **Enable Auth**:
    *   Go to **Authentication** > **Sign-in method**.
    *   Enable **Email/Password**.
    *   (Optional) Enable **Google**.
3.  **Enable Firestore**:
    *   Go to **Firestore Database** > **Create Database**.
    *   Start in **Test Mode** (for development) or **Production Mode** (you will need to set rules).
    *   **Rules**:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId} {
              allow read: if true; // Everyone can read for leaderboards
              allow write: if request.auth != null && request.auth.uid == userId; // Only owner can write
            }
          }
        }
        ```
4.  **Get Keys**:
    *   Go to **Project Settings** (Gear icon) > **General**.
    *   Scroll down to **Your apps** > **Web app**.
    *   Register the app (nickname: `phase-shift`).
    *   Copy the `firebaseConfig` object values.
5.  **Configure Environment**:
    *   Rename `.env.local.example` to `.env.local`.
    *   Paste your keys into the file:
        ```bash
        VITE_FIREBASE_API_KEY=AIzaSy...
        VITE_FIREBASE_AUTH_DOMAIN=...
        ...
        ```
6.  **Run**: Restart your dev server (`npm run dev`).

## Features Enabled
*   Cloud Save (Highscore, Stars, Owned Themes).
*   Global Leaderboards.
*   Daily Missions.
*   Profile Photos (Stored as Base64 text in Firestore).

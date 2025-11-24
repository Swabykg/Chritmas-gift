# Firebase Setup Instructions

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **christmas gift**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to **Your apps** section
6. If you haven't added a web app yet:
   - Click **Add app** > **Web** (</> icon)
   - Register your app with a nickname (e.g., "Christmas Gift Website")
   - Click **Register app**
7. Copy the `firebaseConfig` object values

## Step 2: Enable Realtime Database

1. In Firebase Console, go to **Build** > **Realtime Database**
2. Click **Create Database**
3. Choose a location (closest to your users)
4. Start in **test mode** (we'll update security rules later)
5. Click **Enable**

## Step 3: Update Your Config

Open `index.html` and find the `firebaseConfig` object (around line 127). Replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                    // Replace with your apiKey
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Replace with your authDomain
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",  // Replace with your databaseURL
    projectId: "YOUR_PROJECT_ID",              // Replace with your projectId
    storageBucket: "YOUR_PROJECT_ID.appspot.com",   // Replace with your storageBucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your messagingSenderId
    appId: "YOUR_APP_ID"                       // Replace with your appId
};
```

## Step 4: Set Up Database Security Rules

1. Go to **Realtime Database** > **Rules** tab
2. Replace the rules with:

```json
{
  "rules": {
    "donations": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Note:** These rules allow anyone to read/write. For production, you should add authentication or use Cloud Functions to handle writes securely.

## Step 5: Test It!

1. Open `index.html` in your browser
2. Open the browser console (F12)
3. You should see "Firebase initialized successfully"
4. Try entering a donation amount - it should save to Firebase
5. Open the page in another browser/incognito window - you should see the same total!

## How It Works

- **Real-time updates**: When someone donates, all users see the progress bar update instantly
- **Data structure**: Donations are stored as:
  ```
  donations/
    total: 1234.56
    list/
      -donation1: { amount, name, email, timestamp }
      -donation2: { amount, name, email, timestamp }
  ```

## Troubleshooting

- **"Firebase not initialized"**: Check that you've replaced all the config values
- **Database errors**: Make sure Realtime Database is enabled and rules are set
- **CORS errors**: Make sure your Firebase project allows your domain (localhost is allowed by default)


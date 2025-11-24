# Fix Firebase Realtime Database Error

## The Problem
You're seeing: "Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly."

## Solution Steps

### Step 1: Verify Realtime Database is Created

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **christmas gift**
3. Click **Build** > **Realtime Database** in the left menu
4. If you see "Get started" or "Create Database" button:
   - Click **Create Database**
   - Choose a location (e.g., `us-central1` or closest to you)
   - Choose **Start in test mode** (for now)
   - Click **Enable**

### Step 2: Get the Exact Database URL

1. After creating the database, you'll see a page with your database
2. At the top, you'll see the database URL
3. It should look like: `https://christmas-gift-95c25-default-rtdb.firebaseio.com/`
4. **Copy this exact URL** (including the `https://` and ending with `/`)

### Step 3: Update Your Code

If the URL is different from what's in your code, update `index.html`:

1. Open `index.html`
2. Find line ~147: `databaseURL: "https://christmas-gift-95c25-default-rtdb.firebaseio.com"`
3. Replace it with the exact URL from Firebase Console
4. Make sure it ends with `/` (some regions need it, some don't - try both)

### Step 4: Set Database Rules

1. In Firebase Console, go to **Realtime Database** > **Rules** tab
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

3. Click **Publish**

### Step 5: Test Again

1. Refresh your `index.html` page
2. Open browser console (F12)
3. You should see: "Firebase Realtime Database connected successfully"
4. Try submitting a donation - it should work!

## Common Issues

- **Database not created**: Make sure you clicked "Create Database" in Firebase Console
- **Wrong URL**: The URL might be different based on your region (e.g., `us-central1`, `europe-west1`)
- **Rules blocking access**: Make sure the rules allow read/write to `donations` path

## If Still Not Working

Check the browser console for the exact error message and verify:
1. Database is created ✅
2. URL matches exactly ✅
3. Rules allow read/write ✅
4. No typos in the URL ✅


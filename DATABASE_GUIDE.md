# Firebase Database Guide

## What Gets Saved to Firebase

When someone donates, the following information is saved:

### 1. Individual Donation Records
**Location:** `donations/list/`

Each donation includes:
- `amount` - Donation amount (number)
- `name` - Donor's name (string)
- `email` - Donor's email (string)
- `timestamp` - When donation was made (milliseconds since epoch)
- `date` - Human-readable date (ISO format)

**Example:**
```json
{
  "donations": {
    "list": {
      "-Nxyz123": {
        "amount": 50,
        "name": "John Doe",
        "email": "john@example.com",
        "timestamp": 1703456789000,
        "date": "2023-12-24T16:26:29.000Z"
      }
    }
  }
}
```

### 2. Total Amount
**Location:** `donations/total`

A single number representing the total of all donations.

**Example:**
```json
{
  "donations": {
    "total": 150
  }
}
```

## How to View Donations in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **christmas gift**
3. Click **Build** > **Realtime Database**
4. Click the **Data** tab
5. You'll see:
   - `donations/` folder
   - Inside: `list/` (all individual donations) and `total` (total amount)

## Viewing Individual Donations

1. Click on `donations` > `list`
2. You'll see all donations with unique IDs (like `-Nxyz123`)
3. Click on any donation to see:
   - Name
   - Email
   - Amount
   - Timestamp/Date

## Email Troubleshooting

If emails are failing to send, check:

1. **Browser Console (F12)** - Look for error messages
2. **EmailJS Status** - Should see "✅ EmailJS initialized successfully"
3. **Common Issues:**
   - Service ID incorrect
   - Template ID incorrect
   - Public Key incorrect
   - EmailJS quota exceeded (free tier: 200 emails/month)
   - Template variables don't match

## Testing Email

1. Fill out the form
2. Submit
3. Check console for:
   - "📧 EmailJS sending with params: ..."
   - "✅ Email sent successfully!" OR error details
4. Check recipient's inbox (and spam folder)

## Database Structure Summary

```
donations/
├── total: 150                    (total amount raised)
└── list/
    ├── -Nxyz123/                 (donation 1)
    │   ├── amount: 50
    │   ├── name: "John Doe"
    │   ├── email: "john@example.com"
    │   ├── timestamp: 1703456789000
    │   └── date: "2023-12-24T16:26:29.000Z"
    └── -Nxyz456/                 (donation 2)
        ├── amount: 100
        ├── name: "Jane Smith"
        ├── email: "jane@example.com"
        ├── timestamp: 1703456900000
        └── date: "2023-12-24T16:28:20.000Z"
```


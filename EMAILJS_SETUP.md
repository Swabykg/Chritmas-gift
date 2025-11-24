# EmailJS Setup Instructions

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. **Copy your Service ID** (you'll need this)

## Step 3: Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. **Open the file `EMAIL_TEMPLATE.txt`** in this project folder - it contains a beautiful, ready-to-use template!
4. Copy the **Subject Line** from the template file
5. Copy the **Email Body** (use the HTML version if EmailJS supports it, otherwise use the Plain Text version)
6. Paste them into your EmailJS template

**Template Variables Used:**
- `{{to_name}}` - Donor's name
- `{{to_email}}` - Donor's email  
- `{{donation_amount}}` - Amount they donated
- `{{total_raised}}` - Total amount raised so far
- `{{goal_amount}}` - Goal amount ($2,399)
- `{{message}}` - Thank you message

4. **Copy your Template ID** (you'll need this)

## Step 4: Get Your Public Key

1. Go to **Account** > **General**
2. Find your **Public Key**
3. Copy it

## Step 5: Update Your Code

Open `index.html` and replace:

1. **Line ~127**: Replace `YOUR_PUBLIC_KEY` with your EmailJS Public Key
2. **Line ~155 in script.js**: Replace `YOUR_SERVICE_ID` with your Email Service ID
3. **Line ~155 in script.js**: Replace `YOUR_TEMPLATE_ID` with your Email Template ID

## How It Works

- When someone submits the donation form, it schedules an email to be sent **5 minutes later**
- The email includes their name, donation amount, and current progress
- Uses `sessionStorage` to remember pending emails even if they navigate away
- If they return to the page before 5 minutes, it will still send at the right time

## Important Note

⚠️ **Limitation**: If the user closes their browser completely and doesn't return within 5 minutes, the email won't send. For guaranteed delivery, consider:
- Using EmailJS's scheduled email feature (if available)
- Using a server-side solution (Node.js/Python backend)
- Sending the email immediately instead of waiting 5 minutes

## Testing

1. Fill out the donation form
2. Submit it
3. Wait 5 minutes (or check the browser console for logs)
4. Check the recipient's email inbox

## Troubleshooting

- **"EmailJS not loaded"**: Make sure the EmailJS script is loaded before the page scripts
- **Email not sending**: Check browser console for errors
- **Wrong template variables**: Make sure your EmailJS template uses the exact variable names shown above


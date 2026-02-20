# 🔥 Firebase Setup - Quick Fix Guide

## The Problem You're Facing

You're getting this error:
```
FirebaseAppError: Failed to parse private key: Error: Invalid PEM formatted message.
```

This happens because the private key format in `.env` files can be tricky to get right.

## ✅ SOLUTION: Use Service Account JSON File (Easiest Method)

### Step 1: Download Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** in the popup
7. A JSON file will download (e.g., `fintrack-xxxxx-firebase-adminsdk-xxxxx.json`)

### Step 2: Rename and Place the File

1. **Rename** the downloaded file to: `serviceAccountKey.json`
2. **Move** it to your FinTrack project root folder:
   ```
   FinTrack/
   ├── serviceAccountKey.json  ← Put it here!
   ├── server.js
   ├── package.json
   └── ...
   ```

### Step 3: Update Your .env File

You still need the database URL in your `.env` file:

```env
# Firebase Database URL (REQUIRED)
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

**That's it!** The server will automatically use `serviceAccountKey.json` if it exists.

### Step 4: Pull Latest Changes

```bash
# Pull the updated server.js
git pull origin main

# Or if you haven't committed local changes
git stash
git pull origin main
git stash pop
```

### Step 5: Restart the Server

```bash
npm run dev
```

You should see:
```
✅ Loading Firebase credentials from serviceAccountKey.json
✅ Firebase initialized successfully
🚀 FinTrack server running on http://localhost:3000
📊 Dashboard available at http://localhost:3000/dashboard
```

---

## Alternative: Fix the .env File (Advanced)

If you prefer using `.env` instead of the JSON file, here's how to format it correctly:

### Windows Users

1. Open your Firebase service account JSON file
2. Find the `private_key` field
3. Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. In your `.env` file, put it on ONE line with `\n` for line breaks:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

**Important:**
- Keep the quotes around the private key
- Replace actual line breaks with `\n`
- Don't add extra spaces
- The key should be ONE continuous line

### Mac/Linux Users

You can use this command to format it correctly:

```bash
# Extract and format the private key
cat serviceAccountKey.json | jq -r '.private_key' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//'
```

Then paste the output into your `.env` file.

---

## Verify Your Setup

### Check 1: File Exists
```bash
# Windows
dir serviceAccountKey.json

# Mac/Linux
ls -la serviceAccountKey.json
```

### Check 2: File is Valid JSON
```bash
# Windows (PowerShell)
Get-Content serviceAccountKey.json | ConvertFrom-Json

# Mac/Linux
cat serviceAccountKey.json | jq .
```

### Check 3: Database URL is Correct

Your database URL should look like:
```
https://your-project-id.firebaseio.com
```

NOT:
- ❌ `https://your-project-id.firebaseapp.com` (wrong)
- ❌ `https://your-project-id.web.app` (wrong)

Find it in Firebase Console → Realtime Database → Copy the URL at the top

---

## Common Issues

### Issue: "Cannot find module './serviceAccountKey.json'"

**Solution:** Make sure the file is in the root directory, not in a subfolder.

### Issue: "FIREBASE_DATABASE_URL is not defined"

**Solution:** Add it to your `.env` file:
```env
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### Issue: "Permission denied" errors in Firebase

**Solution:** 
1. Go to Firebase Console → Realtime Database
2. Click **Rules** tab
3. For development, use these rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
4. Click **Publish**

⚠️ **Warning:** These rules allow anyone to read/write. Use only for development!

### Issue: File downloaded with different name

**Solution:** Rename it exactly to `serviceAccountKey.json` (case-sensitive on Mac/Linux)

---

## Security Checklist

- ✅ `serviceAccountKey.json` is in `.gitignore`
- ✅ Never commit this file to GitHub
- ✅ Never share this file publicly
- ✅ Keep it secure on your local machine
- ✅ Use environment variables in production

---

## Quick Test

After setup, test if Firebase is working:

```bash
# Start the server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/expenses?userId=test-user
```

You should get:
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

---

## Still Having Issues?

1. **Delete and regenerate** the service account key
2. **Check** that Realtime Database is enabled in Firebase
3. **Verify** your Firebase project is active
4. **Try** creating a new Firebase project
5. **Check** your internet connection

---

## Need More Help?

- Check the main [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Open an issue on [GitHub](https://github.com/richu337/FinTrack/issues)
- Email: rayhanjaleel904@gmail.com

---

**Once you see the ✅ messages, you're good to go!** 🎉

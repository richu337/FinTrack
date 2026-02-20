# ✅ Firebase Setup Checklist

Use this checklist to ensure your Firebase is configured correctly for FinTrack.

---

## 🔥 Firebase Console Setup

### 1. Project Created
- [ ] Project exists: `fintrack-c8625`
- [ ] You can access it at: https://console.firebase.google.com/

### 2. Realtime Database Enabled
- [ ] Go to: Build → Realtime Database
- [ ] Database is created
- [ ] Database URL: `https://fintrack-c8625-default-rtdb.firebaseio.com/`
- [ ] Rules are set (see below)

**Database Rules (for development):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3. Authentication Enabled ⚠️ MOST COMMON ISSUE
- [ ] Go to: Build → Authentication
- [ ] Click "Get started" (if you haven't already)
- [ ] Go to "Sign-in method" tab
- [ ] Email/Password provider is **ENABLED** (toggle is ON and green)
- [ ] Status shows "Enabled" not "Disabled"

**How to Enable:**
1. Build → Authentication → Get started
2. Sign-in method tab
3. Click "Email/Password"
4. Toggle the first switch ON
5. Click "Save"

### 4. Web App Registered
- [ ] Go to: Project Settings (⚙️ gear icon)
- [ ] Scroll to "Your apps" section
- [ ] Web app exists (shows `</>` icon)
- [ ] App nickname: `FinTrack Web` (or similar)
- [ ] Firebase config is copied

**How to Add Web App:**
1. Project Settings → Your apps
2. Click `</>` icon (Add app)
3. Nickname: `FinTrack Web`
4. Don't check "Firebase Hosting"
5. Register app
6. Copy the config

---

## 💻 Local Project Setup

### 5. Environment Variables (.env file)
- [ ] `.env` file exists in project root
- [ ] Contains `FIREBASE_DATABASE_URL`
- [ ] Contains `FIREBASE_PROJECT_ID`
- [ ] Contains `FIREBASE_CLIENT_EMAIL`
- [ ] Contains `FIREBASE_PRIVATE_KEY` (properly formatted)

**OR**

- [ ] `serviceAccountKey.json` file exists in project root
- [ ] File is valid JSON
- [ ] File is in `.gitignore`

### 6. Firebase Web Config (auth.js)
- [ ] File exists: `public/js/auth.js`
- [ ] `apiKey` is NOT "YOUR_API_KEY_HERE"
- [ ] `apiKey` starts with "AIzaSy"
- [ ] `messagingSenderId` is a number (not placeholder)
- [ ] `appId` starts with "1:" (not placeholder)
- [ ] All values are from YOUR Firebase project

**Check lines 6-13 in `public/js/auth.js`:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",  // ✅ Real value, not placeholder
    authDomain: "fintrack-c8625.firebaseapp.com",
    databaseURL: "https://fintrack-c8625-default-rtdb.firebaseio.com",
    projectId: "fintrack-c8625",
    storageBucket: "fintrack-c8625.appspot.com",
    messagingSenderId: "123456789012",  // ✅ Real number
    appId: "1:123456789012:web:..."  // ✅ Real app ID
};
```

### 7. Dependencies Installed
- [ ] `node_modules` folder exists
- [ ] Ran `npm install` successfully
- [ ] No errors in package installation

### 8. Server Running
- [ ] Server starts without errors
- [ ] See: `✅ Firebase initialized successfully`
- [ ] Server accessible at: http://localhost:3000

---

## 🧪 Testing

### 9. Basic Connectivity
- [ ] Open http://localhost:3000
- [ ] Landing page loads
- [ ] No console errors (F12)

### 10. Authentication Pages Load
- [ ] http://localhost:3000/login loads
- [ ] http://localhost:3000/signup loads
- [ ] Firebase SDK loads (check Network tab in F12)
- [ ] Console shows: `✅ Firebase initialized successfully`

### 11. Sign Up Works
- [ ] Go to signup page
- [ ] Fill in: Name, Email, Password
- [ ] Click "Create Account"
- [ ] No errors in console
- [ ] User created in Firebase Console → Authentication → Users
- [ ] Redirected to dashboard

### 12. Login Works
- [ ] Go to login page
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] No errors
- [ ] Redirected to dashboard
- [ ] User email shows in header

### 13. Dashboard Works
- [ ] Dashboard loads after login
- [ ] User email displayed in header
- [ ] Can add expenses
- [ ] Can set budgets
- [ ] Data saves to Firebase

---

## 🐛 Common Issues & Solutions

### Issue: "auth/configuration-not-found"
**Cause:** Authentication not enabled in Firebase Console  
**Solution:** 
1. Firebase Console → Build → Authentication
2. Click "Get started"
3. Enable Email/Password provider

### Issue: "auth/api-key-not-valid"
**Cause:** Wrong or missing API key in auth.js  
**Solution:**
1. Get config from Firebase Console → Project Settings → Your apps
2. Update `public/js/auth.js` with real values

### Issue: "Failed to parse private key"
**Cause:** Incorrect private key format in .env  
**Solution:**
1. Use `serviceAccountKey.json` instead (easier)
2. Or fix .env format (see FIREBASE_SETUP.md)

### Issue: Server won't start
**Cause:** Missing dependencies or wrong Node version  
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "Firebase is not defined"
**Cause:** Firebase SDK not loading  
**Solution:**
1. Check internet connection
2. Verify CDN scripts in HTML files
3. Check browser console for network errors

### Issue: Can't access dashboard
**Cause:** Not logged in  
**Solution:**
1. Login first at /login
2. Check localStorage has userId
3. Clear cache and try again

---

## 📊 Firebase Console Quick Links

| Service | URL |
|---------|-----|
| Project Overview | https://console.firebase.google.com/project/fintrack-c8625/overview |
| Authentication | https://console.firebase.google.com/project/fintrack-c8625/authentication/users |
| Realtime Database | https://console.firebase.google.com/project/fintrack-c8625/database |
| Project Settings | https://console.firebase.google.com/project/fintrack-c8625/settings/general |

---

## ✅ Success Criteria

Your setup is complete when:

1. ✅ Server starts with: `✅ Firebase initialized successfully`
2. ✅ Signup creates user in Firebase Console → Authentication → Users
3. ✅ Login redirects to dashboard
4. ✅ Dashboard shows user email in header
5. ✅ Can add expenses and they save to Firebase
6. ✅ Can set budgets and they save to Firebase
7. ✅ No errors in browser console

---

## 🎯 Quick Test Script

Run through this in 2 minutes:

1. **Start server:** `npm run dev`
2. **Check console:** Should see `✅ Firebase initialized successfully`
3. **Open:** http://localhost:3000/signup
4. **Browser console (F12):** Should see `✅ Firebase initialized successfully`
5. **Sign up:** Use test@example.com / test123456
6. **Check Firebase Console:** User should appear in Authentication → Users
7. **Dashboard:** Should load with email in header
8. **Add expense:** Amount: 100, Category: Food
9. **Check Firebase Console:** Expense should appear in Realtime Database

---

## 📞 Still Stuck?

If you've checked everything and still have issues:

1. **Screenshot** the error in browser console (F12)
2. **Screenshot** Firebase Console → Authentication → Sign-in method
3. **Check** `public/js/auth.js` lines 6-13 (Firebase config)
4. **Verify** Firebase Console → Authentication shows "Get started" or has users tab
5. **Share** the specific error message

---

## 🎉 All Green?

If all checkboxes are checked, your FinTrack is fully configured and ready to use! 🚀

**Happy expense tracking! 💰**

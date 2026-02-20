# 🔐 Authentication Setup Guide

FinTrack now includes **Firebase Authentication** for secure user login and signup!

## 🎯 What's New

✅ **User Authentication** - Secure email/password login  
✅ **User Registration** - Easy signup process  
✅ **Password Reset** - Forgot password functionality  
✅ **Protected Routes** - Dashboard requires login  
✅ **User-Specific Data** - Each user has their own expenses and budgets  
✅ **Demo Account** - Try without signing up  

---

## 🚀 Setup Steps

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fintrack-c8625`)
3. Click **"Build"** → **"Authentication"**
4. Click **"Get started"**
5. Under **"Sign-in method"** tab:
   - Click **"Email/Password"**
   - **Enable** the first toggle (Email/Password)
   - Click **"Save"**

### Step 2: Get Your Firebase Web Config

1. In Firebase Console, click the **gear icon** ⚙️ → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **web icon** `</>` (if you haven't added a web app yet)
4. Register app with nickname: `FinTrack Web`
5. **Copy the Firebase configuration** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "fintrack-c8625.firebaseapp.com",
  databaseURL: "https://fintrack-c8625-default-rtdb.firebaseio.com",
  projectId: "fintrack-c8625",
  storageBucket: "fintrack-c8625.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 3: Update auth.js with Your Config

1. Open `public/js/auth.js`
2. Replace the `firebaseConfig` object (lines 2-9) with YOUR config from Step 2
3. Save the file

**Before:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // ...
};
```

**After:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "fintrack-c8625.firebaseapp.com",
    databaseURL: "https://fintrack-c8625-default-rtdb.firebaseio.com",
    projectId: "fintrack-c8625",
    storageBucket: "fintrack-c8625.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 4: Create Demo Account (Optional)

To enable the "Try Demo Account" button:

1. Go to Firebase Console → Authentication → Users
2. Click **"Add user"**
3. Email: `demo@fintrack.com`
4. Password: `demo123456`
5. Click **"Add user"**

---

## 🧪 Testing Authentication

### Test 1: Sign Up

1. Start your server: `npm run dev`
2. Go to: http://localhost:3000/signup
3. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: test123456
   - Confirm Password: test123456
4. Check "I agree to Terms"
5. Click **"Create Account"**
6. You should be redirected to the dashboard

### Test 2: Login

1. Go to: http://localhost:3000/login
2. Enter your email and password
3. Click **"Sign In"**
4. You should see the dashboard with your email displayed

### Test 3: Demo Account

1. Go to: http://localhost:3000/login
2. Click **"Try Demo Account"**
3. Should auto-login with demo credentials

### Test 4: Protected Routes

1. Logout from dashboard
2. Try to access: http://localhost:3000/dashboard
3. Should redirect to login page

### Test 5: Password Reset

1. Go to login page
2. Click **"Forgot password?"**
3. Enter your email
4. Check your email for reset link

---

## 📁 New Files Added

```
FinTrack/
├── public/
│   ├── css/
│   │   └── auth.css          # Authentication page styles
│   └── js/
│       └── auth.js            # Firebase auth logic
├── views/
│   ├── login.ejs              # Login page
│   └── signup.ejs             # Signup page
└── AUTH_SETUP.md              # This file
```

---

## 🔒 How It Works

### User Flow

1. **New User:**
   - Visits `/signup`
   - Creates account with email/password
   - Firebase creates user account
   - User ID stored in localStorage
   - Redirected to dashboard

2. **Returning User:**
   - Visits `/login`
   - Enters credentials
   - Firebase authenticates
   - User ID stored in localStorage
   - Redirected to dashboard

3. **Dashboard Access:**
   - Checks localStorage for userId
   - If not found → redirect to login
   - If found → load user's data from Firebase

### Data Isolation

Each user's data is stored separately in Firebase:

```
Firebase Realtime Database:
├── expenses/
│   ├── user-id-1/
│   │   └── expense-1
│   ├── user-id-2/
│   │   └── expense-1
│   └── demo-user/
│       └── expense-1
└── budgets/
    ├── user-id-1/
    │   └── budget-1
    └── user-id-2/
        └── budget-1
```

---

## 🎨 UI Features

### Login Page
- Email/password fields
- Remember me checkbox
- Forgot password link
- Demo account button
- Sign up link

### Signup Page
- Full name field
- Email field
- Password field with strength indicator
- Confirm password field
- Terms & conditions checkbox
- Login link

### Dashboard
- User email displayed in header
- Logout button
- All data specific to logged-in user

---

## 🔧 Customization

### Change Demo Account Credentials

Edit `views/login.ejs` line 62-63:
```javascript
document.getElementById('email').value = 'your-demo@email.com';
document.getElementById('password').value = 'your-password';
```

### Add Social Login (Google, Facebook, etc.)

1. Enable in Firebase Console → Authentication → Sign-in method
2. Add buttons to login.ejs
3. Implement in auth.js:

```javascript
async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### Customize Password Requirements

Edit `views/signup.ejs` line 25:
```html
<input type="password" id="password" required minlength="8">
```

---

## 🛡️ Security Best Practices

### Current Implementation

✅ Firebase handles password hashing  
✅ Secure authentication tokens  
✅ Client-side route protection  
✅ User data isolation  

### Recommended Additions

1. **Server-Side Auth Middleware:**
```javascript
// Add to routes/expenses.js
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.userId = decodedToken.uid;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
```

2. **Update Firebase Database Rules:**
```json
{
  "rules": {
    "expenses": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "budgets": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

3. **Enable Email Verification:**
```javascript
// After signup
await userCredential.user.sendEmailVerification();
```

---

## 🐛 Troubleshooting

### Issue: "Firebase is not defined"

**Solution:** Make sure Firebase CDN scripts are loaded in your HTML:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
```

### Issue: "Auth domain not whitelisted"

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add `localhost`

### Issue: "User not redirected after login"

**Solution:** Check browser console for errors. Make sure:
- Firebase config is correct
- localStorage is enabled
- No CORS issues

### Issue: "Cannot read property 'uid' of null"

**Solution:** User is not authenticated. Check:
- Firebase auth is initialized
- User is logged in
- Token is valid

---

## 📊 User Management

### View All Users

Firebase Console → Authentication → Users

### Delete User

1. Firebase Console → Authentication → Users
2. Click user → Delete user

### Reset User Password

1. Firebase Console → Authentication → Users
2. Click user → Reset password
3. User receives email with reset link

---

## 🚀 Next Steps

1. ✅ **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. ✅ **Enable Firebase Authentication** (Step 1 above)

3. ✅ **Get Firebase web config** (Step 2 above)

4. ✅ **Update auth.js** with your config (Step 3 above)

5. ✅ **Create demo account** (Step 4 above - optional)

6. ✅ **Test the authentication flow**

7. ✅ **Update Firebase database rules** for security

---

## 📞 Need Help?

- Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase basics
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for general setup
- Open an issue on [GitHub](https://github.com/richu337/FinTrack/issues)
- Email: rayhanjaleel904@gmail.com

---

**Your FinTrack app now has secure user authentication! 🎉**

# 🚀 FinTrack Setup Guide

This guide will walk you through setting up FinTrack from scratch, including Firebase configuration.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- A code editor (VS Code recommended)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Verify Installation
```bash
node --version  # Should show v14.x.x or higher
npm --version   # Should show 6.x.x or higher
git --version   # Should show 2.x.x or higher
```

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `fintrack-app` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional for this project)
6. Click **Create project**
7. Wait for project creation, then click **Continue**

### Step 2: Enable Realtime Database

1. In Firebase Console, click **"Build"** in left sidebar
2. Click **"Realtime Database"**
3. Click **"Create Database"**
4. Choose location (select closest to your users)
5. Select **"Start in test mode"** (for development)
6. Click **Enable**
7. **Copy your database URL** - it looks like:
   ```
   https://fintrack-app-xxxxx.firebaseio.com
   ```

### Step 3: Generate Service Account Key

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Go to **"Service accounts"** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the popup
6. A JSON file will download - **SAVE THIS SECURELY!**
7. **DO NOT share this file or commit it to Git!**

### Step 4: Extract Firebase Credentials

Open the downloaded JSON file. You'll need these values:

```json
{
  "project_id": "fintrack-app-xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@fintrack-app-xxxxx.iam.gserviceaccount.com"
}
```

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/richu337/FinTrack.git

# Navigate to project directory
cd FinTrack
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- firebase-admin
- dotenv
- cors
- body-parser
- ejs

### Step 3: Configure Environment Variables

1. **Copy the example file:**
```bash
cp .env.example .env
```

2. **Edit `.env` file:**
```bash
# On Windows
notepad .env

# On Mac/Linux
nano .env
# or
code .env  # if using VS Code
```

3. **Add your Firebase credentials:**

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=fintrack-app-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fintrack-app-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Actual-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://fintrack-app-xxxxx.firebaseio.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important Notes:**
- Replace all `xxxxx` with your actual values
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- The private key should be on ONE line with `\n` for line breaks
- Don't remove the quotes or change the format

### Step 4: Start the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
🚀 FinTrack server running on http://localhost:3000
📊 Dashboard available at http://localhost:3000/dashboard
```

### Step 5: Open in Browser

1. Open your browser
2. Go to: http://localhost:3000
3. You should see the FinTrack landing page
4. Click **"Get Started"** or go to http://localhost:3000/dashboard

## Testing the Application

### Test 1: Add an Expense

1. Go to dashboard: http://localhost:3000/dashboard
2. Click **"+ Add Expense"**
3. Fill in:
   - Amount: `500`
   - Category: `Food`
   - Description: `Lunch at cafe`
   - Date: Today's date
4. Click **"Add Expense"**
5. You should see a success message
6. The expense should appear in "Recent Expenses"

### Test 2: Set a Budget

1. Click **"Budgets"** in sidebar
2. Click **"+ Add Budget"**
3. Fill in:
   - Category: `Food`
   - Amount: `5000`
   - Period: `Monthly`
4. Click **"Set Budget"**
5. You should see the budget card with progress bar

### Test 3: View Reports

1. Click **"Reports"** in sidebar
2. You should see your top spending categories
3. Change period selector to see different time ranges

### Test 4: Verify Firebase Data

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Realtime Database**
4. You should see data structure:
   ```
   fintrack-app-xxxxx
   ├── expenses
   │   └── demo-user
   │       └── -Nxxxxx (your expense)
   └── budgets
       └── demo-user
           └── -Nxxxxx (your budget)
   ```

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Firebase credential error"

**Possible causes:**
1. Missing `.env` file
2. Incorrect credentials in `.env`
3. Private key format issue

**Solution:**
1. Verify `.env` file exists
2. Check all values are correct
3. Ensure private key is in quotes and has `\n` for line breaks
4. Try regenerating service account key

### Issue: "EADDRINUSE: Port 3000 already in use"

**Solution:**

**On Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**On Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Or change port in `.env`:
```env
PORT=3001
```

### Issue: "Cannot connect to Firebase"

**Solution:**
1. Check internet connection
2. Verify `FIREBASE_DATABASE_URL` is correct
3. Ensure Firebase Realtime Database is enabled
4. Check Firebase project is active

### Issue: "Module not found: 'dotenv'"

**Solution:**
```bash
npm install dotenv
```

### Issue: Data not showing in dashboard

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Verify API calls are successful
4. Check Firebase database rules
5. Ensure `userId` is set correctly in `dashboard.js`

### Issue: Styles not loading

**Solution:**
1. Check if `public` folder exists
2. Verify CSS files are in `public/css/`
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for 404 errors

## Database Structure

FinTrack uses this Firebase structure:

```json
{
  "expenses": {
    "demo-user": {
      "-NxxxExpenseId1": {
        "amount": 500,
        "category": "Food",
        "description": "Lunch",
        "date": "2024-02-20",
        "createdAt": "2024-02-20T10:30:00.000Z"
      }
    }
  },
  "budgets": {
    "demo-user": {
      "-NxxxBudgetId1": {
        "category": "Food",
        "amount": 5000,
        "period": "monthly",
        "createdAt": "2024-02-20T10:30:00.000Z"
      }
    }
  }
}
```

## Next Steps

1. **Add Authentication**: Implement user login/signup
2. **Customize Categories**: Add your own expense categories
3. **Deploy**: Deploy to Heroku, Vercel, or your preferred platform
4. **Enhance UI**: Add charts, graphs, and more visualizations
5. **Mobile App**: Build a React Native mobile version

## Need Help?

- **GitHub Issues**: [Create an issue](https://github.com/richu337/FinTrack/issues)
- **Email**: rayhanjaleel904@gmail.com
- **Documentation**: Check README.md for more details

---

**Happy Tracking! 💰**

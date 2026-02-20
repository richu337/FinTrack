// Firebase Web SDK Configuration
// You'll need to add your Firebase web config here
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be loaded from CDN)
let auth;
let currentUser = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        
        // Listen for auth state changes
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            if (user) {
                // User is signed in
                console.log('User signed in:', user.email);
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userEmail', user.email);
                
                // Redirect to dashboard if on login page
                if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
                    window.location.href = '/dashboard';
                }
            } else {
                // User is signed out
                console.log('User signed out');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                
                // Redirect to login if trying to access dashboard
                if (window.location.pathname === '/dashboard') {
                    window.location.href = '/login';
                }
            }
        });
    }
});

// Get current user ID
function getCurrentUserId() {
    return localStorage.getItem('userId') || 'demo-user';
}

// Get current user email
function getCurrentUserEmail() {
    return localStorage.getItem('userEmail') || 'Demo User';
}

// Sign up with email and password
async function signUp(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update profile with display name
        if (displayName) {
            await userCredential.user.updateProfile({
                displayName: displayName
            });
        }
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        window.location.href = '/login';
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Reset password
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

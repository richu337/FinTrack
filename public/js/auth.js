// ⚠️ IMPORTANT: Replace this with YOUR Firebase Web Config
// Get it from: Firebase Console → Project Settings → Your apps → Web app
// See AUTH_SETUP.md for detailed instructions

const firebaseConfig = {
    apiKey: "AIzaSyAq7w787wO11erO4UaVZVQ6z40yOVPdGBk",
    authDomain: "fintrack-c8625.firebaseapp.com",
    databaseURL: "https://fintrack-c8625-default-rtdb.firebaseio.com",
    projectId: "fintrack-c8625",
    storageBucket: "fintrack-c8625.firebasestorage.app",
    messagingSenderId: "535143965229",
    appId: "1:535143965229:web:a5e4e9d5e59b2dd8228ea4"
};

// Initialize Firebase (will be loaded from CDN)
let auth;
let currentUser = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            console.log('✅ Firebase initialized successfully');
            
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
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            alert('Firebase configuration error. Please check your Firebase config in auth.js');
        }
    } else {
        console.error('❌ Firebase SDK not loaded');
        alert('Firebase SDK failed to load. Please check your internet connection.');
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
        let errorMessage = error.message;
        
        // Provide user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        } else if (error.code === 'auth/api-key-not-valid') {
            errorMessage = 'Firebase API key is not configured. Please update auth.js with your Firebase config.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        let errorMessage = error.message;
        
        // Provide user-friendly error messages
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please sign up first.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled.';
        } else if (error.code === 'auth/api-key-not-valid') {
            errorMessage = 'Firebase API key is not configured. Please update auth.js with your Firebase config.';
        }
        
        return { success: false, error: errorMessage };
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
        let errorMessage = error.message;
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }
        
        return { success: false, error: errorMessage };
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

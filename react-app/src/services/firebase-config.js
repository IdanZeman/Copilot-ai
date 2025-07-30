// Firebase Configuration for React App
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_I9Zfh8IRHmZstnvGasT50IxuC9jMCeA",
  authDomain: "ai-shirts.firebaseapp.com",
  projectId: "ai-shirts",
  storageBucket: "ai-shirts.firebasestorage.app",
  messagingSenderId: "213077047995",
  appId: "1:213077047995:web:522f2ebb10735760f6079e",
  measurementId: "G-6XFPHRMYQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

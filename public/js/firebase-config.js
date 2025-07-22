// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp, addDoc, orderBy, limit, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Configure Google Auth Provider
provider.addScope('profile');
provider.addScope('email');

export { 
    auth, 
    db, 
    provider, 
    signInWithPopup, 
    signInWithRedirect, 
    getRedirectResult, 
    signOut, 
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
    addDoc,
    orderBy,
    limit,
    deleteDoc
};
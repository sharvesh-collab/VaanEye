import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBnQUOXFffg9IKUxgnTDNUxytyC85OnrdA",
  authDomain: "vaaneye.firebaseapp.com",
  projectId: "vaaneye",
  storageBucket: "vaaneye.firebasestorage.app",
  messagingSenderId: "624320490064",
  appId: "1:624320490064:web:5ef4dc177c795990517f55",
  measurementId: "G-RG0V8HLHLB"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

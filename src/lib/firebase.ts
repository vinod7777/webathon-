import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBTjHVGRGvFIHrnelcfsc_jFDTA5uAMM5U",
  authDomain: "shop-596cc.firebaseapp.com",
  projectId: "shop-596cc",
  storageBucket: "shop-596cc.firebasestorage.app",
  messagingSenderId: "564004292575",
  appId: "1:564004292575:web:680ec3abf37bd532da266a",
  measurementId: "G-13Q57DWWTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;

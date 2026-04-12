import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAWN4YdkMAXlsosrV-6t7LeyxAH4gAJ0K8",
  authDomain: "ezfix-75dee.firebaseapp.com",
  projectId: "ezfix-75dee",
  storageBucket: "ezfix-75dee.firebasestorage.app",
  messagingSenderId: "266168477467",
  appId: "1:266168477467:web:718e63a7f505df7e8b95be",
  measurementId: "G-YRV6DXEKZ3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { auth, analytics };

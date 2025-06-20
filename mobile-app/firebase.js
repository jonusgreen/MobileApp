// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration (same as web client)
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBwb0QJcuFm5d1Whci-O_L_-rBpXXE", // Replace with your actual API key
  authDomain: "real-estate-8b3a6.firebaseapp.com",
  projectId: "real-estate-8b3a6",
  storageBucket: "real-estate-8b3a6.appspot.com",
  messagingSenderId: "763543249582",
  appId: "1:763543249582:web:a7ca00d13129353498433f",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app)
export default app

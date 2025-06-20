import { GoogleAuthProvider, signInWithCredential, FacebookAuthProvider } from "firebase/auth"
import { auth } from "../../firebase"
import * as Google from "expo-auth-session/providers/google"
import * as Facebook from "expo-auth-session/providers/facebook"
import * as WebBrowser from "expo-web-browser"
import { apiCall } from "./api"

WebBrowser.maybeCompleteAuthSession()

// Google OAuth Configuration (you'll need to get these from Firebase Console)
const GOOGLE_CONFIG = {
  expoClientId: "763543249582-your-expo-client-id.apps.googleusercontent.com",
  iosClientId: "763543249582-your-ios-client-id.apps.googleusercontent.com",
  androidClientId: "763543249582-your-android-client-id.apps.googleusercontent.com",
  webClientId: "763543249582-your-web-client-id.apps.googleusercontent.com",
}

// Facebook Configuration
const FACEBOOK_CONFIG = {
  clientId: "YOUR_FACEBOOK_APP_ID",
}

// Custom hook for Google authentication
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CONFIG.expoClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
    scopes: ["profile", "email"],
  })

  const signInWithGoogle = async () => {
    try {
      console.log("🔐 Starting Google Sign-In with Firebase...")

      if (!request) {
        throw new Error("Failed to create Google auth request")
      }

      // Prompt for authentication
      const result = await promptAsync()

      if (result.type === "success") {
        console.log("✅ Google OAuth successful, creating Firebase credential...")

        // Create Firebase credential from Google token
        const { id_token, access_token } = result.params
        const credential = GoogleAuthProvider.credential(id_token, access_token)

        // Sign in to Firebase
        const firebaseResult = await signInWithCredential(auth, credential)
        const user = firebaseResult.user

        console.log("✅ Firebase sign-in successful:", user.email)

        // Send user data to your backend (same as web version)
        const backendResponse = await apiCall("/auth/google", "POST", {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          firebaseUid: user.uid,
        })

        return {
          success: true,
          data: backendResponse,
          firebaseUser: user,
        }
      } else {
        console.log("❌ Google OAuth cancelled or failed")
        return {
          success: false,
          error: "Authentication cancelled",
        }
      }
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error)
      return {
        success: false,
        error: error.message || "Failed to sign in with Google",
      }
    }
  }

  return { signInWithGoogle, request, response }
}

// Custom hook for Facebook authentication
export const useFacebookAuth = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_CONFIG.clientId,
    scopes: ["public_profile", "email"],
  })

  const signInWithFacebook = async () => {
    try {
      console.log("🔐 Starting Facebook Sign-In with Firebase...")

      if (!request) {
        throw new Error("Failed to create Facebook auth request")
      }

      // Prompt for authentication
      const result = await promptAsync()

      if (result.type === "success") {
        console.log("✅ Facebook OAuth successful, creating Firebase credential...")

        // Create Firebase credential from Facebook token
        const { access_token } = result.params
        const credential = FacebookAuthProvider.credential(access_token)

        // Sign in to Firebase
        const firebaseResult = await signInWithCredential(auth, credential)
        const user = firebaseResult.user

        console.log("✅ Firebase sign-in successful:", user.email)

        // Send user data to your backend (same as web version)
        const backendResponse = await apiCall("/auth/facebook", "POST", {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          firebaseUid: user.uid,
        })

        return {
          success: true,
          data: backendResponse,
          firebaseUser: user,
        }
      } else {
        console.log("❌ Facebook OAuth cancelled or failed")
        return {
          success: false,
          error: "Authentication cancelled",
        }
      }
    } catch (error) {
      console.error("❌ Facebook Sign-In Error:", error)
      return {
        success: false,
        error: error.message || "Failed to sign in with Facebook",
      }
    }
  }

  return { signInWithFacebook, request, response }
}

// Sign out from Firebase
export const signOutFromFirebase = async () => {
  try {
    await auth.signOut()
    console.log("✅ Signed out from Firebase")
  } catch (error) {
    console.error("❌ Firebase sign out error:", error)
  }
}

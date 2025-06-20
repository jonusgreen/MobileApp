import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { Platform } from "react-native"
import { apiCall } from "./api"

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession()

// OAuth configuration
const OAUTH_CONFIG = {
  google: {
    // Replace these with your actual Google OAuth client IDs
    clientId: Platform.select({
      ios: "YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      android: "YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      default: "832112651369-oalk0s344qc3l56i5lj6brh76a4er198.apps.googleusercontent.com",
    }),
    scopes: ["openid", "profile", "email"],
  },
  facebook: {
    // Replace with your Facebook App ID
    clientId: "YOUR_FACEBOOK_APP_ID",
    scopes: ["public_profile", "email"],
  },
}

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    console.log("Starting Google OAuth...")

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "estateapp",
      path: "auth",
    })

    console.log("Redirect URI:", redirectUri)

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId: OAUTH_CONFIG.google.clientId,
      scopes: OAUTH_CONFIG.google.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    })

    // Get Google's OAuth endpoints
    const discovery = await AuthSession.fetchDiscoveryAsync("https://accounts.google.com")

    // Prompt user for authentication
    const result = await request.promptAsync(discovery)

    if (result.type === "success") {
      console.log("Google auth successful, exchanging code for token...")

      // Exchange authorization code for access token
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: OAUTH_CONFIG.google.clientId,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery,
      )

      // Get user info from Google
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
        },
      })

      const userInfo = await userInfoResponse.json()
      console.log("Google user info:", userInfo)

      // Send to your backend (similar to web version)
      const response = await apiCall("/auth/google", "POST", {
        googleId: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        accessToken: tokenResult.accessToken,
      })

      return {
        success: true,
        data: response,
      }
    } else {
      console.log("Google auth cancelled or failed:", result)
      return {
        success: false,
        error: "Authentication cancelled",
      }
    }
  } catch (error) {
    console.error("Google OAuth Error:", error)
    return {
      success: false,
      error: error.message || "Failed to authenticate with Google",
    }
  }
}

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    console.log("Starting Facebook OAuth...")

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "estateapp",
      path: "auth",
    })

    console.log("Redirect URI:", redirectUri)

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId: OAUTH_CONFIG.facebook.clientId,
      scopes: OAUTH_CONFIG.facebook.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    })

    // Facebook OAuth endpoints
    const discovery = {
      authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
    }

    // Prompt user for authentication
    const result = await request.promptAsync(discovery)

    if (result.type === "success") {
      console.log("Facebook auth successful")

      const { access_token } = result.params

      // Get user info from Facebook
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${access_token}`,
      )

      const userInfo = await userInfoResponse.json()
      console.log("Facebook user info:", userInfo)

      // Send to your backend (same as web version)
      const response = await apiCall("/auth/facebook", "POST", {
        facebookId: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture?.data?.url,
        accessToken: access_token,
      })

      return {
        success: true,
        data: response,
      }
    } else {
      console.log("Facebook auth cancelled or failed:", result)
      return {
        success: false,
        error: "Authentication cancelled",
      }
    }
  } catch (error) {
    console.error("Facebook OAuth Error:", error)
    return {
      success: false,
      error: error.message || "Failed to authenticate with Facebook",
    }
  }
}

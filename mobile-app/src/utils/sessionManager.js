import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

class SessionManager {
  constructor() {
    this.sessionId = null
    this.initSession()
  }

  async initSession() {
    try {
      // Try to get existing session ID
      let sessionId = await AsyncStorage.getItem("app_session_id")

      if (!sessionId) {
        // Generate new session ID
        sessionId = this.generateSessionId()
        await AsyncStorage.setItem("app_session_id", sessionId)
      }

      this.sessionId = sessionId
      console.log("Session initialized:", sessionId)
    } catch (error) {
      console.error("Error initializing session:", error)
      // Fallback session ID
      this.sessionId = this.generateSessionId()
    }
  }

  generateSessionId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const platform = Platform.OS
    return `${platform}-${timestamp}-${random}`
  }

  async getSessionId() {
    if (!this.sessionId) {
      await this.initSession()
    }
    return this.sessionId
  }

  async clearSession() {
    try {
      await AsyncStorage.removeItem("app_session_id")
      this.sessionId = null
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  async refreshSession() {
    await this.clearSession()
    await this.initSession()
  }
}

export default new SessionManager()

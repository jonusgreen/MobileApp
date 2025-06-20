"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native"

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const testApiConnection = async () => {
    try {
      console.log("🔍 Testing API connection...")
      const response = await fetch("http://192.168.1.100:3000/api/listing/stats")
      const text = await response.text()
      console.log("📊 API Test Response:", text.substring(0, 200))
      Alert.alert("API Test", `Status: ${response.status}\nResponse: ${text.substring(0, 100)}...`)
    } catch (error) {
      console.error("❌ API Test Failed:", error)
      Alert.alert("API Test Failed", error.message)
    }
  }

  const handleSubmit = async () => {
    console.log("🚀 Starting forgot password process...")
    console.log("📧 Email entered:", email)

    // Clear previous messages
    setMessage({ type: "", text: "" })

    // Validate email
    if (!email.trim()) {
      console.log("❌ Email is empty")
      setMessage({ type: "error", text: "Please enter your email address" })
      return
    }

    if (!validateEmail(email)) {
      console.log("❌ Email format invalid")
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return
    }

    console.log("✅ Email validation passed")
    setIsLoading(true)

    try {
      console.log("📡 Making API call to /auth/forgot-password...")
      console.log("📦 Request data:", { email })

      // Try direct fetch first for debugging
      const directResponse = await fetch("http://192.168.1.100:3000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      console.log("📊 Direct fetch response status:", directResponse.status)
      const responseText = await directResponse.text()
      console.log("📄 Direct fetch response text:", responseText)

      if (directResponse.ok) {
        const responseData = JSON.parse(responseText)
        console.log("✅ Success response:", responseData)

        setMessage({
          type: "success",
          text: "Password reset instructions have been sent to your email",
        })

        // Navigate back to sign in after 3 seconds
        setTimeout(() => {
          navigation.navigate("SignIn")
        }, 3000)
      } else {
        console.log("❌ Error response:", responseText)
        let errorMessage = "Something went wrong. Please try again later."

        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.log("❌ Could not parse error response as JSON")
        }

        setMessage({ type: "error", text: errorMessage })
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      setMessage({
        type: "error",
        text: `Network error: ${error.message}. Check if backend server is running.`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessage = () => {
    setMessage({ type: "", text: "" })
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Your Password</Text>

          <Text style={styles.description}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          {/* Debug Button */}
          <TouchableOpacity style={styles.debugButton} onPress={testApiConnection}>
            <Text style={styles.debugButtonText}>🔍 Test API Connection</Text>
          </TouchableOpacity>

          {message.text ? (
            <View
              style={[
                styles.messageContainer,
                message.type === "error" ? styles.errorContainer : styles.successContainer,
              ]}
            >
              <Text style={[styles.messageText, message.type === "error" ? styles.errorText : styles.successText]}>
                {message.text}
              </Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, message.type === "error" && styles.inputError]}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                clearMessage()
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Instructions</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.backButtonText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1F2937",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  debugButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  successContainer: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  messageText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#B91C1C",
  },
  successText: {
    color: "#059669",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    padding: 12,
  },
  backButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "500",
  },
})

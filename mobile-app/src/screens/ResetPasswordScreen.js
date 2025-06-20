"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { apiCall } from "../config/api"

export default function ResetPasswordScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [validatingToken, setValidatingToken] = useState(true)

  // Get token and userId from route params (from deep link)
  const { token, userId } = route.params || {}

  useEffect(() => {
    // Validate token when component mounts
    validateResetToken()
  }, [])

  const validateResetToken = async () => {
    if (!token || !userId) {
      setErrorMessage("Invalid reset link. Please request a new password reset.")
      setValidatingToken(false)
      return
    }

    try {
      // You can add a token validation endpoint if needed
      setValidatingToken(false)
    } catch (error) {
      setErrorMessage("This reset link has expired. Please request a new password reset.")
      setValidatingToken(false)
    }
  }

  const getCleanErrorMessage = (error) => {
    const errorMsg = error.message || error.toString()

    if (errorMsg.includes("Token expired") || errorMsg.includes("Invalid token")) {
      return "This reset link has expired. Please request a new password reset."
    }

    if (errorMsg.includes("Password too weak")) {
      return "Password must be at least 6 characters long."
    }

    if (errorMsg.includes("Network request failed") || errorMsg.includes("timeout")) {
      return "Connection error. Please check your internet and try again."
    }

    return "Something went wrong. Please try again."
  }

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
    if (errorMessage) setErrorMessage("")
  }

  const validatePassword = () => {
    if (!formData.password || !formData.confirmPassword) {
      setErrorMessage("Please fill in all fields")
      return false
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validatePassword()) return

    try {
      setLoading(true)
      setErrorMessage("")

      console.log("Resetting password for user:", userId)

      await apiCall(`/auth/reset-password/${userId}/${token}`, {
        method: "POST",
        body: JSON.stringify({ password: formData.password }),
      })

      Alert.alert(
        "Success!",
        "Your password has been reset successfully. You can now sign in with your new password.",
        [
          {
            text: "Sign In",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              })
            },
          },
        ],
      )
    } catch (error) {
      console.error("Reset password error:", error)
      const cleanMessage = getCleanErrorMessage(error)
      setErrorMessage(cleanMessage)
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Validating reset link...</Text>
        </View>
      </View>
    )
  }

  if (errorMessage && !formData.password && !formData.confirmPassword) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.backButtonText}>← Back to Sign In</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reset Password</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.submitButtonText}>Request New Reset Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.backButtonText}>← Back to Sign In</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.subtitle}>Create New Password</Text>
          <Text style={styles.description}>
            Enter your new password below. Make sure it's at least 6 characters long.
          </Text>
        </View>

        <View style={styles.form}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TextInput
            style={[styles.input, errorMessage && styles.inputError]}
            placeholder="New Password"
            value={formData.password}
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, errorMessage && styles.inputError]}
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange("confirmPassword", value)}
            secureTextEntry
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{loading ? "Updating Password..." : "Update Password"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: "#3B82F6",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  infoSection: {
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF7F7",
  },
  submitButton: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textTransform: "uppercase",
  },
})

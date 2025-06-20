"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice"
import { apiCall } from "../config/api"
import { useGoogleAuth, useFacebookAuth } from "../config/firebaseAuth"

export default function SignInScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  const dispatch = useDispatch()
  const { currentUser, error } = useSelector((state) => state.user)

  // Use the authentication hooks
  const { signInWithGoogle } = useGoogleAuth()
  const { signInWithFacebook } = useFacebookAuth()

  useEffect(() => {
    if (currentUser) {
      // Navigate to MainTabs instead of Home
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      })
    }
  }, [currentUser, navigation])

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required")
      return false
    }
    if (!formData.password) {
      Alert.alert("Error", "Password is required")
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address")
      return false
    }

    return true
  }

  const navigateToMainApp = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    })
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      dispatch(signInStart())

      console.log("🔐 Attempting sign in with:", { email: formData.email })

      const res = await apiCall("/auth/signin", "POST", formData)

      console.log("✅ Sign in response:", res)

      if (res.success === false) {
        dispatch(signInFailure(res.message))

        // Show helpful error message for wrong credentials
        if (res.message.includes("Wrong credentials") || res.message.includes("401")) {
          Alert.alert("Sign In Failed", "Wrong email or password. Did you recently change your password?", [
            { text: "Try Again", style: "default" },
            { text: "Reset Password", onPress: () => navigation.navigate("ForgotPassword") },
          ])
        } else {
          Alert.alert("Sign In Failed", res.message)
        }
        return
      }

      dispatch(signInSuccess(res))
      Alert.alert("Success", "Signed in successfully!", [{ text: "OK", onPress: navigateToMainApp }])
    } catch (error) {
      console.error("❌ Sign in error:", error)
      dispatch(signInFailure(error.message))

      if (error.message.includes("Authentication failed")) {
        Alert.alert("Authentication Failed", "Wrong email or password. Need to reset your password?", [
          { text: "Try Again", style: "default" },
          { text: "Reset Password", onPress: () => navigation.navigate("ForgotPassword") },
        ])
      } else {
        Alert.alert("Error", error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      dispatch(signInStart())

      console.log("Starting Google sign in with Firebase...")
      const result = await signInWithGoogle()

      if (result.success) {
        console.log("Google sign in successful:", result.data)
        dispatch(signInSuccess(result.data))
        Alert.alert("Success", "Signed in with Google successfully!", [{ text: "OK", onPress: navigateToMainApp }])
      } else {
        console.log("Google sign in failed:", result.error)
        dispatch(signInFailure(result.error))
        Alert.alert("Sign In Failed", result.error)
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      dispatch(signInFailure(error.message))
      Alert.alert("Error", error.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setFacebookLoading(true)
      dispatch(signInStart())

      console.log("Starting Facebook sign in with Firebase...")
      const result = await signInWithFacebook()

      if (result.success) {
        console.log("Facebook sign in successful:", result.data)
        dispatch(signInSuccess(result.data))
        Alert.alert("Success", "Signed in with Facebook successfully!", [{ text: "OK", onPress: navigateToMainApp }])
      } else {
        console.log("Facebook sign in failed:", result.error)
        dispatch(signInFailure(result.error))
        Alert.alert("Sign In Failed", result.error)
      }
    } catch (error) {
      console.error("Facebook sign in error:", error)
      dispatch(signInFailure(error.message))
      Alert.alert("Error", error.message)
    } finally {
      setFacebookLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Estate App account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPasswordText}>Forgot Password? Reset it here</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign In Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#fff" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
              onPress={handleFacebookSignIn}
              disabled={facebookLoading}
            >
              {facebookLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-facebook" size={20} color="#fff" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeIcon: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordText: {
    color: "#3B82F6",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#6B7280",
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  googleButton: {
    backgroundColor: "#DC2626",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signUpLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
})

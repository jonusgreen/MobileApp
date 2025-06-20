"use client"

import { useState } from "react"
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
import { useNavigation } from "@react-navigation/native"
import { useDispatch } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice"
import { apiCall } from "../config/api"
import { signInWithGoogle, signInWithFacebook } from "../config/firebaseAuth"

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert("Error", "Username is required")
      return false
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Email is required")
      return false
    }
    if (!formData.password) {
      Alert.alert("Error", "Password is required")
      return false
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
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
      const res = await apiCall("/auth/signup", "POST", formData)

      if (res.success === false) {
        Alert.alert("Sign Up Failed", res.message)
        return
      }

      Alert.alert("Success", "Account created successfully! Please sign in with your new account.", [
        { text: "OK", onPress: () => navigation.navigate("SignIn") },
      ])
    } catch (error) {
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true)
      dispatch(signInStart())

      console.log("Starting Google sign up with Firebase...")
      const result = await signInWithGoogle()

      if (result.success) {
        console.log("Google sign up successful:", result.data)
        dispatch(signInSuccess(result.data))
        Alert.alert("Success", "Account created with Google successfully!", [
          { text: "OK", onPress: navigateToMainApp },
        ])
      } else {
        console.log("Google sign up failed:", result.error)
        dispatch(signInFailure(result.error))
        Alert.alert("Sign Up Failed", result.error)
      }
    } catch (error) {
      console.error("Google sign up error:", error)
      dispatch(signInFailure(error.message))
      Alert.alert("Error", error.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      setFacebookLoading(true)
      dispatch(signInStart())

      console.log("Starting Facebook sign up with Firebase...")
      const result = await signInWithFacebook()

      if (result.success) {
        console.log("Facebook sign up successful:", result.data)
        dispatch(signInSuccess(result.data))
        Alert.alert("Success", "Account created with Facebook successfully!", [
          { text: "OK", onPress: navigateToMainApp },
        ])
      } else {
        console.log("Facebook sign up failed:", result.error)
        dispatch(signInFailure(result.error))
        Alert.alert("Sign Up Failed", result.error)
      }
    } catch (error) {
      console.error("Facebook sign up error:", error)
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Estate App today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={formData.username}
              onChangeText={(value) => handleChange("username", value)}
              autoCapitalize="none"
              autoComplete="username"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone (Optional)"
              value={formData.phone}
              onChangeText={(value) => handleChange("phone", value)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpButtonText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Up Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignUp}
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
              onPress={handleFacebookSignUp}
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.signInLink}>Sign In</Text>
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
  signUpButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
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
  signInLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
})

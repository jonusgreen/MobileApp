"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector, useDispatch } from "react-redux"
import { apiCall } from "../config/api"
import { signInSuccess } from "../redux/user/userSlice"

export default function CompleteProfileScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)

  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [skipped, setSkipped] = useState(false)

  const handleCompleteProfile = async () => {
    if (!phone.trim()) {
      Alert.alert("Phone Required", "Please enter your phone number to continue.")
      return
    }

    try {
      setLoading(true)

      const response = await apiCall(`/user/update/${currentUser._id}`, {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim() }),
      })

      // Update Redux store with new phone number
      dispatch(signInSuccess({ ...currentUser, phone: phone.trim() }))

      Alert.alert("Success", "Profile completed successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Main") },
      ])
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    Alert.alert(
      "Skip Phone Number?",
      "Adding your phone number helps buyers contact you directly and increases your chances of getting inquiries. Are you sure you want to skip?",
      [
        { text: "Add Phone", style: "cancel" },
        {
          text: "Skip for Now",
          style: "destructive",
          onPress: () => {
            setSkipped(true)
            navigation.navigate("Main")
          },
        },
      ],
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Welcome {currentUser?.username}! 👋{"\n"}
            Let's complete your profile to get the best experience.
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>📞 Why add your phone number?</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Get direct calls from interested buyers</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Faster communication and responses</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Build trust with verified contact info</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Increase your listing inquiries by 3x</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoFocus={true}
            />
          </View>

          <TouchableOpacity
            style={[styles.completeButton, loading && styles.completeButtonDisabled]}
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            <Text style={styles.completeButtonText}>{loading ? "Completing..." : "Complete Profile"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  benefitsCard: {
    backgroundColor: "#F0F9FF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 15,
  },
  benefitItem: {
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1F2937",
  },
  completeButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  skipButton: {
    padding: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#6B7280",
    fontSize: 16,
    textDecorationLine: "underline",
  },
})

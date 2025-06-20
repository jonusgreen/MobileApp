"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { apiCall } from "../config/api"

export default function ChangePasswordScreen({ navigation }) {
  const { colors } = useTheme()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert("Error", "Please enter your current password")
      return false
    }
    if (!formData.newPassword) {
      Alert.alert("Error", "Please enter a new password")
      return false
    }
    if (formData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long")
      return false
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return false
    }
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert("Error", "New password must be different from current password")
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      await apiCall("/user/change-password", "POST", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      Alert.alert("Success", "Your password has been changed successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const styles = createStyles(colors)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Enter your current password and choose a new secure password</Text>

        {/* Current Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              value={formData.currentPassword}
              onChangeText={(value) => handleInputChange("currentPassword", value)}
              secureTextEntry={!showPasswords.current}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => togglePasswordVisibility("current")}>
              <Ionicons name={showPasswords.current ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter new password"
              placeholderTextColor={colors.textSecondary}
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange("newPassword", value)}
              secureTextEntry={!showPasswords.new}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => togglePasswordVisibility("new")}>
              <Ionicons name={showPasswords.new ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange("confirmPassword", value)}
              secureTextEntry={!showPasswords.confirm}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => togglePasswordVisibility("confirm")}>
              <Ionicons name={showPasswords.confirm ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirement}>• At least 6 characters long</Text>
          <Text style={styles.requirement}>• Different from current password</Text>
          <Text style={styles.requirement}>• Should contain letters and numbers</Text>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.changeButton, loading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.changeButtonText}>Change Password</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.card,
    },
    passwordInput: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 15,
    },
    requirementsContainer: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 8,
      marginBottom: 30,
    },
    requirementsTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    requirement: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    changeButton: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
    },
    disabledButton: {
      opacity: 0.6,
    },
    changeButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  })

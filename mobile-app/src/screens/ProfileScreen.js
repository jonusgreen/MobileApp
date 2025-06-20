"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { apiCall } from "../config/api"
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice"
import { API_BASE_URL } from "../config/constants"
import { CommonActions } from "@react-navigation/native"

export default function ProfileScreen({ navigation }) {
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    avatar: currentUser?.avatar || "",
  })
  const [imageLoading, setImageLoading] = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        avatar: currentUser.avatar || "",
      })
    }
  }, [currentUser])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to upload images.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setImageLoading(true)

        try {
          await uploadImageToServer(result.assets[0])
        } catch (error) {
          console.error("Error processing image:", error)
          Alert.alert("Error", "Failed to process image")
        } finally {
          setImageLoading(false)
        }
      }
    } catch (error) {
      setImageLoading(false)
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const uploadImageToServer = async (imageAsset) => {
    try {
      console.log("🖼️ Starting image upload...")
      console.log("Image asset:", imageAsset)
      console.log("API Base URL:", API_BASE_URL)

      // Create FormData for image upload
      const formDataImage = new FormData()

      // Get file extension from URI
      const uriParts = imageAsset.uri.split(".")
      const fileType = uriParts[uriParts.length - 1]

      formDataImage.append("image", {
        uri: imageAsset.uri,
        type: `image/${fileType}`,
        name: `profile_${Date.now()}.${fileType}`,
      })

      const uploadUrl = `${API_BASE_URL}/upload`
      console.log("📤 Uploading to:", uploadUrl)

      // Upload using fetch directly (not apiCall to avoid JSON parsing issues)
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formDataImage,
        headers: {
          "Content-Type": "multipart/form-data",
          // Add authorization header if available
          ...(currentUser?.token && { Authorization: `Bearer ${currentUser.token}` }),
        },
      })

      console.log("📊 Upload response status:", uploadResponse.status)

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        console.log("✅ Upload successful:", uploadResult)

        // Extract image URL from response (check multiple possible fields)
        const imageUrl =
          uploadResult.url ||
          uploadResult.imageUrl ||
          uploadResult.downloadURL ||
          uploadResult.data?.url ||
          uploadResult.secure_url

        if (imageUrl) {
          // Update form data with the uploaded image URL
          setFormData((prev) => ({
            ...prev,
            avatar: imageUrl,
          }))

          Alert.alert("Success", "Profile picture uploaded successfully!")
        } else {
          console.error("No image URL in response:", uploadResult)
          throw new Error("No image URL returned from server")
        }
      } else {
        const errorText = await uploadResponse.text()
        console.error("❌ Upload failed:", uploadResponse.status, errorText)
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }
    } catch (error) {
      console.error("❌ Upload error:", error)

      // Use a fallback approach - generate avatar based on username
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        formData.username || currentUser?.username || "User",
      )}&size=200&background=3B82F6&color=fff&rounded=true&format=png&t=${Date.now()}`

      setFormData((prev) => ({
        ...prev,
        avatar: fallbackUrl,
      }))

      Alert.alert("Upload Info", "Using generated avatar. Image upload will be available when server is configured.")
    }
  }

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === "") {
      return true // Phone is optional
    }

    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/[\s\-$$$$+]/g, "")

    // Support various international formats:
    // Uganda: +256786836338, 256786836338, 0786836338
    // South Africa: +27786836338, 27786836338, 0786836338
    // Kenya: +254786836338, +254786836338, 0786836338
    // General: 10-15 digits

    // Check if it's a valid phone number (10-15 digits)
    if (!/^[0-9]{10,15}$/.test(cleanPhone)) {
      return false
    }

    // Specific validations for known formats
    if (cleanPhone.startsWith("256")) {
      // Uganda: 256 + 9 digits
      return cleanPhone.length === 12
    } else if (cleanPhone.startsWith("27")) {
      // South Africa: 27 + 9 digits
      return cleanPhone.length === 11
    } else if (cleanPhone.startsWith("254")) {
      // Kenya: 254 + 9 digits
      return cleanPhone.length === 12
    } else if (cleanPhone.startsWith("0")) {
      // Local format: 0 + 9 digits
      return cleanPhone.length === 10
    }

    // For other international numbers, accept 10-15 digits
    return cleanPhone.length >= 10 && cleanPhone.length <= 15
  }

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.username.trim()) {
        Alert.alert("Validation Error", "Username is required")
        return
      }

      if (!formData.email.trim()) {
        Alert.alert("Validation Error", "Email is required")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        Alert.alert("Validation Error", "Please enter a valid email address")
        return
      }

      // Phone validation (if provided)
      if (formData.phone && formData.phone.trim() && !validatePhoneNumber(formData.phone)) {
        Alert.alert(
          "Validation Error",
          "Please enter a valid phone number:\n• Uganda: +256786836338\n• South Africa: +27786836338\n• Local: 0786836338",
        )
        return
      }

      dispatch(updateUserStart())

      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        avatar: formData.avatar,
      }

      console.log("Updating user profile:", updateData)

      // Use the old API call pattern that works
      const response = await apiCall(`/user/update/${currentUser._id}`, "POST", updateData)

      console.log("Profile update response:", response)

      dispatch(updateUserSuccess(response))
      setIsEditing(false)
      Alert.alert("Success", "Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      dispatch(updateUserFailure(error.message))

      // More specific error handling
      if (error.message.includes("JSON Parse error")) {
        Alert.alert("Error", "Server error. Please try again later.")
      } else if (error.message.includes("Authentication failed")) {
        Alert.alert("Error", "Please sign in again to update your profile.")
        navigation.navigate("SignIn")
      } else {
        Alert.alert("Error", error.message || "Failed to update profile")
      }
    }
  }

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      avatar: currentUser?.avatar || "",
    })
    setIsEditing(false)
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setSignOutLoading(true)
            console.log("🚪 Starting sign out process...")

            // Dispatch sign out start
            dispatch(signOutUserStart())

            // Try to call sign out API (optional - works even if it fails)
            try {
              await apiCall("/auth/signout", "POST")
              console.log("✅ Server sign out successful")
            } catch (apiError) {
              console.log("⚠️ Server sign out failed, but continuing with local sign out:", apiError.message)
            }

            // Clear Redux state
            dispatch(signOutUserSuccess())

            // Reset navigation stack completely and go to SignIn
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              }),
            )

            console.log("✅ Sign out completed successfully")
          } catch (error) {
            console.error("❌ Sign out error:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          } finally {
            setSignOutLoading(false)
          }
        },
      },
    ])
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiCall(`/user/delete/${currentUser._id}`, "DELETE")
            dispatch(signOutUserSuccess())
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              }),
            )
            Alert.alert("Account Deleted", "Your account has been deleted successfully.")
          } catch (error) {
            console.error("Delete account error:", error)
            Alert.alert("Error", "Failed to delete account")
          }
        },
      },
    ])
  }

  const isOAuthUser =
    currentUser?.email &&
    (currentUser.email.includes("google") ||
      currentUser.email.includes("facebook") ||
      currentUser.provider === "google" ||
      currentUser.provider === "facebook")

  const getAvatarSource = () => {
    // Priority: formData.avatar > currentUser.avatar > default placeholder
    const avatarUrl = formData.avatar || currentUser?.avatar

    if (avatarUrl && avatarUrl.startsWith("http")) {
      return { uri: avatarUrl }
    }

    // Use the same default as web app
    return {
      uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    }
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Please sign in to view your profile</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={getAvatarSource()}
            style={styles.avatar}
            onError={(error) => {
              console.log("Avatar load error:", error)
              // Fallback to default image on error
              setFormData((prev) => ({
                ...prev,
                avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
              }))
            }}
          />
          {isEditing && (
            <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker} disabled={imageLoading}>
              {imageLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username}>{currentUser.username}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
          <Text style={styles.userId}>ID: {currentUser._id}</Text>
          {isOAuthUser && (
            <View style={styles.oauthBadge}>
              <Ionicons name="logo-google" size={16} color="#4285F4" />
              <Text style={styles.oauthText}>OAuth Account</Text>
            </View>
          )}
        </View>
      </View>

      {/* Phone Number Prompt for OAuth Users */}
      {isOAuthUser && !currentUser.phone && !isEditing && (
        <View style={styles.phonePrompt}>
          <Ionicons name="information-circle" size={24} color="#F59E0B" />
          <Text style={styles.phonePromptText}>Add your phone number to complete your profile</Text>
          <TouchableOpacity style={styles.addPhoneButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.addPhoneButtonText}>Add Phone</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Ionicons name="pencil" size={20} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleInputChange("username", text)}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{formData.username || "Not set"}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          {isEditing && !isOAuthUser ? (
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <View>
              <Text style={[styles.value, isOAuthUser && styles.disabledValue]}>{formData.email || "Not set"}</Text>
              {isOAuthUser && <Text style={styles.hint}>Email cannot be changed for OAuth accounts</Text>}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          {isEditing ? (
            <View>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                placeholder="e.g., +256786836338, +27786836338, 0786836338"
                keyboardType="phone-pad"
              />
              <Text style={styles.phoneHint}>
                📱 Formats: +256786836338 (Uganda), +27786836338 (SA), 0786836338 (Local)
              </Text>
            </View>
          ) : (
            <Text style={styles.value}>{formData.phone || "Not set"}</Text>
          )}
          {isOAuthUser && !formData.phone && (
            <Text style={styles.hint}>📞 Add your phone number for better account security and contact options</Text>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.signOutButton, signOutLoading && styles.disabledButton]}
          onPress={handleSignOut}
          disabled={signOutLoading}
        >
          {signOutLoading ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          )}
          <Text style={styles.signOutButtonText}>{signOutLoading ? "Signing Out..." : "Sign Out"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userInfo: {
    alignItems: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  oauthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  oauthText: {
    fontSize: 12,
    color: "#1E40AF",
    marginLeft: 4,
  },
  phonePrompt: {
    backgroundColor: "#FEF3C7",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  phonePromptText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    marginLeft: 12,
  },
  addPhoneButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addPhoneButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  editButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  value: {
    fontSize: 16,
    color: "#111827",
    paddingVertical: 8,
  },
  disabledValue: {
    color: "#9CA3AF",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  phoneHint: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 4,
    fontStyle: "italic",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  actionsContainer: {
    margin: 16,
    gap: 12,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  signOutButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  signInButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
})

"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { apiCall } from "../config/api"

export default function EditListingScreen({ route, navigation }) {
  const { currentUser } = useSelector((state) => state.user)
  const { listing } = route.params

  const [formData, setFormData] = useState({
    name: listing.name || "",
    description: listing.description || "",
    address: listing.address || "",
    type: listing.type || "rent",
    bedrooms: listing.bedrooms || 1,
    bathrooms: listing.bathrooms || 1,
    regularPrice: listing.regularPrice || 0,
    discountPrice: listing.discountPrice || 0,
    offer: listing.offer || false,
    parking: listing.parking || false,
    furnished: listing.furnished || false,
    imageUrls: listing.imageUrls || [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [imageUris, setImageUris] = useState(listing.imageUrls || [])
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      })

      if (!result.canceled) {
        // Add the selected image URI to the state
        setImageUris([...imageUris, result.assets[0].uri])
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleRemoveImage = (index) => {
    const newImageUris = [...imageUris]
    newImageUris.splice(index, 1)
    setImageUris(newImageUris)
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to update a listing")
      return
    }

    if (formData.name.length < 5 || formData.name.length > 50) {
      Alert.alert("Error", "Name must be between 5 and 50 characters")
      return
    }

    if (formData.description.length < 10 || formData.description.length > 1000) {
      Alert.alert("Error", "Description must be between 10 and 1000 characters")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // For now, we'll use the existing image URLs or placeholder images
      const finalImageUrls =
        imageUris.length > 0
          ? imageUris
          : [
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000",
              "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000",
            ]

      // Prepare the data for the API
      const listingData = {
        ...formData,
        imageUrls: finalImageUrls,
      }

      console.log("🔄 Updating listing with ID:", listing._id)
      console.log("📦 Update data:", JSON.stringify(listingData))

      // Use apiCall instead of direct fetch
      const data = await apiCall(`/listing/update/${listing._id}`, {
        method: "POST", // Changed to POST as that's what the server expects
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: listingData,
      })

      console.log("✅ Update response:", data)

      setSuccess("Listing updated successfully!")
      // Navigate back to the MyListings screen after a short delay
      setTimeout(() => {
        navigation.navigate("MyListings", { refresh: true })
      }, 1500)
    } catch (error) {
      console.error("❌ Error updating listing:", error)
      setError(error.message || "An error occurred while updating the listing")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              setError(null)

              console.log("🗑️ Deleting listing with ID:", listing._id)

              // Use apiCall instead of direct fetch
              await apiCall(`/listing/delete/${listing._id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${currentUser.token}`,
                },
              })

              console.log("✅ Listing deleted successfully")
              Alert.alert("Success", "Listing deleted successfully")
              navigation.navigate("MyListings", { refresh: true })
            } catch (error) {
              console.error("❌ Error deleting listing:", error)
              setError(error.message || "An error occurred while deleting the listing")
            } finally {
              setLoading(false)
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Property Title"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Property Description"
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Property Address"
            value={formData.address}
            onChangeText={(text) => handleChange("address", text)}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Bedrooms</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={String(formData.bedrooms)}
              onChangeText={(text) => handleChange("bedrooms", Number.parseInt(text) || 1)}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Bathrooms</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={String(formData.bathrooms)}
              onChangeText={(text) => handleChange("bathrooms", Number.parseInt(text) || 1)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Regular Price</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={String(formData.regularPrice)}
              onChangeText={(text) => handleChange("regularPrice", Number.parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Discount Price</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={String(formData.discountPrice)}
              onChangeText={(text) => handleChange("discountPrice", Number.parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === "rent" && styles.typeButtonActive]}
              onPress={() => handleChange("type", "rent")}
            >
              <Text style={[styles.typeButtonText, formData.type === "rent" && styles.typeButtonTextActive]}>Rent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === "sale" && styles.typeButtonActive]}
              onPress={() => handleChange("type", "sale")}
            >
              <Text style={[styles.typeButtonText, formData.type === "sale" && styles.typeButtonTextActive]}>Sale</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Features</Text>
          <View style={styles.featuresContainer}>
            <TouchableOpacity style={styles.featureButton} onPress={() => handleChange("offer", !formData.offer)}>
              <Ionicons
                name={formData.offer ? "checkbox" : "square-outline"}
                size={24}
                color={formData.offer ? "#3B82F6" : "#9CA3AF"}
              />
              <Text style={styles.featureButtonText}>Offer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureButton} onPress={() => handleChange("parking", !formData.parking)}>
              <Ionicons
                name={formData.parking ? "checkbox" : "square-outline"}
                size={24}
                color={formData.parking ? "#3B82F6" : "#9CA3AF"}
              />
              <Text style={styles.featureButtonText}>Parking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => handleChange("furnished", !formData.furnished)}
            >
              <Ionicons
                name={formData.furnished ? "checkbox" : "square-outline"}
                size={24}
                color={formData.furnished ? "#3B82F6" : "#9CA3AF"}
              />
              <Text style={styles.featureButtonText}>Furnished</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Images</Text>
          <Text style={styles.imageNote}>
            Note: Images will be replaced with placeholder images for now. Image upload will be implemented in a future
            update.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                  <Ionicons name="close-circle" size={24} color="#FF4D4F" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
              <Ionicons name="add" size={40} color="#3B82F6" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Listing</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
            <Text style={styles.deleteButtonText}>Delete Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    overflow: "hidden",
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  featureButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
  },
  imageNote: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    fontStyle: "italic",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  imagePreviewWrapper: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  updateButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  successText: {
    color: "#065F46",
    fontSize: 14,
  },
})

"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useSelector } from "react-redux"
import { apiCall } from "../config/api"

export default function CreateListingScreen({ navigation }) {
  const { currentUser } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [imageUris, setImageUris] = useState([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    regularPrice: "",
    discountPrice: "",
    bathrooms: 1,
    bedrooms: 1,
    furnished: false,
    parking: false,
    type: "rent",
    offer: false,
    currency: "UGX",
  })

  useEffect(() => {
    ;(async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission needed", "Sorry, we need camera roll permissions to make this work!")
      }
    })()
  }, [])

  const handleInputChange = (field, value) => {
    if (field === "bedrooms" || field === "bathrooms") {
      const numValue = Number.parseInt(value) || 1
      setFormData((prev) => ({ ...prev, [field]: Math.max(1, numValue) }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const incrementValue = (field) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }))
  }

  const decrementValue = (field) => {
    setFormData((prev) => ({ ...prev, [field]: Math.max(1, prev[field] - 1) }))
  }

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      })

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((asset) => asset.uri)
        setImageUris((prev) => [...prev, ...newUris].slice(0, 6)) // Max 6 images
      }
    } catch (error) {
      console.error("Error picking images:", error)
      Alert.alert("Error", "Failed to pick images")
    }
  }

  const removeImage = (index) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        Alert.alert("Error", "Please enter a property name")
        return
      }
      if (!formData.address.trim()) {
        Alert.alert("Error", "Please enter an address")
        return
      }
      if (!formData.regularPrice || formData.regularPrice <= 0) {
        Alert.alert("Error", "Please enter a valid regular price")
        return
      }
      if (formData.offer && (!formData.discountPrice || formData.discountPrice <= 0)) {
        Alert.alert("Error", "Please enter a valid discount price")
        return
      }
      if (formData.offer && formData.discountPrice >= formData.regularPrice) {
        Alert.alert("Error", "Discount price must be lower than regular price")
        return
      }
      if (imageUris.length === 0) {
        Alert.alert("Error", "Please add at least one image")
        return
      }

      setLoading(true)

      // Use consistent, reliable placeholder images
      const imageUrls = imageUris.map(
        (_, index) => `https://source.unsplash.com/random/800x600?house,property&sig=${Date.now()}-${index}`,
      )

      const listingData = {
        ...formData,
        regularPrice: Number(formData.regularPrice),
        discountPrice: formData.offer ? Number(formData.discountPrice) : 0,
        imageUrls: imageUrls,
        userRef: currentUser._id,
      }

      const response = await apiCall("/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(listingData),
      })

      if (response && response.success) {
        Alert.alert(
          "Success!",
          `Listing "${formData.name}" created successfully!\n\nStatus: ${response.listing?.approved ? "Approved" : "Pending Approval"}\nID: ${response.listing?._id}`,
          [
            {
              text: "View My Listings",
              onPress: () => navigation.navigate("MyListings"),
            },
            {
              text: "Create Another",
              onPress: () => {
                // Reset form
                setFormData({
                  name: "",
                  description: "",
                  address: "",
                  regularPrice: "",
                  discountPrice: "",
                  bathrooms: 1,
                  bedrooms: 1,
                  furnished: false,
                  parking: false,
                  type: "rent",
                  offer: false,
                  currency: "UGX",
                })
                setImageUris([])
              },
            },
          ],
        )
      } else {
        console.log("❌ Unexpected response format:", response)
        Alert.alert("Warning", "Listing may have been created but response was unexpected. Check your listings.")
      }
    } catch (error) {
      console.error("❌ Error creating listing:", error)
      Alert.alert("Error", error.message || "Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Listing</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Property Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
          placeholder="Enter property name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => handleInputChange("description", value)}
          placeholder="Enter property description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(value) => handleInputChange("address", value)}
          placeholder="Enter property address"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.checkboxGroup}>
          <TouchableOpacity
            style={[styles.checkbox, formData.parking && styles.checkboxActive]}
            onPress={() => handleInputChange("parking", !formData.parking)}
          >
            <Text style={[styles.checkboxText, formData.parking && styles.checkboxTextActive]}>🅿️ Parking</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxGroup}>
          <TouchableOpacity
            style={[styles.checkbox, formData.furnished && styles.checkboxActive]}
            onPress={() => handleInputChange("furnished", !formData.furnished)}
          >
            <Text style={[styles.checkboxText, formData.furnished && styles.checkboxTextActive]}>🛋️ Furnished</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Property Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, formData.type === "rent" && styles.typeButtonActive]}
            onPress={() => handleInputChange("type", "rent")}
          >
            <Text style={[styles.typeText, formData.type === "rent" && styles.typeTextActive]}>For Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, formData.type === "sale" && styles.typeButtonActive]}
            onPress={() => handleInputChange("type", "sale")}
          >
            <Text style={[styles.typeText, formData.type === "sale" && styles.typeTextActive]}>For Sale</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Currency</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, formData.currency === "UGX" && styles.typeButtonActive]}
            onPress={() => handleInputChange("currency", "UGX")}
          >
            <Text style={[styles.typeText, formData.currency === "UGX" && styles.typeTextActive]}>UGX</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, formData.currency === "USD" && styles.typeButtonActive]}
            onPress={() => handleInputChange("currency", "USD")}
          >
            <Text style={[styles.typeText, formData.currency === "USD" && styles.typeTextActive]}>USD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.counterGroup}>
          <Text style={styles.label}>Bedrooms</Text>
          <View style={styles.counter}>
            <TouchableOpacity style={styles.counterButton} onPress={() => decrementValue("bedrooms")}>
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.counterInput}
              value={String(formData.bedrooms)}
              onChangeText={(value) => handleInputChange("bedrooms", value)}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.counterButton} onPress={() => incrementValue("bedrooms")}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.counterGroup}>
          <Text style={styles.label}>Bathrooms</Text>
          <View style={styles.counter}>
            <TouchableOpacity style={styles.counterButton} onPress={() => decrementValue("bathrooms")}>
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.counterInput}
              value={String(formData.bathrooms)}
              onChangeText={(value) => handleInputChange("bathrooms", value)}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.counterButton} onPress={() => incrementValue("bathrooms")}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Regular Price * ({formData.currency} {formData.type === "rent" ? "/month" : ""})
        </Text>
        <TextInput
          style={styles.input}
          value={formData.regularPrice}
          onChangeText={(value) => handleInputChange("regularPrice", value)}
          placeholder="Enter regular price"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.checkboxGroup}>
        <TouchableOpacity
          style={[styles.checkbox, formData.offer && styles.checkboxActive]}
          onPress={() => handleInputChange("offer", !formData.offer)}
        >
          <Text style={[styles.checkboxText, formData.offer && styles.checkboxTextActive]}>💰 Special Offer</Text>
        </TouchableOpacity>
      </View>

      {formData.offer && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Discount Price * ({formData.currency} {formData.type === "rent" ? "/month" : ""})
          </Text>
          <TextInput
            style={styles.input}
            value={formData.discountPrice}
            onChangeText={(value) => handleInputChange("discountPrice", value)}
            placeholder="Enter discount price"
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Images * (Max 6)</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
          <Text style={styles.imageButtonText}>📷 Choose Images</Text>
        </TouchableOpacity>

        {imageUris.length > 0 && (
          <View style={styles.imagePreview}>
            <Text style={styles.imageCount}>Selected: {imageUris.length}/6</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {imageUris.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverText}>Cover</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.submitButtonText}>Creating...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Create Listing</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  infoBox: {
    backgroundColor: "#E1F5FE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#039BE5",
  },
  infoText: {
    color: "#01579B",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  checkboxGroup: {
    flex: 1,
    marginRight: 10,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
  checkboxTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    marginHorizontal: 2,
  },
  typeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeText: {
    fontSize: 16,
    color: "#333",
  },
  typeTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  counterGroup: {
    flex: 1,
    marginRight: 10,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  counterButton: {
    width: 40,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  counterInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    height: 50,
  },
  imageButton: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9ff",
  },
  imageButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    marginTop: 15,
  },
  imageCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  coverBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "#007AFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomPadding: {
    height: 40,
  },
})

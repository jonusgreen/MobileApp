"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { apiCall } from "../config/api"
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Linking, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export default function ListingCard({
  listing,
  onPress,
  onEdit,
  onDelete,
  onStatusUpdate,
  showActions = false,
  isOwner = false,
}) {
  const { currentUser } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(listing.userInteractions?.liked || false)
  const [likes, setLikes] = useState(listing.likes || 0)

  // Get the status color
  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "#EF4444" // Red
      case "reserved":
        return "#F59E0B" // Amber
      case "pending":
        return "#3B82F6" // Blue
      case "available":
      default:
        return "#10B981" // Green
    }
  }

  // Get the status text
  const getStatusText = (status) => {
    switch (status) {
      case "taken":
        return "TAKEN"
      case "reserved":
        return "RESERVED"
      case "pending":
        return "PENDING"
      case "available":
      default:
        return "AVAILABLE"
    }
  }

  const formatPrice = (listing) => {
    const currency = listing.currency || "UGX"
    const price = listing.regularPrice?.toLocaleString() || "0"
    const type = listing.type === "rent" ? "/month" : ""
    return `${currency} ${price}${type}`
  }

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert("Join ", "Sign up to like properties and save your favorites!", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Up",
          onPress: () => {
            // Navigate to sign up screen
            // You'll need to pass navigation prop or use navigation context
            console.log("Navigate to sign up")
          },
        },
      ])
      return
    }

    try {
      setLoading(true)
      const response = await apiCall(`/listing/like/${listing._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })

      setIsLiked(response.liked)
      setLikes(response.likes)
    } catch (error) {
      console.error("Error liking listing:", error)
      Alert.alert("Error", "Failed to like listing")
    } finally {
      setLoading(false)
    }
  }

  const getOwnerContact = async () => {
    try {
      const response = await apiCall(`/listing/contact/${listing._id}`, {
        method: "GET",
        headers: currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      })
      return response
    } catch (error) {
      console.error("Error getting owner contact:", error)
      return null
    }
  }

  const handleCall = async () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to contact property owners")
      return
    }

    try {
      setLoading(true)
      const contactInfo = await getOwnerContact()

      if (contactInfo && contactInfo.phone) {
        // Track the call attempt
        await apiCall(`/listing/inquire/${listing._id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${currentUser.token}` },
          body: JSON.stringify({
            type: "call",
            message: `User attempted to call about: ${listing.name}`,
          }),
        })

        // Open phone dialer
        const phoneUrl = `tel:${contactInfo.phone}`
        const canOpen = await Linking.canOpenURL(phoneUrl)

        if (canOpen) {
          await Linking.openURL(phoneUrl)
        } else {
          Alert.alert("Error", "Unable to open phone dialer")
        }
      } else {
        Alert.alert(
          "Phone Not Available",
          "Owner's phone number is not available. Would you like to send an email instead?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Send Email", onPress: handleEmail },
          ],
        )
      }
    } catch (error) {
      console.error("Error initiating call:", error)
      Alert.alert("Error", "Failed to get contact information")
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to contact property owners")
      return
    }

    try {
      setLoading(true)
      const contactInfo = await getOwnerContact()

      if (contactInfo && contactInfo.email) {
        // Track the email attempt
        await apiCall(`/listing/inquire/${listing._id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${currentUser.token}` },
          body: JSON.stringify({
            type: "email",
            message: `User sent email inquiry about: ${listing.name}`,
          }),
        })

        // Prepare email content
        const subject = encodeURIComponent(`Inquiry about: ${listing.name}`)
        const body = encodeURIComponent(
          `Hi,\n\nI'm interested in your property listing:\n\n📍 ${listing.name}\n🏠 ${listing.address}\n💰 ${formatPrice(listing)}\n🛏️ ${listing.bedrooms} bedrooms\n🚿 ${listing.bathrooms} bathrooms\n\nPlease contact me with more information.\n\nBest regards,\n${currentUser.username || currentUser.email}`,
        )

        // Open email client
        const emailUrl = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`
        const canOpen = await Linking.canOpenURL(emailUrl)

        if (canOpen) {
          await Linking.openURL(emailUrl)
        } else {
          Alert.alert("Error", "Unable to open email client")
        }
      } else {
        Alert.alert("Email Not Available", "Owner's email address is not available.")
      }
    } catch (error) {
      console.error("Error initiating email:", error)
      Alert.alert("Error", "Failed to get contact information")
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to contact property owners")
      return
    }

    Alert.alert("Contact Owner", `How would you like to contact the owner about "${listing.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "📞 Call Owner",
        onPress: handleCall,
      },
      {
        text: "📧 Send Email",
        onPress: handleEmail,
      },
    ])
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {listing.imageUrls && listing.imageUrls[0] ? (
          <Image source={{ uri: listing.imageUrls[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Ionicons name="image-outline" size={30} color="#ccc" />
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}

        {/* Status Badge - More Prominent */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
          <Text style={styles.statusText}>{getStatusText(listing.status)}</Text>
        </View>

        {/* Property Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{listing.type === "rent" ? "FOR RENT" : "FOR SALE"}</Text>
        </View>

        {/* Featured Badge */}
        {listing.offer && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}

        {/* Price Overlay */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceText}>{formatPrice(listing)}</Text>
          {listing.offer && listing.discountPrice && (
            <Text style={styles.originalPrice}>
              {listing.currency} {listing.discountPrice.toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.name}
          </Text>
          {listing.furnished && (
            <View style={styles.furnishedTag}>
              <Text style={styles.furnishedText}>FURNISHED</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#007AFF" />
          <Text style={styles.address} numberOfLines={1}>
            {listing.address}
          </Text>
        </View>

        {/* Clear Property Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="bed-outline" size={16} color="#007AFF" />
              </View>
              <Text style={styles.detailText}>
                {listing.bedrooms} Bedroom{listing.bedrooms !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="water-outline" size={16} color="#007AFF" />
              </View>
              <Text style={styles.detailText}>
                {listing.bathrooms} Bathroom{listing.bathrooms !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Additional Features */}
          <View style={styles.featuresRow}>
            {listing.parking && (
              <View style={styles.featureTag}>
                <Ionicons name="car-outline" size={12} color="#10B981" />
                <Text style={styles.featureTagText}>Parking</Text>
              </View>
            )}
            {listing.furnished && (
              <View style={styles.featureTag}>
                <Ionicons name="home-outline" size={12} color="#10B981" />
                <Text style={styles.featureTagText}>Furnished</Text>
              </View>
            )}
          </View>
        </View>

        {/* Property Stats with Like and Contact */}
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>Property Stats</Text>
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Ionicons name="eye-outline" size={14} color="#10B981" />
              <Text style={styles.metricText}>{listing.views || 0} views</Text>
            </View>

            <TouchableOpacity
              style={[styles.likeButton, isLiked && styles.likeButtonActive]}
              onPress={handleLike}
              disabled={loading}
            >
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={14} color={isLiked ? "#EF4444" : "#6B7280"} />
              <Text style={[styles.metricText, isLiked && styles.likedText]}>
                {likes} {likes === 1 ? "like" : "likes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
              <Ionicons name="call-outline" size={14} color="#3B82F6" />
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons for Owners */}
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onStatusUpdate && (
              <TouchableOpacity style={[styles.actionButton, styles.statusButton]} onPress={onStatusUpdate}>
                <Ionicons name="flag-outline" size={16} color="#fff" />
                <Text style={styles.actionText}>Status</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  typeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredBadge: {
    position: "absolute",
    top: 60,
    right: 12,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
    marginLeft: 3,
  },
  priceOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  priceText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  originalPrice: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "line-through",
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  furnishedTag: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  furnishedText: {
    color: "#065F46",
    fontSize: 10,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EBF8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  featuresRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  featureTagText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#065F46",
    fontWeight: "500",
  },
  metricsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metricText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  contactText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#3B82F6",
  },
  statusButton: {
    backgroundColor: "#F59E0B",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
  },
  likeButtonActive: {
    backgroundColor: "#FEF2F2",
  },
  likedText: {
    color: "#EF4444",
  },
})

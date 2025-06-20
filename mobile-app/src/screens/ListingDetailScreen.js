"use client"

import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import { apiCall } from "../config/api"

export default function ListingDetailScreen({ route }) {
  const navigation = useNavigation()
  const { listing } = route.params
  const { currentUser } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(listing.userInteractions?.liked || false)
  const [isSaved, setIsSaved] = useState(listing.userInteractions?.saved || false)
  const [likes, setLikes] = useState(listing.likes || 0)
  const [saves, setSaves] = useState(listing.saves || 0)

  useEffect(() => {
    // Track view when screen loads
    trackView()
  }, [])

  const trackView = async () => {
    try {
      // Always track view when screen loads
      const response = await apiCall(`/listing/view/${listing._id}`, {
        method: "POST",
        headers: currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {},
      })
      console.log("View tracking response:", response)
    } catch (error) {
      console.error("Error tracking view:", error)
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
          `Hi ${contactInfo.name || "there"},\n\nI'm interested in your property listing:\n\n📍 ${listing.name}\n🏠 ${listing.address}\n💰 $${listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}${listing.type === "rent" ? " / month" : ""}\n🛏️ ${listing.bedrooms} bedrooms\n🚿 ${listing.bathrooms} bathrooms\n\nProperty Details:\n${listing.description}\n\nPlease contact me with more information or to schedule a viewing.\n\nBest regards,\n${currentUser.username || currentUser.email}`,
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

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to like listings")
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

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert("Sign In Required", "Please sign in to save listings")
      return
    }

    try {
      setLoading(true)
      const response = await apiCall(`/listing/save/${listing._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })

      setIsSaved(response.saved)
      setSaves(response.saves)
    } catch (error) {
      console.error("Error saving listing:", error)
      Alert.alert("Error", "Failed to save listing")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const listingUrl = `https://yourapp.com/listing/${listing._id}`

    Alert.alert("Share Listing", "How would you like to share this property?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "📋 Copy Link",
        onPress: () => {
          Alert.alert("Link Ready", `${listingUrl}\n\nLink copied! Share this URL to let others view this property.`, [
            { text: "OK" },
            {
              text: "Open Link",
              onPress: () => Linking.openURL(listingUrl),
            },
          ])
        },
      },
      {
        text: "📧 Email",
        onPress: () => {
          const subject = encodeURIComponent(`Check out this property: ${listing.name}`)
          const body = encodeURIComponent(
            `I found this great property and thought you might be interested!\n\n🏠 ${listing.name}\n📍 ${listing.address}\n💰 $${listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}${listing.type === "rent" ? " / month" : ""}\n🛏️ ${listing.bedrooms} bedrooms, 🚿 ${listing.bathrooms} bathrooms\n\n${listing.description}\n\nView full details: ${listingUrl}`,
          )
          Linking.openURL(`mailto:?subject=${subject}&body=${body}`)
        },
      },
      {
        text: "💬 SMS",
        onPress: () => {
          const message = encodeURIComponent(
            `Check out this property: ${listing.name} at ${listing.address}. $${listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}${listing.type === "rent" ? "/month" : ""}. View details: ${listingUrl}`,
          )
          Linking.openURL(`sms:?body=${message}`)
        },
      },
      {
        text: "📱 More Options",
        onPress: () => {
          Alert.alert("Share via Social Media", "Choose your platform:", [
            { text: "Cancel", style: "cancel" },
            {
              text: "WhatsApp",
              onPress: () => {
                const message = encodeURIComponent(
                  `🏠 *${listing.name}*\n📍 ${listing.address}\n💰 $${listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}${listing.type === "rent" ? " / month" : ""}\n\n${listing.description}\n\nView full details: ${listingUrl}`,
                )
                Linking.openURL(`whatsapp://send?text=${message}`)
              },
            },
            {
              text: "Facebook",
              onPress: () => {
                Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}`)
              },
            },
            {
              text: "Twitter",
              onPress: () => {
                const tweet = encodeURIComponent(
                  `Check out this property: ${listing.name} - $${listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}${listing.type === "rent" ? "/month" : ""} ${listingUrl}`,
                )
                Linking.openURL(`https://twitter.com/intent/tweet?text=${tweet}`)
              },
            },
          ])
        },
      },
    ])
  }

  const handleContactOwner = () => {
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
      {
        text: "💬 Send Message",
        onPress: async () => {
          try {
            setLoading(true)
            await apiCall(`/listing/inquire/${listing._id}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${currentUser.token}` },
              body: JSON.stringify({
                type: "message",
                message: `I'm interested in this property: ${listing.name}. Please contact me with more details.`,
              }),
            })
            Alert.alert("Message Sent!", "Your inquiry has been sent to the property owner.")
          } catch (error) {
            console.error("Error sending message:", error)
            Alert.alert("Error", "Failed to send message")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  // Get status color and label
  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "#EF4444" // red
      case "reserved":
        return "#F59E0B" // amber
      case "pending":
        return "#3B82F6" // blue
      default:
        return "#10B981" // green for available
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "taken":
        return "TAKEN"
      case "reserved":
        return "RESERVED"
      case "pending":
        return "PENDING"
      default:
        return "AVAILABLE"
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
          {currentUser && (
            <>
              <TouchableOpacity
                style={[styles.headerActionButton, isLiked && styles.headerActionButtonActive]}
                onPress={handleLike}
                disabled={loading}
              >
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#EF4444" : "#fff"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerActionButton, isSaved && styles.headerActionButtonActive]}
                onPress={handleSave}
                disabled={loading}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={isSaved ? "#3B82F6" : "#fff"}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Images */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
        {listing.imageUrls.map((url, index) => (
          <Image key={index} source={{ uri: url }} style={styles.image} />
        ))}
      </ScrollView>

      {/* Status Badge */}
      {listing.status && (
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusLabel(listing.status)}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{listing.name}</Text>
        <Text style={styles.address}>{listing.address}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${listing.regularPrice?.toLocaleString()}
            {listing.type === "rent" && "/month"}
          </Text>
          <Text style={styles.type}>{listing.type}</Text>
        </View>

        {listing.offer && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>${listing.discountPrice?.toLocaleString()} - Special Offer!</Text>
          </View>
        )}

        <Text style={styles.description}>{listing.description}</Text>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={24} color="#3B82F6" />
              <Text style={styles.featureNumber}>{listing.bedrooms}</Text>
              <Text style={styles.featureLabel}>Bedrooms</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="water-outline" size={24} color="#3B82F6" />
              <Text style={styles.featureNumber}>{listing.bathrooms}</Text>
              <Text style={styles.featureLabel}>Bathrooms</Text>
            </View>
          </View>

          <View style={styles.amenities}>
            {listing.parking && (
              <View style={styles.amenity}>
                <Ionicons name="car-outline" size={20} color="#059669" />
                <Text style={styles.amenityText}>Parking Available</Text>
              </View>
            )}
            {listing.furnished && (
              <View style={styles.amenity}>
                <Ionicons name="home-outline" size={20} color="#059669" />
                <Text style={styles.amenityText}>Furnished</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={20} color="#EF4444" />
            <Text style={styles.statText}>{likes} likes</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="bookmark" size={20} color="#3B82F6" />
            <Text style={styles.statText}>{saves} saves</Text>
          </View>
        </View>
      </View>

      {/* Contact Button - Fixed at bottom */}
      {listing.status !== "taken" && (
        <View style={styles.contactSection}>
          <TouchableOpacity
            style={[styles.contactButton, loading && styles.contactButtonDisabled]}
            onPress={handleContactOwner}
            disabled={loading}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>{loading ? "Loading..." : "Contact Owner"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Property Unavailable Notice */}
      {listing.status === "taken" && (
        <View style={styles.takenNotice}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.takenNoticeText}>
            This property is no longer available. It has been marked as taken by the owner.
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerActionButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  headerActionButtonActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  imageContainer: {
    height: 300,
  },
  image: {
    width: 400,
    height: 300,
  },
  statusBadge: {
    position: "absolute",
    top: 260,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  statusBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#059669",
  },
  type: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "capitalize",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerBadge: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offerText: {
    color: "#92400E",
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  features: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 32,
  },
  feature: {
    alignItems: "center",
  },
  featureNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 4,
  },
  featureLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  amenities: {
    gap: 8,
  },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amenityText: {
    color: "#059669",
    fontWeight: "500",
  },
  statsSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#6B7280",
    fontSize: 14,
  },
  contactSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  contactButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  takenNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    gap: 12,
  },
  takenNoticeText: {
    color: "#B91C1C",
    fontSize: 14,
    flex: 1,
  },
})

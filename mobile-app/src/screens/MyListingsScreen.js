"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import ListingCard from "../components/ListingCard"
import { apiCall } from "../config/api"

export default function MyListingsScreen() {
  const { currentUser } = useSelector((state) => state.user)
  const navigation = useNavigation()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [totalMetrics, setTotalMetrics] = useState({
    views: 0,
    likes: 0,
    saves: 0,
    inquiries: 0,
  })

  const fetchListings = async () => {
    if (!currentUser) {
      // Fixed navigation call - direct navigation instead of nested
      navigation.navigate("SignIn")
      return
    }

    try {
      setLoading(true)
      const response = await apiCall(`/listing/get?userRef=${currentUser.id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      })

      if (Array.isArray(response)) {
        setListings(response)
        calculateTotalMetrics(response)
      } else {
        console.error("Invalid response format:", response)
        setListings([])
      }
    } catch (error) {
      console.error("Error fetching listings:", error)
      setListings([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateTotalMetrics = (listingsData) => {
    const totals = listingsData.reduce(
      (acc, listing) => {
        return {
          views: acc.views + (listing.views || 0),
          likes: acc.likes + (listing.likes || 0),
          saves: acc.saves + (listing.saves || 0),
          inquiries: acc.inquiries + (listing.inquiries || 0),
        }
      },
      { views: 0, likes: 0, saves: 0, inquiries: 0 },
    )
    setTotalMetrics(totals)
  }

  const handleDeleteListing = (listingId) => {
    Alert.alert("Delete Listing", "Are you sure you want to delete this listing?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiCall(`/listing/delete/${listingId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${currentUser.token}`,
              },
            })
            setListings((prev) => prev.filter((listing) => listing._id !== listingId))
            Alert.alert("Success", "Listing deleted successfully")
          } catch (error) {
            console.error("Error deleting listing:", error)
            Alert.alert("Error", "Failed to delete listing")
          }
        },
      },
    ])
  }

  const handleUpdateStatus = (listing) => {
    Alert.alert(
      "Update Status",
      "Select the new status for your property:",
      [
        {
          text: "Available",
          onPress: () => updateListingStatus(listing._id, "available"),
        },
        {
          text: "Reserved",
          onPress: () => updateListingStatus(listing._id, "reserved"),
        },
        {
          text: "Pending",
          onPress: () => updateListingStatus(listing._id, "pending"),
        },
        {
          text: "Taken",
          onPress: () => {
            Alert.alert("Mark as Taken", "This will hide your property from the home page. Continue?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Yes, Mark as Taken",
                onPress: () => updateListingStatus(listing._id, "taken"),
              },
            ])
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true },
    )
  }

  const updateListingStatus = async (listingId, status) => {
    try {
      console.log(`🔄 Updating listing ${listingId} to status: ${status}`)

      const response = await apiCall(`/listing/status/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ status }),
      })

      console.log("✅ Status update response:", response)

      if (response && response.success) {
        // Update the listing in the state
        setListings((prev) => prev.map((listing) => (listing._id === listingId ? { ...listing, status } : listing)))

        // Show success message with clear explanation
        let message = ""
        switch (status) {
          case "available":
            message = "✅ Your property is now AVAILABLE and will appear on the home page."
            break
          case "reserved":
            message = "🟡 Your property is now RESERVED and hidden from the home page."
            break
          case "pending":
            message = "🔵 Your property is now PENDING and hidden from the home page."
            break
          case "taken":
            message = "🔴 Your property is now TAKEN and hidden from the home page."
            break
        }

        Alert.alert("Status Updated!", message)
      } else {
        console.error("❌ Unexpected response format:", response)
        Alert.alert("Error", "Unexpected response from server. Please try again.")
      }
    } catch (error) {
      console.error("❌ Error updating listing status:", error)

      // More specific error messages
      let errorMessage = "Failed to update listing status."

      if (error.message.includes("Server returned HTML")) {
        errorMessage = "API server is not running. Please check if the backend server is started."
      } else if (error.message.includes("Network request failed")) {
        errorMessage = "Network connection failed. Please check your internet connection."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again."
      } else if (error.message.includes("401")) {
        errorMessage = "Authentication failed. Please sign in again."
      }

      Alert.alert("Update Failed", errorMessage)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchListings()
  }

  useFocusEffect(
    useCallback(() => {
      fetchListings()
    }, [currentUser]),
  )

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your listings...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => navigation.navigate("ListingDetail", { listing: item })}
            onEdit={() => navigation.navigate("EditListing", { listing: item })}
            onDelete={() => handleDeleteListing(item._id)}
            onStatusUpdate={() => handleUpdateStatus(item)}
            showActions={true}
            isOwner={true}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>My Listings</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("Create")}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {listings.length > 0 && (
              <View style={styles.metricsContainer}>
                <Text style={styles.metricsTitle}>Total Performance</Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Ionicons name="eye-outline" size={20} color="#3B82F6" />
                    <Text style={styles.metricValue}>{totalMetrics.views}</Text>
                    <Text style={styles.metricLabel}>Views</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="heart-outline" size={20} color="#EF4444" />
                    <Text style={styles.metricValue}>{totalMetrics.likes}</Text>
                    <Text style={styles.metricLabel}>Likes</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="bookmark-outline" size={20} color="#F59E0B" />
                    <Text style={styles.metricValue}>{totalMetrics.saves}</Text>
                    <Text style={styles.metricLabel}>Saves</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="chatbubble-outline" size={20} color="#10B981" />
                    <Text style={styles.metricValue}>{totalMetrics.inquiries}</Text>
                    <Text style={styles.metricLabel}>Inquiries</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Listings Yet</Text>
            <Text style={styles.emptyText}>
              You haven't created any listings yet. Tap the + button to create your first listing.
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("Create")}>
              <Text style={styles.createButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={listings.length === 0 ? styles.emptyList : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#3B82F6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  metricsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
})

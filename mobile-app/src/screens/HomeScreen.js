"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useFocusEffect } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { apiCall } from "../config/api"
import ListingCard from "../components/ListingCard"
import ListingSlideshow from "../components/ListingSlideshow"
import HamburgerMenu from "../components/HamburgerMenu"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const navigation = useNavigation()
  const { currentUser } = useSelector((state) => state.user)
  const [allListings, setAllListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [networkError, setNetworkError] = useState(null)

  const fetchListings = async (category = activeCategory) => {
    try {
      setLoading(true)
      console.log(`🏠 Fetching ${category} listings...`)

      // Build query parameters
      let queryParams = "?approved=true"

      // CRITICAL: Only show available properties on home page (exclude reserved, taken, pending)
      queryParams += "&status=available"

      // Add category filter if not "all"
      if (category !== "all") {
        queryParams += `&type=${category}`
      }

      console.log(`🌐 API query: ${queryParams}`)

      const headers = {}
      if (currentUser && currentUser.token) {
        headers.Authorization = `Bearer ${currentUser.token}`
      }

      // Fetch all approved listings with full data including interaction metrics
      console.log("📊 Fetching listings with interaction data...")
      const response = await apiCall(`/listing/get${queryParams}`, {
        headers,
      })

      if (Array.isArray(response)) {
        console.log(`✅ Successfully fetched ${response.length} listings`)

        // Ensure each listing has proper interaction data and status
        const processedListings = (response || []).map((listing) => ({
          ...listing,
          views: listing.views || 0,
          likes: listing.likes || 0,
          saves: listing.saves || 0,
          status: listing.status || "available",
          userInteractions: listing.userInteractions || { liked: false, saved: false },
        }))

        setAllListings(processedListings)
        setNetworkError(null) // Clear any previous network errors
      } else {
        console.error("❌ Invalid response format:", response)
        setAllListings([])
      }
    } catch (error) {
      console.error("❌ Error in fetchListings:", error)

      // Set network error state for user feedback
      setNetworkError(error.message)

      // Show empty state rather than crash
      setAllListings([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchListings()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchListings()
  }

  const handleListingUpdate = (listingId, updates) => {
    setAllListings((prevListings) =>
      prevListings.map((listing) =>
        listing._id === listingId
          ? {
              ...listing,
              views: updates.views !== undefined ? updates.views : listing.views,
              likes: updates.likes !== undefined ? updates.likes : listing.likes,
              saves: updates.saves !== undefined ? updates.saves : listing.saves,
              userInteractions: {
                ...listing.userInteractions,
                liked: updates.liked !== undefined ? updates.liked : listing.userInteractions?.liked,
                saved: updates.saved !== undefined ? updates.saved : listing.userInteractions?.saved,
              },
            }
          : listing,
      ),
    )
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const handleCategoryPress = (category) => {
    setActiveCategory(category)
    fetchListings(category)
  }

  // Get latest listings for hero slideshow (first 3 most recent)
  const getLatestListings = () => {
    return allListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
  }

  // Categorize listings
  const getRecentListings = () => {
    return allListings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(3, 9) // Skip first 3 (used in slideshow)
  }

  const getFeaturedListings = () => {
    return allListings.filter((listing) => listing.offer).slice(0, 4)
  }

  const getForSaleListings = () => {
    return allListings.filter((listing) => listing.type === "sale").slice(0, 4)
  }

  const getForRentListings = () => {
    return allListings.filter((listing) => listing.type === "rent").slice(0, 4)
  }

  const getMostViewedListings = () => {
    return allListings.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4)
  }

  const getMostLikedListings = () => {
    return allListings.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 4)
  }

  const renderListingSection = (title, listings, showViewAll = false) => {
    if (listings.length === 0) return null

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {showViewAll && (
            <TouchableOpacity onPress={() => navigation.navigate("Search")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        {listings.map((listing) => (
          <ListingCard
            key={listing._id}
            listing={listing}
            onPress={() => navigation.navigate("ListingDetail", { listing })}
            onUpdate={handleListingUpdate}
          />
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <HamburgerMenu isVisible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Top Header - Fixed at the very top */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.appTitle}>Estate App</Text>

        {currentUser ? (
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image source={{ uri: currentUser.avatar || "https://via.placeholder.com/40" }} style={styles.avatar} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
      >
        {/* Hero Slideshow - Below the header */}
        {!loading && getLatestListings().length > 0 && (
          <ListingSlideshow
            listings={getLatestListings()}
            onPress={(listing) => navigation.navigate("ListingDetail", { listing })}
            isHero={true}
            onSearchPress={() => navigation.navigate("Search")}
          />
        )}

        {/* Connection Status Indicator */}
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: allListings.length > 0 ? "#10B981" : "#EF4444" }]} />
          <Text style={styles.statusText}>
            {allListings.length > 0 ? "Connected - Properties available" : "Connection issues - Using offline data"}
          </Text>
        </View>

        {/* Network Error Display */}
        {networkError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Connection Problem</Text>
            <Text style={styles.errorText}>{networkError}</Text>
            <TouchableOpacity style={styles.diagnosticButton} onPress={() => navigation.navigate("NetworkDiagnostic")}>
              <Text style={styles.diagnosticButtonText}>Run Network Diagnostic</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          <TouchableOpacity
            style={[styles.categoryItem, activeCategory === "all" && styles.activeCategoryItem]}
            onPress={() => handleCategoryPress("all")}
          >
            <Ionicons name="home" size={20} color={activeCategory === "all" ? "#007AFF" : "#666"} />
            <Text style={[styles.categoryText, activeCategory === "all" && styles.activeCategoryText]}>
              All Properties
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryItem, activeCategory === "sale" && styles.activeCategoryItem]}
            onPress={() => handleCategoryPress("sale")}
          >
            <Ionicons name="pricetag" size={20} color={activeCategory === "sale" ? "#007AFF" : "#666"} />
            <Text style={[styles.categoryText, activeCategory === "sale" && styles.activeCategoryText]}>For Sale</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryItem, activeCategory === "rent" && styles.activeCategoryItem]}
            onPress={() => handleCategoryPress("rent")}
          >
            <Ionicons name="key" size={20} color={activeCategory === "rent" ? "#007AFF" : "#666"} />
            <Text style={[styles.categoryText, activeCategory === "rent" && styles.activeCategoryText]}>For Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryItem, activeCategory === "search" && styles.activeCategoryItem]}
            onPress={() => handleCategoryPress("search")}
          >
            <Ionicons name="search" size={22} color={activeCategory === "search" ? "#007AFF" : "#666"} />
            <Text style={[styles.categoryText, activeCategory === "search" && styles.activeCategoryText]}>Search</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* User Status */}
        {currentUser && (
          <View style={styles.userStatus}>
            <Text style={styles.userStatusText}>Welcome back, {currentUser.username}!</Text>
            <Text style={styles.userStatusSubtext}>Like, save, and inquire about properties you love</Text>
          </View>
        )}

        {/* Loading State */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading properties...</Text>
          </View>
        )}

        {/* No Listings State */}
        {!loading && allListings.length === 0 && (
          <View style={styles.noListingsContainer}>
            <Text style={styles.noListingsText}>No properties available at the moment</Text>
          </View>
        )}

        {/* Listing Categories with Clear Cards */}
        {!loading && allListings.length > 0 && (
          <>
            {renderListingSection("More Recent Properties", getRecentListings(), true)}
            {renderListingSection("⭐ Featured Properties", getFeaturedListings(), true)}
            {renderListingSection("👁️ Most Viewed", getMostViewedListings(), true)}
            {renderListingSection("❤️ Most Liked", getMostLikedListings(), true)}
            {renderListingSection("🏠 Properties for Sale", getForSaleListings(), true)}
            {renderListingSection("🔑 Properties for Rent", getForRentListings(), true)}
          </>
        )}

        {/* Sign In Prompt */}
        {!currentUser && (
          <View style={styles.signInPrompt}>
            <Text style={styles.signInPromptTitle}>Get the Full Experience</Text>
            <Text style={styles.signInPromptText}>Sign in to like, save, and inquire about properties you love</Text>
            <TouchableOpacity style={styles.signInPromptButton} onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.signInPromptButtonText}>Sign In Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  signInButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signInText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12, // Increased from 10 to 12 for better touch target
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    minHeight: 44, // Add minimum height for better touch target
  },
  activeCategoryItem: {
    backgroundColor: "#e6f2ff",
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    lineHeight: 20, // Add line height for better text alignment
  },
  activeCategoryText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  userStatus: {
    backgroundColor: "#ECFDF5",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  userStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 4,
  },
  userStatusSubtext: {
    fontSize: 14,
    color: "#047857",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  viewAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 20,
  },
  noListingsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noListingsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginVertical: 20,
  },
  signInPrompt: {
    backgroundColor: "#FEF3C7",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  signInPromptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
  },
  signInPromptText: {
    fontSize: 14,
    color: "#B45309",
    textAlign: "center",
    marginBottom: 16,
  },
  signInPromptButton: {
    backgroundColor: "#D97706",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  signInPromptButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
    marginBottom: 12,
  },
  diagnosticButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  diagnosticButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 20,
  },
})

"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import { apiCall } from "../config/api"
import ListingCard from "../components/ListingCard"

export default function SearchScreen() {
  const navigation = useNavigation()
  const { currentUser } = useSelector((state) => state.user)
  const [searchTerm, setSearchTerm] = useState("")
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [filters, setFilters] = useState({
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "created_at",
    order: "desc",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    minSize: "",
    maxSize: "",
  })
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    loadRecentSearches()
  }, [])

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Auto-search when search term changes (with longer debounce)
  useEffect(() => {
    if (searchTerm.length > 2 || searchTerm.length === 0) {
      const timeoutId = setTimeout(() => {
        handleSearch()
      }, 500) // Longer debounce for text search

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  const loadRecentSearches = () => {
    // In a real app, you'd load this from AsyncStorage
    setRecentSearches(["Downtown apartments", "2 bedroom house", "Furnished studio", "Parking included"])
  }

  const saveRecentSearch = (term) => {
    if (term.trim() && !recentSearches.includes(term)) {
      const updated = [term, ...recentSearches.slice(0, 4)] // Keep only 5 recent searches
      setRecentSearches(updated)
      // In a real app, save to AsyncStorage
    }
  }

  const handleSearch = async (saveSearch = false) => {
    try {
      setLoading(true)
      setHasSearched(true)
      let query = "/listing/get?"

      // Add search term
      if (searchTerm.trim()) {
        query += `searchTerm=${encodeURIComponent(searchTerm)}&`
        if (saveSearch) {
          saveRecentSearch(searchTerm)
        }
      }

      // Add filters
      if (filters.type !== "all") {
        query += `type=${filters.type}&`
      }
      if (filters.parking) {
        query += `parking=true&`
      }
      if (filters.furnished) {
        query += `furnished=true&`
      }
      if (filters.offer) {
        query += `offer=true&`
      }
      if (filters.minPrice) {
        query += `minPrice=${filters.minPrice}&`
      }
      if (filters.maxPrice) {
        query += `maxPrice=${filters.maxPrice}&`
      }
      if (filters.bedrooms) {
        query += `bedrooms=${filters.bedrooms}&`
      }
      if (filters.bathrooms) {
        query += `bathrooms=${filters.bathrooms}&`
      }

      query += `sort=${filters.sort}&order=${filters.order}&approved=true`

      console.log("🔍 Search query:", query)
      const data = await apiCall(query)
      setListings(data || [])
    } catch (error) {
      console.error("Search error:", error)
      Alert.alert("Error", "Failed to search listings")
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      type: "all",
      parking: false,
      furnished: false,
      offer: false,
      sort: "created_at",
      order: "desc",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      minSize: "",
      maxSize: "",
    })
    setSearchTerm("")
    setHasSearched(false)
    setListings([])
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.type !== "all") count++
    if (filters.parking) count++
    if (filters.furnished) count++
    if (filters.offer) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.bedrooms) count++
    if (filters.bathrooms) count++
    return count
  }

  const quickFilters = [
    {
      label: "For Rent",
      action: () => updateFilter("type", "rent"),
      active: filters.type === "rent",
    },
    {
      label: "For Sale",
      action: () => updateFilter("type", "sale"),
      active: filters.type === "sale",
    },
    {
      label: "Under $1000",
      action: () => updateFilter("maxPrice", "1000"),
      active: filters.maxPrice === "1000",
    },
    {
      label: "2+ Bedrooms",
      action: () => updateFilter("bedrooms", "2"),
      active: filters.bedrooms === "2",
    },
    {
      label: "Furnished",
      action: () => updateFilter("furnished", !filters.furnished),
      active: filters.furnished,
    },
    {
      label: "With Parking",
      action: () => updateFilter("parking", !filters.parking),
      active: filters.parking,
    },
    {
      label: "Special Offers",
      action: () => updateFilter("offer", !filters.offer),
      active: filters.offer,
    },
  ]

  const handleListingUpdate = (listingId, updates) => {
    setListings((prevListings) =>
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Properties</Text>
        <TouchableOpacity style={styles.mapButton} onPress={() => Alert.alert("Map View", "Map view coming soon!")}>
          <Ionicons name="map-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, name, features..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={() => handleSearch(true)}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}
      </View>

      {/* Recent Searches */}
      {!searchTerm && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentChip}
                onPress={() => {
                  setSearchTerm(search)
                }}
              >
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.recentText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Filters */}
      <View style={styles.quickFiltersSection}>
        <Text style={styles.sectionTitle}>Quick Filters</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickFilters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickFilterChip, filter.active && styles.quickFilterChipActive]}
              onPress={filter.action}
            >
              <Text style={[styles.quickFilterText, filter.active && styles.quickFilterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Header */}
      <View style={styles.filterHeader}>
        <TouchableOpacity style={styles.advancedToggle} onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={styles.filtersTitle}>Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}</Text>
          <Ionicons name={showAdvanced ? "chevron-up" : "chevron-down"} size={20} color="#374151" />
        </TouchableOpacity>

        {getActiveFilterCount() > 0 && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Basic Filters */}
      <View style={styles.filtersSection}>
        {/* Type Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Property Type</Text>
          <View style={styles.filterButtons}>
            {["all", "rent", "sale"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterButton, filters.type === type && styles.filterButtonActive]}
                onPress={() => updateFilter("type", type)}
              >
                <Text style={[styles.filterButtonText, filters.type === type && styles.filterButtonTextActive]}>
                  {type === "all" ? "All" : type === "rent" ? "For Rent" : "For Sale"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            <TouchableOpacity
              style={[styles.amenityButton, filters.parking && styles.amenityButtonActive]}
              onPress={() => updateFilter("parking", !filters.parking)}
            >
              <Ionicons name="car-outline" size={20} color={filters.parking ? "#fff" : "#6B7280"} />
              <Text style={[styles.amenityText, filters.parking && styles.amenityTextActive]}>Parking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.amenityButton, filters.furnished && styles.amenityButtonActive]}
              onPress={() => updateFilter("furnished", !filters.furnished)}
            >
              <Ionicons name="bed-outline" size={20} color={filters.furnished ? "#fff" : "#6B7280"} />
              <Text style={[styles.amenityText, filters.furnished && styles.amenityTextActive]}>Furnished</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.amenityButton, filters.offer && styles.amenityButtonActive]}
              onPress={() => updateFilter("offer", !filters.offer)}
            >
              <Ionicons name="pricetag-outline" size={20} color={filters.offer ? "#fff" : "#6B7280"} />
              <Text style={[styles.amenityText, filters.offer && styles.amenityTextActive]}>Special Offers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Advanced Filters */}
      {showAdvanced && (
        <View style={styles.advancedFilters}>
          {/* Price Range */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min Price"
                value={filters.minPrice}
                onChangeText={(text) => updateFilter("minPrice", text)}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>to</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max Price"
                value={filters.maxPrice}
                onChangeText={(text) => updateFilter("maxPrice", text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Bedrooms & Bathrooms */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Bedrooms</Text>
            <View style={styles.numberButtons}>
              {["", "1", "2", "3", "4", "5+"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.numberButton, filters.bedrooms === num && styles.numberButtonActive]}
                  onPress={() => updateFilter("bedrooms", num)}
                >
                  <Text style={[styles.numberButtonText, filters.bedrooms === num && styles.numberButtonTextActive]}>
                    {num || "Any"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Bathrooms</Text>
            <View style={styles.numberButtons}>
              {["", "1", "2", "3", "4+"].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.numberButton, filters.bathrooms === num && styles.numberButtonActive]}
                  onPress={() => updateFilter("bathrooms", num)}
                >
                  <Text style={[styles.numberButtonText, filters.bathrooms === num && styles.numberButtonTextActive]}>
                    {num || "Any"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortButtons}>
              {[
                { key: "created_at", label: "Newest" },
                { key: "regularPrice", label: "Price" },
                { key: "views", label: "Most Viewed" },
                { key: "likes", label: "Most Liked" },
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[styles.sortButton, filters.sort === sort.key && styles.sortButtonActive]}
                  onPress={() => updateFilter("sort", sort.key)}
                >
                  <Text style={[styles.sortButtonText, filters.sort === sort.key && styles.sortButtonTextActive]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Results */}
      {hasSearched ? (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {listings.length} {listings.length === 1 ? "Property" : "Properties"} Found
            </Text>
            {listings.length > 0 && (
              <TouchableOpacity
                style={styles.sortToggle}
                onPress={() => updateFilter("order", filters.order === "asc" ? "desc" : "asc")}
              >
                <Ionicons name={filters.order === "asc" ? "arrow-up" : "arrow-down"} size={16} color="#6B7280" />
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

          {listings.length === 0 && !loading && (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noResultsTitle}>No properties found</Text>
              <Text style={styles.noResultsText}>Try adjusting your search criteria or clearing some filters</Text>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.welcomeSection}>
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text style={styles.welcomeTitle}>Find Your Perfect Property</Text>
          <Text style={styles.welcomeText}>Use the search bar and filters above to discover amazing properties</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  mapButton: {
    padding: 8,
  },
  searchSection: {
    padding: 20,
    paddingTop: 0,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  loadingIndicator: {
    alignItems: "center",
    paddingVertical: 8,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickFiltersSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  recentText: {
    marginLeft: 4,
    color: "#6B7280",
    fontSize: 14,
  },
  quickFilterChip: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  quickFilterChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  quickFilterText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  quickFilterTextActive: {
    color: "#fff",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
    color: "#1F2937",
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
  },
  clearFiltersText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  filtersSection: {
    padding: 20,
    paddingTop: 0,
  },
  advancedFilters: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: "#F9FAFB",
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  filterButtons: {
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterButtonText: {
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 8,
  },
  amenityButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  amenityText: {
    marginLeft: 4,
    color: "#6B7280",
    fontSize: 14,
  },
  amenityTextActive: {
    color: "#fff",
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  priceSeparator: {
    marginHorizontal: 12,
    color: "#6B7280",
  },
  numberButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  numberButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: "center",
  },
  numberButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  numberButtonText: {
    color: "#6B7280",
    fontSize: 14,
  },
  numberButtonTextActive: {
    color: "#fff",
  },
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 8,
  },
  sortButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  sortButtonText: {
    color: "#6B7280",
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  resultsSection: {
    padding: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sortToggle: {
    padding: 8,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  welcomeSection: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
})

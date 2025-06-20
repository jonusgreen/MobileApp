"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Animated } from "react-native"

const { width } = Dimensions.get("window")
const SLIDE_WIDTH = width

export default function ListingSlideshow({
  listings,
  onPress,
  title = "Latest Properties",
  isHero = false,
  onSearchPress,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Auto-scroll every 5 seconds for hero, 4 seconds for regular
  useEffect(() => {
    if (listings.length <= 1) return

    const interval = setInterval(
      () => {
        const nextIndex = (currentIndex + 1) % listings.length
        scrollToIndex(nextIndex)
      },
      isHero ? 5000 : 4000,
    )

    return () => clearInterval(interval)
  }, [currentIndex, listings.length, isHero])

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      scrollViewRef.current.scrollTo({
        x: index * SLIDE_WIDTH,
        animated: true,
      })
      setCurrentIndex(index)
    }
  }

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / SLIDE_WIDTH)
    setCurrentIndex(index)
  }

  if (!listings || listings.length === 0) {
    return null
  }

  const formatPrice = (listing) => {
    const currency = listing.currency || "UGX"
    const price = listing.regularPrice?.toLocaleString() || "0"
    const type = listing.type === "rent" ? "/month" : ""
    return `${currency} ${price}${type}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "#EF4444"
      case "reserved":
        return "#F59E0B"
      case "pending":
        return "#3B82F6"
      default:
        return "#10B981"
    }
  }

  const getStatusText = (status) => {
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

  // Hero slideshow - simple images with overlay
  if (isHero) {
    return (
      <View style={styles.heroContainer}>
        <Animated.View style={[styles.heroSlideshowContainer, { opacity: fadeAnim }]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            decelerationRate="fast"
            snapToInterval={SLIDE_WIDTH}
            snapToAlignment="start"
          >
            {listings.map((listing, index) => (
              <TouchableOpacity
                key={listing._id}
                style={styles.heroSlide}
                onPress={() => onPress(listing)}
                activeOpacity={0.9}
              >
                {listing.imageUrls && listing.imageUrls[0] ? (
                  <Image source={{ uri: listing.imageUrls[0] }} style={styles.heroImage} />
                ) : (
                  <View style={[styles.heroImage, styles.heroNoImage]}>
                    <Text style={styles.noImageIcon}>🏠</Text>
                  </View>
                )}

                {/* Dark overlay for text readability */}
                <View style={styles.heroOverlay} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Hero Content Overlay */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Find Your Dream Home</Text>
          <Text style={styles.heroSubtitle}>Discover the perfect property for you and your family</Text>

          {onSearchPress && (
            <TouchableOpacity style={styles.heroSearchButton} onPress={onSearchPress}>
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.heroSearchButtonText}>Start Searching</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Simple pagination dots */}
        {listings.length > 1 && (
          <View style={styles.heroPagination}>
            {listings.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.heroDot, index === currentIndex ? styles.heroActiveDot : styles.heroInactiveDot]}
                onPress={() => scrollToIndex(index)}
              />
            ))}
          </View>
        )}
      </View>
    )
  }

  // Regular slideshow with details
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Swipe to explore • Auto-updating</Text>
      </View>

      <Animated.View style={[styles.slideshowContainer, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
          snapToInterval={width - 40}
          snapToAlignment="start"
          contentContainerStyle={styles.scrollContainer}
        >
          {listings.map((listing, index) => (
            <TouchableOpacity
              key={listing._id}
              style={styles.slide}
              onPress={() => onPress(listing)}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                {listing.imageUrls && listing.imageUrls[0] ? (
                  <Image source={{ uri: listing.imageUrls[0] }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.noImage]}>
                    <Text style={styles.noImageIcon}>🏠</Text>
                  </View>
                )}

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(listing.status)}</Text>
                </View>

                {/* Featured Badge */}
                {listing.offer && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.featuredText}>FEATURED</Text>
                  </View>
                )}

                {/* Gradient Overlay */}
                <View style={styles.gradientOverlay} />

                {/* Price Tag */}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>{formatPrice(listing)}</Text>
                  {listing.offer && listing.discountPrice && (
                    <Text style={styles.originalPrice}>
                      {listing.currency} {listing.discountPrice.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.content}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {listing.name}
                </Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.address} numberOfLines={1}>
                    {listing.address}
                  </Text>
                </View>

                <View style={styles.features}>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🛏️</Text>
                    <Text style={styles.featureText}>{listing.bedrooms} Beds</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🚿</Text>
                    <Text style={styles.featureText}>{listing.bathrooms} Baths</Text>
                  </View>
                  {listing.parking && (
                    <View style={styles.feature}>
                      <Text style={styles.featureIcon}>🚗</Text>
                      <Text style={styles.featureText}>Parking</Text>
                    </View>
                  )}
                </View>

                <View style={styles.metrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricIcon}>👁️</Text>
                    <Text style={styles.metricText}>{listing.views || 0} views</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricIcon}>❤️</Text>
                    <Text style={styles.metricText}>{listing.likes || 0} likes</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Pagination Dots */}
      {listings.length > 1 && (
        <View style={styles.pagination}>
          {listings.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, index === currentIndex ? styles.activeDot : styles.inactiveDot]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}

      {/* Navigation Arrows */}
      {listings.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={() => scrollToIndex(currentIndex > 0 ? currentIndex - 1 : listings.length - 1)}
          >
            <Text style={styles.navIcon}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={() => scrollToIndex((currentIndex + 1) % listings.length)}
          >
            <Text style={styles.navIcon}>▶</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  // Hero Slideshow Styles (Simple)
  heroContainer: {
    height: 250, // Reduced height
    position: "relative",
  },
  heroSlideshowContainer: {
    flex: 1,
  },
  heroSlide: {
    width: SLIDE_WIDTH,
    height: 250,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroNoImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageIcon: {
    fontSize: 60,
    color: "#ccc",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Dark overlay for text readability
  },
  heroContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    opacity: 0.9,
    marginBottom: 20,
  },
  heroSearchButton: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  heroSearchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  heroPagination: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  heroActiveDot: {
    backgroundColor: "#fff",
    width: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  heroInactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },

  // Regular Slideshow Styles (Detailed)
  container: {
    marginVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  slideshowContainer: {
    position: "relative",
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  slide: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: {
    position: "relative",
    height: 220,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 5,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  featuredText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  priceContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  priceText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  address: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  features: {
    flexDirection: "row",
    marginBottom: 12,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  metrics: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metricIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metricText: {
    fontSize: 12,
    color: "#6B7280",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#007AFF",
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
  navButton: {
    position: "absolute",
    top: "45%",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  navIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  prevButton: {
    left: 30,
  },
  nextButton: {
    right: 30,
  },
})

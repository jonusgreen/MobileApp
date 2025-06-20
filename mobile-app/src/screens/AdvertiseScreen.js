"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { Ionicons } from "@expo/vector-icons"

export default function AdvertiseScreen() {
  const navigation = useNavigation()
  const { currentUser } = useSelector((state) => state.user)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState("1month")

  const packages = [
    {
      id: "basic",
      name: "Basic Promotion",
      price: 50000,
      currency: "UGX",
      features: [
        "Featured in search results",
        "Highlighted listing border",
        "Priority in category listings",
        "Basic analytics",
      ],
      color: "#3B82F6",
      popular: false,
    },
    {
      id: "premium",
      name: "Premium Promotion",
      price: 120000,
      currency: "UGX",
      features: [
        "Top of search results",
        "Premium badge",
        "Social media promotion",
        "Advanced analytics",
        "Email marketing inclusion",
        "WhatsApp promotion",
      ],
      color: "#10B981",
      popular: true,
    },
    {
      id: "featured",
      name: "Featured Promotion",
      price: 200000,
      currency: "UGX",
      features: [
        "Homepage featured section",
        "Premium+ badge",
        "Social media campaigns",
        "Professional photography",
        "Video tour promotion",
        "Dedicated account manager",
        "Multi-platform advertising",
      ],
      color: "#F59E0B",
      popular: false,
    },
  ]

  const durations = [
    { id: "1week", label: "1 Week", multiplier: 0.3 },
    { id: "1month", label: "1 Month", multiplier: 1 },
    { id: "3months", label: "3 Months", multiplier: 2.5 },
  ]

  const calculatePrice = (basePrice, duration) => {
    const multiplier = durations.find((d) => d.id === duration)?.multiplier || 1
    return Math.round(basePrice * multiplier)
  }

  const handlePurchase = () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a promotion package")
      return
    }

    const pkg = packages.find((p) => p.id === selectedPackage)
    const finalPrice = calculatePrice(pkg.price, selectedDuration)
    const durationLabel = durations.find((d) => d.id === selectedDuration)?.label

    Alert.alert(
      "Confirm Purchase",
      `Purchase ${pkg.name} for ${durationLabel}?\n\nTotal: ${pkg.currency} ${finalPrice.toLocaleString()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase",
          onPress: () => {
            // Navigate to payment screen or process payment
            Alert.alert("Success", "Promotion activated successfully!")
          },
        },
      ],
    )
  }

  const renderPackage = (pkg) => (
    <TouchableOpacity
      key={pkg.id}
      style={[styles.packageCard, selectedPackage === pkg.id && styles.selectedPackage, { borderColor: pkg.color }]}
      onPress={() => setSelectedPackage(pkg.id)}
    >
      {pkg.popular && (
        <View style={[styles.popularBadge, { backgroundColor: pkg.color }]}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.packagePrice, { color: pkg.color }]}>
            {pkg.currency} {calculatePrice(pkg.price, selectedDuration).toLocaleString()}
          </Text>
          <Text style={styles.pricePeriod}>/{durations.find((d) => d.id === selectedDuration)?.label}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {pkg.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={pkg.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {selectedPackage === pkg.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: pkg.color }]}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advertise Your Property</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="megaphone" size={48} color="#3B82F6" />
          <Text style={styles.infoTitle}>Boost Your Property Visibility</Text>
          <Text style={styles.infoSubtitle}>
            Get more views, inquiries, and faster sales with our promotion packages
          </Text>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Duration</Text>
          <View style={styles.durationContainer}>
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration.id}
                style={[styles.durationButton, selectedDuration === duration.id && styles.selectedDuration]}
                onPress={() => setSelectedDuration(duration.id)}
              >
                <Text style={[styles.durationText, selectedDuration === duration.id && styles.selectedDurationText]}>
                  {duration.label}
                </Text>
                {duration.id === "3months" && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>Save 15%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Packages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Package</Text>
          {packages.map(renderPackage)}
        </View>

        {/* Current Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Promotions</Text>
          <View style={styles.activePromotions}>
            <View style={styles.promotionCard}>
              <View style={styles.promotionInfo}>
                <Text style={styles.promotionTitle}>Premium Promotion</Text>
                <Text style={styles.promotionProperty}>Modern Apartment in Kampala</Text>
                <Text style={styles.promotionExpiry}>Expires in 12 days</Text>
              </View>
              <View style={styles.promotionStats}>
                <Text style={styles.statValue}>1.2k</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Promote Your Property?</Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
              <Text style={styles.benefitTitle}>5x More Views</Text>
              <Text style={styles.benefitText}>Promoted listings get significantly more visibility</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="time" size={24} color="#3B82F6" />
              <Text style={styles.benefitTitle}>Faster Sales</Text>
              <Text style={styles.benefitText}>Sell or rent your property 3x faster</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons name="people" size={24} color="#F59E0B" />
              <Text style={styles.benefitTitle}>Quality Leads</Text>
              <Text style={styles.benefitText}>Attract serious buyers and tenants</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.purchaseContainer}>
        <TouchableOpacity
          style={[styles.purchaseButton, !selectedPackage && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={!selectedPackage}
        >
          <Text style={styles.purchaseButtonText}>
            {selectedPackage ? `Purchase ${packages.find((p) => p.id === selectedPackage)?.name}` : "Select a Package"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  content: {
    flex: 1,
  },
  infoSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  infoSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  durationButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
    position: "relative",
  },
  selectedDuration: {
    backgroundColor: "#3B82F6",
  },
  durationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  selectedDurationText: {
    color: "#FFFFFF",
  },
  saveBadge: {
    position: "absolute",
    top: -8,
    right: -5,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  saveText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  packageCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  selectedPackage: {
    borderWidth: 3,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  packageHeader: {
    marginBottom: 20,
  },
  packageName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  packagePrice: {
    fontSize: 28,
    fontWeight: "bold",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 5,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#4B5563",
    marginLeft: 12,
    flex: 1,
  },
  selectedIndicator: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  activePromotions: {
    marginTop: 10,
  },
  promotionCard: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  promotionInfo: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 5,
  },
  promotionProperty: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 5,
  },
  promotionExpiry: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  promotionStats: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  benefitsContainer: {
    marginTop: 10,
  },
  benefit: {
    alignItems: "center",
    marginBottom: 25,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 5,
  },
  benefitText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  purchaseContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  purchaseButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
})

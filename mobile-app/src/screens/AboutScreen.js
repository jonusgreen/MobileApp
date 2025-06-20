"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"


export default function AboutScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop" }}
            style={styles.heroImage}
          />
          <Text style={styles.heroTitle}>Your Trusted Property Partner</Text>
          <Text style={styles.heroSubtitle}>Connecting people with their dream homes since 2020</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            To revolutionize the real estate experience by providing a seamless, transparent, and efficient platform
            that connects property seekers with their perfect homes while empowering property owners to maximize their
            investments.
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Values</Text>

          <View style={styles.valueItem}>
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Transparency</Text>
              <Text style={styles.valueText}>
                We believe in honest, clear communication and transparent processes in every transaction.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Ionicons name="people" size={24} color="#10B981" />
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Customer First</Text>
              <Text style={styles.valueText}>
                Our customers' needs and satisfaction are at the heart of everything we do.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Ionicons name="rocket" size={24} color="#F59E0B" />
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Innovation</Text>
              <Text style={styles.valueText}>
                We continuously innovate to provide cutting-edge solutions for modern real estate needs.
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10,000+</Text>
              <Text style={styles.statLabel}>Properties Listed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5,000+</Text>
              <Text style={styles.statLabel}>Happy Customers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Cities Covered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Customer Support</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get In Touch</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  hero: {
    alignItems: "center",
    padding: 20,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  valueItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  valueContent: {
    flex: 1,
    marginLeft: 15,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 5,
  },
  valueText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  statsSection: {
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

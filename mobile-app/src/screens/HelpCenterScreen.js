"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

export default function HelpCenterScreen() {
  const { theme } = useTheme() || {}

  // Fallback colors in case theme is undefined
  const colors = theme?.colors || {
    background: "#ffffff",
    surface: "#f8f9fa",
    primary: "#3B82F6",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState({})

  const faqData = [
    {
      id: 1,
      question: "How do I list my property?",
      answer:
        "To list your property, go to 'Create Listing' from the main menu. Fill in all required details including photos, description, price, and location. Your listing will be reviewed and published within 24 hours.",
      category: "listing",
    },
    {
      id: 2,
      question: "How do I contact a property owner?",
      answer:
        "On any property listing, tap the 'Contact Owner' button. You can send a message directly through the app, and the owner will receive your inquiry via email.",
      category: "contact",
    },
    {
      id: 3,
      question: "Is my personal information secure?",
      answer:
        "Yes, we take privacy seriously. Your personal information is encrypted and never shared with third parties without your consent. See our Privacy Policy for full details.",
      category: "privacy",
    },
    {
      id: 4,
      question: "How do I change my password?",
      answer:
        "Go to Settings > Change Password. Enter your current password and your new password. Make sure your new password is at least 6 characters long.",
      category: "account",
    },
    {
      id: 5,
      question: "Can I edit my listing after posting?",
      answer:
        "Yes, go to 'My Listings' and tap on the listing you want to edit. Make your changes and save. Updates will be reflected immediately.",
      category: "listing",
    },
    {
      id: 6,
      question: "How do I report inappropriate content?",
      answer:
        "If you see inappropriate content, tap the three dots menu on the listing and select 'Report'. Our team will review and take appropriate action within 24 hours.",
      category: "safety",
    },
    {
      id: 7,
      question: "What payment methods do you accept?",
      answer:
        "We accept M-Pesa, bank transfers, and major credit cards for premium listings and advertising services. All transactions are secure and encrypted.",
      category: "payment",
    },
    {
      id: 8,
      question: "How do I delete my account?",
      answer:
        "Go to Settings > Privacy Settings > Delete Account. Note that this action is permanent and cannot be undone. All your listings will be removed.",
      category: "account",
    },
    {
      id: 9,
      question: "Why isn't my listing showing up?",
      answer:
        "New listings are reviewed within 24 hours. If your listing isn't visible after this time, it may need additional information or photos. Check your email for feedback from our team.",
      category: "listing",
    },
    {
      id: 10,
      question: "How do I enable notifications?",
      answer:
        "Go to Settings > Notifications and toggle on the types of notifications you want to receive. You can customize alerts for new messages, listing updates, and more.",
      category: "settings",
    },
  ]

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Choose how you'd like to contact us:", [
      { text: "Call", onPress: () => Linking.openURL("tel:0706392061") },
      { text: "Email", onPress: () => Linking.openURL("mailto:info@exelarealtors.com") },
      {
        text: "WhatsApp",
        onPress: () => {
          const message = "Hello! I need help with the Exela Realtors Estate app."
          Linking.openURL(`whatsapp://send?phone=254706392061&text=${encodeURIComponent(message)}`).catch(() =>
            Alert.alert("WhatsApp not installed", "Please install WhatsApp to use this feature"),
          )
        },
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    searchContainer: {
      padding: 20,
      backgroundColor: colors.surface,
    },
    searchInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    faqContainer: {
      padding: 20,
    },
    faqItem: {
      backgroundColor: colors.surface,
      marginBottom: 10,
      borderRadius: 8,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    questionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
    },
    question: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },
    answer: {
      padding: 15,
      paddingTop: 0,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    categoryBadge: {
      backgroundColor: "#3B82F6",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    categoryText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "500",
      textTransform: "uppercase",
    },
    contactSection: {
      backgroundColor: colors.surface,
      margin: 20,
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    contactText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 15,
      lineHeight: 20,
    },
    contactButton: {
      backgroundColor: "#3B82F6",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    contactButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 8,
    },
    noResults: {
      textAlign: "center",
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 40,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help Center</Text>
        <Text style={styles.subtitle}>
          Find answers to common questions or contact our support team for personalized help.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.faqContainer}>
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <TouchableOpacity style={styles.questionContainer} onPress={() => toggleExpanded(item.id)}>
                <Text style={styles.question}>{item.question}</Text>
                <Ionicons
                  name={expandedItems[item.id] ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {expandedItems[item.id] && (
                <View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noResults}>
            No results found for "{searchQuery}". Try different keywords or contact support.
          </Text>
        )}
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still Need Help?</Text>
        <Text style={styles.contactText}>
          Can't find what you're looking for? Our support team is ready to help you with any questions about properties,
          technical issues, or account management.
        </Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
          <Ionicons name="headset" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

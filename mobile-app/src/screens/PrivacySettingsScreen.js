"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function PrivacySettingsScreen() {
  const { colors } = useTheme()
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    shareLocation: true,
    dataCollection: false,
    marketingEmails: false,
    analyticsTracking: true,
  })

  const handleToggle = async (setting) => {
    const newValue = !privacySettings[setting]
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: newValue,
    }))

    try {
      await AsyncStorage.setItem(`privacy_${setting}`, JSON.stringify(newValue))
    } catch (error) {
      console.error("Error saving privacy setting:", error)
    }
  }

  const handleClearData = () => {
    Alert.alert(
      "Clear Personal Data",
      "This will remove all your personal data from our servers. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: () => {
            Alert.alert("Data Cleared", "Your personal data has been cleared.")
          },
        },
      ],
    )
  }

  const handleDownloadData = () => {
    Alert.alert(
      "Download Data",
      "We will prepare your data for download and send you an email with the download link within 24 hours.",
      [{ text: "OK" }],
    )
  }

  const PrivacyItem = ({ icon, title, subtitle, value, onToggle, showToggle = true }) => (
    <View style={styles.privacyItem}>
      <View style={styles.privacyLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <View style={styles.privacyText}>
          <Text style={styles.privacyTitle}>{title}</Text>
          <Text style={styles.privacySubtitle}>{subtitle}</Text>
        </View>
      </View>
      {showToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
        />
      )}
    </View>
  )

  const styles = createStyles(colors)

  return (
    <ScrollView style={styles.container}>
      {/* Profile Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Privacy</Text>

        <PrivacyItem
          icon="person-outline"
          title="Profile Visibility"
          subtitle="Make your profile visible to other users"
          value={privacySettings.profileVisibility}
          onToggle={() => handleToggle("profileVisibility")}
        />

        <PrivacyItem
          icon="mail-outline"
          title="Show Email Address"
          subtitle="Display your email on your public profile"
          value={privacySettings.showEmail}
          onToggle={() => handleToggle("showEmail")}
        />

        <PrivacyItem
          icon="call-outline"
          title="Show Phone Number"
          subtitle="Display your phone number on your profile"
          value={privacySettings.showPhone}
          onToggle={() => handleToggle("showPhone")}
        />
      </View>

      {/* Communication Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication</Text>

        <PrivacyItem
          icon="chatbubble-outline"
          title="Allow Messages"
          subtitle="Let other users send you messages"
          value={privacySettings.allowMessages}
          onToggle={() => handleToggle("allowMessages")}
        />

        <PrivacyItem
          icon="location-outline"
          title="Share Location"
          subtitle="Share your location for better property recommendations"
          value={privacySettings.shareLocation}
          onToggle={() => handleToggle("shareLocation")}
        />
      </View>

      {/* Data Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Analytics</Text>

        <PrivacyItem
          icon="analytics-outline"
          title="Analytics Tracking"
          subtitle="Help us improve the app by sharing usage data"
          value={privacySettings.analyticsTracking}
          onToggle={() => handleToggle("analyticsTracking")}
        />

        <PrivacyItem
          icon="document-outline"
          title="Data Collection"
          subtitle="Allow collection of additional data for personalization"
          value={privacySettings.dataCollection}
          onToggle={() => handleToggle("dataCollection")}
        />

        <PrivacyItem
          icon="megaphone-outline"
          title="Marketing Emails"
          subtitle="Receive promotional emails and offers"
          value={privacySettings.marketingEmails}
          onToggle={() => handleToggle("marketingEmails")}
        />
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadData}>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Download My Data</Text>
            <Text style={styles.actionSubtitle}>Get a copy of all your data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.danger }]}>Clear Personal Data</Text>
            <Text style={styles.actionSubtitle}>Remove all your personal data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your privacy is important to us. These settings help you control how your information is used and shared.
        </Text>
      </View>
    </ScrollView>
  )
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      backgroundColor: colors.card,
      marginTop: 20,
      paddingVertical: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    privacyItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    privacyLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    privacyText: {
      marginLeft: 15,
      flex: 1,
    },
    privacyTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    privacySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionText: {
      marginLeft: 15,
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    actionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    footer: {
      padding: 20,
      marginTop: 20,
    },
    footerText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  })

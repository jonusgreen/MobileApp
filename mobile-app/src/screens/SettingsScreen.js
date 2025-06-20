"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import { useTheme } from "../context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function SettingsScreen({ navigation }) {
  const { currentUser } = useSelector((state) => state.user)
  const { colors, isDarkMode, toggleTheme } = useTheme()
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    locationServices: true,
    autoSync: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("appSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const handleToggle = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    }
    setSettings(newSettings)

    try {
      await AsyncStorage.setItem("appSettings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert("Account Deleted", "Your account has been deleted.")
        },
      },
    ])
  }

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  )

  const styles = createStyles(colors)

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => navigation.navigate("Profile")}
        />

        <SettingItem
          icon="key-outline"
          title="Change Password"
          subtitle="Update your password"
          onPress={() => navigation.navigate("ChangePassword")}
        />

        <SettingItem
          icon="shield-checkmark-outline"
          title="Privacy Settings"
          subtitle="Manage your privacy preferences"
          onPress={() => navigation.navigate("PrivacySettings")}
        />
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          subtitle="Receive notifications on your device"
          rightComponent={
            <Switch
              value={settings.notifications}
              onValueChange={() => handleToggle("notifications")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.notifications ? "#fff" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          icon="mail-outline"
          title="Email Alerts"
          subtitle="Receive updates via email"
          rightComponent={
            <Switch
              value={settings.emailAlerts}
              onValueChange={() => handleToggle("emailAlerts")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.emailAlerts ? "#fff" : "#f4f3f4"}
            />
          }
        />
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <SettingItem
          icon="location-outline"
          title="Location Services"
          subtitle="Allow app to access your location"
          rightComponent={
            <Switch
              value={settings.locationServices}
              onValueChange={() => handleToggle("locationServices")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.locationServices ? "#fff" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          subtitle="Switch to dark theme"
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
            />
          }
        />

        <SettingItem
          icon="sync-outline"
          title="Auto Sync"
          subtitle="Automatically sync your data"
          rightComponent={
            <Switch
              value={settings.autoSync}
              onValueChange={() => handleToggle("autoSync")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.autoSync ? "#fff" : "#f4f3f4"}
            />
          }
        />
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <SettingItem
          icon="help-circle-outline"
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => navigation.navigate("HelpCenter")}
        />

        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => navigation.navigate("TermsOfService")}
        />

        <SettingItem
          icon="shield-outline"
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => navigation.navigate("PrivacyPolicy")}
        />
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.danger }]}>Delete Account</Text>
            <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Estate App v1.0.0</Text>
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
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingText: {
      marginLeft: 15,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    dangerItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    footer: {
      padding: 20,
      alignItems: "center",
      marginTop: 20,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  })

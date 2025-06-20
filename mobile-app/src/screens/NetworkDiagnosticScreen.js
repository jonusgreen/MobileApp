"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Clipboard, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { testApiConnection, getApiConfig } from "../config/api"
import { useSelector } from "react-redux"

export default function NetworkDiagnosticScreen({ navigation }) {
  const { currentUser } = useSelector((state) => state.user)
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(false)
  const [apiConfig, setApiConfig] = useState(null)

  useEffect(() => {
    setApiConfig(getApiConfig())
  }, [])

  const addDiagnostic = (test, status, message, details = null) => {
    const timestamp = new Date().toLocaleTimeString()
    setDiagnostics((prev) => [...prev, { test, status, message, details, timestamp }])
  }

  const clearDiagnostics = () => {
    setDiagnostics([])
  }

  const runFullDiagnostic = async () => {
    setLoading(true)
    clearDiagnostics()

    addDiagnostic("Starting", "info", "Running comprehensive network diagnostic...")

    // Test 1: API Configuration
    addDiagnostic("Config", "info", `API Base URL: ${apiConfig?.baseUrl}`)
    addDiagnostic("Config", "info", `Host: ${apiConfig?.host}`)
    addDiagnostic("Config", "info", `Port: ${apiConfig?.port}`)

    // Test 2: Basic connectivity
    try {
      addDiagnostic("Connectivity", "testing", "Testing basic API connectivity...")
      const result = await testApiConnection()

      if (result.success) {
        addDiagnostic("Connectivity", "success", "✅ API server is reachable", result.data)
      } else {
        addDiagnostic("Connectivity", "error", "❌ Cannot reach API server", result.error)
      }
    } catch (error) {
      addDiagnostic("Connectivity", "error", "❌ Connection test failed", error.message)
    }

    // Test 3: User authentication status
    if (currentUser) {
      addDiagnostic("Auth", "info", `✅ User logged in: ${currentUser.username}`)
      addDiagnostic("Auth", "info", `User ID: ${currentUser._id}`)
      addDiagnostic("Auth", "info", `Token exists: ${currentUser.token ? "Yes" : "No"}`)
    } else {
      addDiagnostic("Auth", "warning", "⚠️ No user logged in")
    }

    // Test 4: Network recommendations
    addDiagnostic("Recommendations", "info", "💡 Troubleshooting steps:")
    addDiagnostic("Recommendations", "info", "1. Ensure backend server is running")
    addDiagnostic("Recommendations", "info", "2. Check IP address is correct")
    addDiagnostic("Recommendations", "info", "3. Verify same WiFi network")
    addDiagnostic("Recommendations", "info", "4. Test in browser first")

    setLoading(false)
  }

  const copyApiUrl = () => {
    Clipboard.setString(apiConfig?.baseUrl || "")
    Alert.alert("Copied", "API URL copied to clipboard")
  }

  const openInBrowser = () => {
    const testUrl = `${apiConfig?.baseUrl}/listing/stats`
    Linking.openURL(testUrl).catch(() => {
      Alert.alert("Error", "Cannot open browser")
    })
  }

  const showIpInstructions = () => {
    Alert.alert(
      "How to Find Your IP Address",
      `Current IP: ${apiConfig?.host}

Windows:
1. Open Command Prompt
2. Type: ipconfig
3. Look for "IPv4 Address" under your WiFi adapter

Mac:
1. Open Terminal
2. Type: ifconfig
3. Look for "inet" under en0 (WiFi)

Linux:
1. Open Terminal
2. Type: ip addr show
3. Look for your WiFi interface

The IP should be something like:
192.168.1.xxx or 10.0.0.xxx

Update the IP in mobile-app/src/config/api.js`,
      [{ text: "OK" }],
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      case "testing":
        return "🔄"
      default:
        return "ℹ️"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#4CAF50"
      case "error":
        return "#F44336"
      case "warning":
        return "#FF9800"
      case "testing":
        return "#2196F3"
      default:
        return "#757575"
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Network Diagnostic</Text>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Current Configuration</Text>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>API URL:</Text>
          <Text style={styles.configValue}>{apiConfig?.baseUrl}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={copyApiUrl}>
            <Text style={styles.smallButtonText}>Copy URL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={openInBrowser}>
            <Text style={styles.smallButtonText}>Test in Browser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={showIpInstructions}>
            <Text style={styles.smallButtonText}>IP Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.diagnosticButton, loading && styles.buttonDisabled]}
          onPress={runFullDiagnostic}
          disabled={loading}
        >
          <Text style={styles.diagnosticButtonText}>
            {loading ? "Running Diagnostic..." : "🔍 Run Full Diagnostic"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={clearDiagnostics}>
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Diagnostic Results:</Text>
        {diagnostics.map((item, index) => (
          <View key={index} style={styles.diagnosticItem}>
            <View style={styles.diagnosticHeader}>
              <Text style={[styles.diagnosticStatus, { color: getStatusColor(item.status) }]}>
                {getStatusIcon(item.status)} {item.test}
              </Text>
              <Text style={styles.diagnosticTime}>{item.timestamp}</Text>
            </View>
            <Text style={styles.diagnosticMessage}>{item.message}</Text>
            {item.details && (
              <Text style={styles.diagnosticDetails}>
                Details: {typeof item.details === "object" ? JSON.stringify(item.details, null, 2) : item.details}
              </Text>
            )}
          </View>
        ))}
        {diagnostics.length === 0 && (
          <Text style={styles.noResults}>No diagnostic results yet. Run a diagnostic to see results.</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 16,
  },
  configSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  configItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  configLabel: {
    fontWeight: "600",
    width: 80,
  },
  configValue: {
    flex: 1,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  smallButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  actionSection: {
    marginBottom: 15,
  },
  diagnosticButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  diagnosticButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  diagnosticItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  diagnosticHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  diagnosticStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  diagnosticTime: {
    fontSize: 12,
    color: "#666",
  },
  diagnosticMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  diagnosticDetails: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
})

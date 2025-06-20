"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { API_BASE_URL } from "../config/api"
import { useTheme } from "../context/ThemeContext"

// Fallback theme colors
const defaultTheme = {
  colors: {
    background: "#ffffff",
    surface: "#f8f9fa",
    primary: "#3B82F6",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    card: "#ffffff",
  },
}

export default function ContactScreen() {
  const themeContext = useTheme()
  const theme = themeContext && themeContext.theme ? themeContext.theme : defaultTheme

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/contact/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "info@exelarealtors.com",
          subject: formData.subject || "Support Request from Mobile App",
          message: formData.message,
          senderName: formData.name,
          senderEmail: formData.email,
          propertyName: "Mobile App Support Request",
        }),
      })

      const result = await response.json()

      if (result.success) {
        Alert.alert(
          "Message Sent Successfully!",
          "Thank you for contacting us! We will get back to you within 24 hours.",
          [
            {
              text: "OK",
              onPress: () => {
                setFormData({ name: "", email: "", subject: "", message: "" })
              },
            },
          ],
        )
      } else {
        throw new Error(result.message || "Failed to send message")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      Alert.alert(
        "Error",
        "Failed to send your message. Please try again or contact us directly at info@exelarealtors.com",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCall = () => {
    Linking.openURL("tel:0706392061")
  }

  const handleEmail = () => {
    Linking.openURL("mailto:info@exelarealtors.com")
  }

  const handleWhatsApp = () => {
    const message = "Hello! I need support with the Exela Realtors Estate app."
    const whatsappUrl = `whatsapp://send?phone=256706392061&text=${encodeURIComponent(message)}`
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("WhatsApp not installed", "Please install WhatsApp to use this feature")
    })
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    contactMethods: {
      backgroundColor: theme.colors.surface,
      marginTop: 20,
      paddingVertical: 10,
    },
    contactMethod: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    contactInfo: {
      marginLeft: 15,
      flex: 1,
    },
    contactLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    contactValue: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    form: {
      backgroundColor: theme.colors.surface,
      margin: 20,
      padding: 20,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
    textArea: {
      height: 120,
      paddingTop: 12,
      textAlignVertical: "top",
    },
    submitButton: {
      backgroundColor: isSubmitting ? theme.colors.textSecondary : "#3B82F6",
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    emergencySection: {
      backgroundColor: "#FEF3C7",
      margin: 20,
      padding: 15,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: "#F59E0B",
    },
    emergencyTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#92400E",
      marginBottom: 5,
    },
    emergencyText: {
      fontSize: 14,
      color: "#92400E",
      lineHeight: 20,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Get in Touch</Text>
        <Text style={styles.subtitle}>
          We're here to help! Reach out to us with any questions about properties, rentals, or technical support.
        </Text>
      </View>


      {/* Contact Methods */}
      <View style={styles.contactMethods}>
        <TouchableOpacity style={styles.contactMethod} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#3B82F6" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>0706392061</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactMethod} onPress={handleEmail}>
          <Ionicons name="mail" size={24} color="#3B82F6" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>info@exelarealtors.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactMethod} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactValue}>0706392061</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.contactMethod}>
          <Ionicons name="time" size={24} color="#3B82F6" />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Business Hours</Text>
            <Text style={styles.contactValue}>Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</Text>
          </View>
        </View>
      </View>

      {/* Contact Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Send us a Message</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder="Enter your full name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="your.email@example.com"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            value={formData.subject}
            onChangeText={(value) => handleInputChange("subject", value)}
            placeholder="What is this regarding?"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.message}
            onChangeText={(value) => handleInputChange("message", value)}
            placeholder="Please describe your inquiry in detail..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={5}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitButtonText}>{isSubmitting ? "Sending..." : "Send Message"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

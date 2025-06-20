"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native"
import { useSelector } from "react-redux"
import { apiCall } from "../config/api"
import { Ionicons } from "@expo/vector-icons"

export default function MessageScreen({ route, navigation }) {
  const { listingId, listingName, ownerId } = route.params
  const { currentUser } = useSelector((state) => state.user)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message")
      return
    }

    try {
      setLoading(true)
      const response = await apiCall(`/listing/inquire/${listingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          type: "message",
          message: message.trim(),
        }),
      })

      Alert.alert("Message Sent!", "Your message has been sent to the property owner.", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Error", "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inquiry</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{listingName}</Text>
          <Text style={styles.propertySubtitle}>Send a message to the property owner</Text>
        </View>

        <View style={styles.messageForm}>
          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Hi, I'm interested in this property..."
            multiline
            numberOfLines={6}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>{loading ? "Sending..." : "Send Message"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  propertyInfo: {
    marginBottom: 24,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  propertySubtitle: {
    fontSize: 16,
    color: "#666",
  },
  messageForm: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})

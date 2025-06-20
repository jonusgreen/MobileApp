"use client"

import { ScrollView, View, Text, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

const TermsOfServiceScreen = () => {
  const { colors } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    lastUpdated: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    paragraph: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 15,
      textAlign: "justify",
    },
    listItem: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 8,
      marginLeft: 15,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using Estate App, you accept and agree to be bound by the terms and provision of this
          agreement. If you do not agree to abide by the above, please do not use this service.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Estate App is a platform that connects property buyers, sellers, and renters. We provide tools for listing
          properties, searching for properties, and facilitating communication between parties.
        </Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>Users are responsible for:</Text>
        <Text style={styles.listItem}>• Providing accurate and truthful information</Text>
        <Text style={styles.listItem}>• Maintaining the confidentiality of account credentials</Text>
        <Text style={styles.listItem}>• Complying with all applicable laws and regulations</Text>
        <Text style={styles.listItem}>• Respecting the rights of other users</Text>

        <Text style={styles.sectionTitle}>4. Property Listings</Text>
        <Text style={styles.paragraph}>
          When creating property listings, users must provide accurate information including but not limited to:
          property details, pricing, location, and contact information. Misleading or fraudulent listings are prohibited
          and may result in account termination.
        </Text>

        <Text style={styles.sectionTitle}>5. Privacy and Data Protection</Text>
        <Text style={styles.paragraph}>
          We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect,
          use, and protect your personal information.
        </Text>

        <Text style={styles.sectionTitle}>6. Payment Terms</Text>
        <Text style={styles.paragraph}>
          Some features of Estate App may require payment. All fees are clearly disclosed before purchase. Payments are
          processed securely through third-party payment processors.
        </Text>

        <Text style={styles.sectionTitle}>7. Prohibited Activities</Text>
        <Text style={styles.paragraph}>Users are prohibited from:</Text>
        <Text style={styles.listItem}>• Posting false or misleading information</Text>
        <Text style={styles.listItem}>• Harassing or threatening other users</Text>
        <Text style={styles.listItem}>• Attempting to circumvent security measures</Text>
        <Text style={styles.listItem}>• Using the service for illegal activities</Text>

        <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of Estate App are owned by us and are protected by copyright,
          trademark, and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          Estate App shall not be liable for any indirect, incidental, special, consequential, or punitive damages
          resulting from your use of the service.
        </Text>

        <Text style={styles.sectionTitle}>10. Account Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to terminate or suspend accounts that violate these terms of service or engage in
          prohibited activities.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Users will be notified of significant changes, and
          continued use of the service constitutes acceptance of the modified terms.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.listItem}>• Email: legal@estateapp.com</Text>
        <Text style={styles.listItem}>• Phone: +1 (555) 123-4567</Text>
        <Text style={styles.listItem}>• Address: 123 Real Estate St, Property City, PC 12345</Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  )
}

export default TermsOfServiceScreen

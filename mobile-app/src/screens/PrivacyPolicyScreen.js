"use client"

import { ScrollView, View, Text, StyleSheet } from "react-native"
import { useTheme } from "../context/ThemeContext"

const PrivacyPolicyScreen = () => {
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
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>We collect information you provide directly to us, such as:</Text>
        <Text style={styles.listItem}>• Account information (name, email, phone number)</Text>
        <Text style={styles.listItem}>• Property listing details</Text>
        <Text style={styles.listItem}>• Profile information and preferences</Text>
        <Text style={styles.listItem}>• Communication records</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use the information we collect to:</Text>
        <Text style={styles.listItem}>• Provide and maintain our services</Text>
        <Text style={styles.listItem}>• Process transactions and send notifications</Text>
        <Text style={styles.listItem}>• Improve our services and user experience</Text>
        <Text style={styles.listItem}>• Communicate with you about our services</Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
          except as described in this policy. We may share information:
        </Text>
        <Text style={styles.listItem}>• With service providers who assist in our operations</Text>
        <Text style={styles.listItem}>• When required by law or to protect our rights</Text>
        <Text style={styles.listItem}>• In connection with a business transfer</Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal information against unauthorized access,
          alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as necessary to provide our services and fulfill the purposes
          outlined in this policy, unless a longer retention period is required by law.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
        <Text style={styles.paragraph}>You have the right to:</Text>
        <Text style={styles.listItem}>• Access and update your personal information</Text>
        <Text style={styles.listItem}>• Delete your account and associated data</Text>
        <Text style={styles.listItem}>• Opt out of marketing communications</Text>
        <Text style={styles.listItem}>• Request a copy of your data</Text>

        <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide
          personalized content. You can control cookie settings through your device preferences.
        </Text>

        <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Our app may contain links to third-party websites or services. We are not responsible for the privacy
          practices of these third parties. We encourage you to review their privacy policies.
        </Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for children under 13 years of age. We do not knowingly collect personal
          information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and processed in countries other than your own. We ensure appropriate
          safeguards are in place to protect your data.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any material changes by posting the
          new policy on this page and updating the "Last updated" date.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>If you have any questions about this Privacy Policy, please contact us:</Text>
        <Text style={styles.listItem}>• Email: privacy@estateapp.com</Text>
        <Text style={styles.listItem}>• Phone: +1 (555) 123-4567</Text>
        <Text style={styles.listItem}>• Address: 123 Real Estate St, Property City, PC 12345</Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  )
}

export default PrivacyPolicyScreen

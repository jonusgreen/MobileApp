"use client"

import { useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector, useDispatch } from "react-redux"
import { Ionicons } from "@expo/vector-icons"
import { signOutUserStart, signOutUserSuccess, signOutUserFailure } from "../redux/user/userSlice"
import { apiCall } from "../config/api"

const { width } = Dimensions.get("window")
const MENU_WIDTH = width * 0.75

export default function HamburgerMenu({ isVisible, onClose }) {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isVisible, slideAnim, fadeAnim])

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart())
      await apiCall("/auth/signout", "GET") // Changed from "POST" to "GET"
      dispatch(signOutUserSuccess())
      onClose()
      navigation.navigate("Home")
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
    }
  }

  const navigateTo = (screen) => {
    onClose()
    navigation.navigate(screen)
  }

  const handleAuthRequiredNavigation = (screen, featureName) => {
    if (currentUser) {
      navigateTo(screen)
    } else {
      onClose()
      Alert.alert(
        "Sign In Required",
        `Please sign in to access ${featureName}. Join Estate App to unlock all features!`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => navigateTo("SignIn"),
          },
        ],
      )
    }
  }

  if (!isVisible) return null

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView>
          {/* User Info Section */}
          <View style={styles.userSection}>
            <Image
              source={{ uri: currentUser?.avatar || "https://via.placeholder.com/100" }}
              style={styles.userAvatar}
            />
            <Text style={styles.userName}>{currentUser ? currentUser.username : "Guest User"}</Text>
            <Text style={styles.userEmail}>{currentUser ? currentUser.email : "Sign in to access all features"}</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Home")}>
              <Ionicons name="home-outline" size={24} color="#4B5563" />
              <Text style={styles.menuItemText}>Home</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Search")}>
              <Ionicons name="search-outline" size={24} color="#4B5563" />
              <Text style={styles.menuItemText}>Search Properties</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, !currentUser && styles.authRequiredItem]}
              onPress={() => handleAuthRequiredNavigation("Create", "Sell My Home")}
            >
              <Ionicons name="home" size={24} color={currentUser ? "#4B5563" : "#9CA3AF"} />
              <Text style={[styles.menuItemText, !currentUser && styles.authRequiredText]}>
                Sell My Home
                {!currentUser && <Text style={styles.lockIcon}> 🔒</Text>}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Search")}>
              <Ionicons name="key-outline" size={24} color="#4B5563" />
              <Text style={styles.menuItemText}>Buy Properties</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, !currentUser && styles.authRequiredItem]}
              onPress={() => handleAuthRequiredNavigation("RentalManagement", "Manage Rentals")}
            >
              <Ionicons name="business" size={24} color={currentUser ? "#4B5563" : "#9CA3AF"} />
              <Text style={[styles.menuItemText, !currentUser && styles.authRequiredText]}>
                Manage Rentals
                {!currentUser && <Text style={styles.lockIcon}> 🔒</Text>}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {currentUser && (
              <>
                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("MyListings")}>
                  <Ionicons name="list-outline" size={24} color="#4B5563" />
                  <Text style={styles.menuItemText}>My Listings</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Advertise")}>
                  <Ionicons name="megaphone-outline" size={24} color="#4B5563" />
                  <Text style={styles.menuItemText}>Advertise</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("About")}>
              <Ionicons name="information-circle-outline" size={24} color="#4B5563" />
              <Text style={styles.menuItemText}>About Us</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Contact")}>
              <Ionicons name="call-outline" size={24} color="#4B5563" />
              <Text style={styles.menuItemText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Settings")}>
              <Ionicons name="settings-outline" size={24} color="#4B5563" />
              <Text style={styles.menuItemText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {currentUser ? (
              <TouchableOpacity style={[styles.menuItem, styles.signOutItem]} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.menuItem, styles.signInItem]} onPress={() => navigateTo("SignIn")}>
                <Ionicons name="log-in-outline" size={24} color="#3B82F6" />
                <Text style={[styles.menuItemText, styles.signInText]}>Sign In</Text>
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Estate App v1.0.0</Text>
          <Text style={styles.footerSubtext}>Your trusted property partner</Text>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userSection: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#E5E7EB",
    textAlign: "center",
  },
  menuItems: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#4B5563",
    flex: 1,
  },
  authRequiredItem: {
    opacity: 0.7,
  },
  authRequiredText: {
    color: "#9CA3AF",
  },
  lockIcon: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  signOutItem: {
    marginTop: 10,
  },
  signOutText: {
    color: "#EF4444",
  },
  signInItem: {
    marginTop: 10,
  },
  signInText: {
    color: "#3B82F6",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  footerSubtext: {
    fontSize: 10,
    color: "#D1D5DB",
    marginTop: 2,
  },
})

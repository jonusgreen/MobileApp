import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Provider } from "react-redux"
import { store } from "./src/redux/store"
import { Ionicons } from "@expo/vector-icons"

// Import screens
import HomeScreen from "./src/screens/HomeScreen"
import SignInScreen from "./src/screens/SignInScreen"
import SignUpScreen from "./src/screens/SignUpScreen"
import MyListingsScreen from "./src/screens/MyListingsScreen"
import SearchScreen from "./src/screens/SearchScreen"
import CreateListingScreen from "./src/screens/CreateListingScreen"
import EditListingScreen from "./src/screens/EditListingScreen"
import ListingDetailScreen from "./src/screens/ListingDetailScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen"
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen"
import RentalManagementScreen from "./src/screens/RentalManagementScreen"
import AboutScreen from "./src/screens/AboutScreen"
import AdvertiseScreen from "./src/screens/AdvertiseScreen"
import ContactScreen from "./src/screens/ContactScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen"
import PrivacySettingsScreen from "./src/screens/PrivacySettingsScreen"
import HelpCenterScreen from "./src/screens/HelpCenterScreen"
import TermsOfServiceScreen from "./src/screens/TermsOfServiceScreen"
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen"
import { ThemeProvider } from "./src/context/ThemeContext"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Stack Navigator for Home Tab
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: "Property Details" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: "About Us" }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact Support" }} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ title: "Help Center" }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ title: "Terms of Service" }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: "Privacy Policy" }} />
    </Stack.Navigator>
  )
}

// Stack Navigator for Search Tab
function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: "Property Details" }} />
    </Stack.Navigator>
  )
}

// Stack Navigator for Create Tab
function CreateStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="CreateMain" component={CreateListingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Advertise" component={AdvertiseScreen} options={{ title: "Advertise" }} />
      <Stack.Screen
        name="RentalManagement"
        component={RentalManagementScreen}
        options={{ title: "Rental Management" }}
      />
    </Stack.Navigator>
  )
}

// Stack Navigator for My Listings Tab
function MyListingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="MyListingsMain" component={MyListingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditListing" component={EditListingScreen} options={{ title: "Edit Listing" }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: "Property Details" }} />
    </Stack.Navigator>
  )
}

// Stack Navigator for Settings Tab
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change Password" }} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: "Privacy Settings" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ title: "Help Center" }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact Support" }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: "About Us" }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ title: "Terms of Service" }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: "Privacy Policy" }} />
    </Stack.Navigator>
  )
}

// Main Tab Navigator with 5 tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline"
          } else if (route.name === "Create") {
            iconName = focused ? "add-circle" : "add-circle-outline"
          } else if (route.name === "MyListings") {
            iconName = focused ? "list" : "list-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ tabBarLabel: "Search" }} />
      <Tab.Screen name="Create" component={CreateStack} options={{ tabBarLabel: "Sell" }} />
      <Tab.Screen name="MyListings" component={MyListingsStack} options={{ tabBarLabel: "My Listings" }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ tabBarLabel: "Settings" }} />
    </Tab.Navigator>
  )
}

// Main App Navigator (for auth screens and modals)
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: "#3B82F6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

      {/* Auth screens without bottom tabs */}
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          title: "Sign In",
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          title: "Sign Up",
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: "Forgot Password",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          title: "Reset Password",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  )
}

"use client"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("darkMode")
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme))
      }
    } catch (error) {
      console.error("Error loading theme:", error)
    }
  }

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode
      setIsDarkMode(newTheme)
      await AsyncStorage.setItem("darkMode", JSON.stringify(newTheme))
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

const lightColors = {
  background: "#ffffff",
  surface: "#f8f9fa",
  primary: "#3B82F6",
  text: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  card: "#ffffff",
  danger: "#EF4444",
  success: "#10B981",
}

const darkColors = {
  background: "#1f2937",
  surface: "#374151",
  primary: "#60A5FA",
  text: "#f9fafb",
  textSecondary: "#d1d5db",
  border: "#4b5563",
  card: "#374151",
  danger: "#F87171",
  success: "#34D399",
}

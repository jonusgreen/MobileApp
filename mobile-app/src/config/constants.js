// API Configuration
const __DEV__ = process.env.NODE_ENV === "development" // Declare the __DEV__ variable
export const API_BASE_URL = __DEV__
  ? "http://192.168.100.26:3000/api" // Development URL
  : "https://your-production-api.com/api" // Production URL

// App Configuration
export const APP_NAME = "Estate App"
export const APP_VERSION = "1.0.0"

// Image Upload Configuration
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]

// Pagination
export const LISTINGS_PER_PAGE = 10

// Cache Configuration
export const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

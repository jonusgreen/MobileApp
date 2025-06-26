import AsyncStorage from "@react-native-async-storage/async-storage"

// ⚠️ IMPORTANT: Update this IP address to match your computer's IP
const API_BASE_URL = "http://192.168.100.26:3000/api" // 👈 Change this IP!

const MAX_RETRIES = 3
const TIMEOUT_MS = 10000

const API_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  // Add more endpoints as needed
}

// Get API configuration
export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  timeout: TIMEOUT_MS,
  maxRetries: MAX_RETRIES,
})

// Enhanced timeout wrapper
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeoutMs)),
  ])
}

// Get auth token
const getAuthToken = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("user")
    if (userDataString) {
      const userData = JSON.parse(userDataString)
      return userData.token || userData.access_token || userData.accessToken
    }
  } catch (error) {
    // Silent fail for token retrieval
  }
  return null
}

// Enhanced API call function with better error handling
export const apiCall = async (endpoint, methodOrOptions = {}, bodyData = null) => {
  const url = `${API_BASE_URL}${endpoint}`

  // Handle both old and new calling patterns
  let method,
    data,
    headers = {}

  if (typeof methodOrOptions === "string") {
    // Old pattern: apiCall(endpoint, method, data)
    method = methodOrOptions
    data = bodyData
  } else {
    // New pattern: apiCall(endpoint, options)
    method = methodOrOptions.method || "GET"
    data = methodOrOptions.body || methodOrOptions.data
    headers = methodOrOptions.headers || {}
  }

  console.log(`🌐 API Call: ${method} ${url}`)
  if (data) {
    console.log(`📤 Request Data:`, data)
  }

  // Get auth token
  const token = await getAuthToken()

  // Default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // Add auth header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  // Merge headers
  const finalHeaders = {
    ...defaultHeaders,
    ...headers,
  }

  const fetchOptions = {
    method,
    headers: finalHeaders,
  }

  // Add body for POST/PUT requests
  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    fetchOptions.body = typeof data === "string" ? data : JSON.stringify(data)
  }

  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${MAX_RETRIES}: ${method} ${url}`)

      const response = await withTimeout(fetch(url, fetchOptions), TIMEOUT_MS)

      console.log(`📊 Response Status: ${response.status}`)

      // Check if response is HTML (wrong server)
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        throw new Error(`❌Check if API server is running at ${API_BASE_URL}`)
      }

      // Handle different response types
      let responseData
      try {
        const responseText = await response.text()
        console.log(`📝 Response preview: ${responseText.substring(0, 200)}...`)

        // Try to parse as JSON
        if (responseText) {
          responseData = JSON.parse(responseText)
        } else {
          responseData = {}
        }
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError)
        throw new Error("Invalid JSON response from server")
      }

      // Handle HTTP errors
      if (!response.ok) {
        console.error(`❌ HTTP Error ${response.status}:`, responseData)
        if (response.status === 401) {
          throw new Error("Authentication failed")
        } else if (response.status === 404) {
          throw new Error("API endpoint not found")
        } else if (response.status === 500) {
          throw new Error("Server internal error")
        } else {
          throw new Error(responseData.message || `HTTP ${response.status}`)
        }
      }

      console.log(`✅ API Success: ${method} ${endpoint}`)
      return responseData
    } catch (error) {
      lastError = error
      console.error(`❌API Error (Attempt ${attempt}):`, error.message)

      // Don't retry for certain errors
      if (error.message.includes("Authentication failed") || error.message.includes("not found")) {
        break
      }

      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const waitTime = attempt * 1000
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  console.error(`❌ All API attempts failed for ${method} ${endpoint}`)
  throw lastError
}

// Test API connectivity
export const testApiConnection = async () => {
  try {
    console.log("🧪 Testing API connection...")
    console.log(`🎯 Target URL: ${API_BASE_URL}/listing/stats`)

    const response = await apiCall("/listing/stats")
    console.log("✅ API connection successful:", response)
    return { success: true, data: response }
  } catch (error) {
    console.error("❌ API connection failed:", error.message)
    return { success: false, error: error.message }
  }
}

// Export API functions
export const login = async (credentials) => {
  return apiCall(API_ENDPOINTS.login, "POST", credentials)
}

export const register = async (userData) => {
  return apiCall(API_ENDPOINTS.register, "POST", userData)
}

// Add more API functions as needed

export default apiCall

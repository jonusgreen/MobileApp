import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to load .env from multiple possible locations
const envPaths = [
  path.join(__dirname, "..", ".env"), // api/.env
  path.join(__dirname, "..", "..", ".env"), // root/.env
  path.join(process.cwd(), ".env"), // current working directory
]

let envLoaded = false
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath })
    if (!result.error) {
      console.log(`✅ Environment file loaded from: ${envPath}`)
      envLoaded = true
      break
    }
  } catch (error) {
    // Continue to next path
  }
}

if (!envLoaded) {
  console.log("⚠️ No .env file found, trying default dotenv.config()")
  dotenv.config()
}

// Check if JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not found in environment variables!")
  process.exit(1)
}

// Get user ID from command line arguments or use a default
const userId = process.argv[2] || "123456789012345678901234"
const isAdmin = process.argv[3] === "true" || true

// Generate token
const token = jwt.sign(
  {
    id: userId,
    isAdmin: isAdmin,
  },
  process.env.JWT_SECRET,
  { expiresIn: "30d" },
)

console.log("\n=== JWT TOKEN GENERATOR ===")
console.log(`User ID: ${userId}`)
console.log(`Is Admin: ${isAdmin}`)
console.log("\nGenerated Token:")
console.log(token)
console.log("\nUse this token in the AdminUsers component")

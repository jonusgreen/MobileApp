import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js"
import authRouter from "./routes/auth.route.js"
import listingRouter from "./routes/listing.route.js"
import contactRouter from "./routes/contact.route.js"
import debugRouter from "./routes/debug.route.js"
// import uploadRouter from "./routes/upload.route.js"  // Temporarily disabled until multer is installed
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// MongoDB connection with better error handling for Atlas
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas!")
    console.log("Database:", mongoose.connection.name)
  })
  .catch((err) => {
    console.error("❌ MongoDB Atlas connection error:", err.message)
    process.exit(1)
  })

// Monitor connection
mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose connected to MongoDB Atlas")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from MongoDB Atlas")
})

const app = express()

app.use(express.json())
app.use(cookieParser())

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Session-ID",
  )
  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Register all routes BEFORE starting the server
app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/listing", listingRouter)
app.use("/api/contact", contactRouter)
app.use("/api/debug", debugRouter)
// app.use("/api/upload", uploadRouter)  // Temporarily disabled until multer is installed

// Temporary upload endpoint that returns a placeholder
app.post("/api/upload", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Upload endpoint temporarily disabled. Install multer to enable.",
    url: "https://ui-avatars.com/api/?name=User&size=200&background=3B82F6&color=fff&rounded=true&format=png",
    imageUrl: "https://ui-avatars.com/api/?name=User&size=200&background=3B82F6&color=fff&rounded=true&format=png",
  })
})

// Error handling middleware should be LAST
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})

// Start server AFTER all middleware and routes are registered
app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000!")
  console.log("📊 Database: MongoDB Atlas")

})

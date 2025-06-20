import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// Upload single image for profile
router.post("/", verifyToken, upload.single("image"), (req, res) => {
  try {
    console.log("📤 Upload request received")
    console.log("File:", req.file)
    console.log("Body:", req.body)

    if (!req.file) {
      console.log("❌ No file provided")
      return res.status(400).json({ success: false, message: "No image file provided" })
    }

    // Return the image URL
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    console.log("✅ Upload successful:", imageUrl)

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error("❌ Error uploading image:", error)
    res.status(500).json({ success: false, message: "Failed to upload image" })
  }
})

// Legacy route for compatibility
router.post("/image", verifyToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" })
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.status(500).json({ success: false, message: "Failed to upload image" })
  }
})

export default router

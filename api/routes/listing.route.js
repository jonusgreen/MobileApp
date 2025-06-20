import express from "express"
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  getListingStats,
  getRecentListings,
  approveListing,
  rejectListing,
  bulkApproveListings,
  likeListing,
  saveListing,
  trackView,
  createInquiry,
  getUserInteractions,
  getOwnerContact,
} from "../controllers/listing.controller.js"
import { verifyToken, optionalAuth } from "../utils/verifyUser.js"

const router = express.Router()

// Public routes - no authentication required
router.get("/get", optionalAuth, getListings)
router.get("/get/:id", optionalAuth, getListing)

// Stats routes - optional authentication for debugging
router.get("/stats", optionalAuth, getListingStats)
router.get("/recent", optionalAuth, getRecentListings)

// Contact route - get owner contact info
router.get("/contact/:id", optionalAuth, getOwnerContact)

// Protected routes - authentication required
router.post("/create", verifyToken, createListing)
router.delete("/delete/:id", verifyToken, deleteListing)
router.post("/update/:id", verifyToken, updateListing) // This is POST, not PUT

// Admin routes
router.post("/approve/:id", verifyToken, approveListing)
router.post("/reject/:id", verifyToken, rejectListing)
router.post("/bulk-approve", verifyToken, bulkApproveListings)

// New interaction routes
router.post("/like/:id", verifyToken, likeListing)
router.post("/save/:id", verifyToken, saveListing)
router.post("/view/:id", optionalAuth, trackView)
router.post("/inquire/:id", verifyToken, createInquiry)
router.get("/user-interactions", verifyToken, getUserInteractions)

export default router

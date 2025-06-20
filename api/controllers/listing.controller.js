import Listing from "../models/listing.model.js"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import mongoose from "mongoose"

export const createListing = async (req, res, next) => {
  try {
    console.log("=== CREATE LISTING DEBUG ===")
    console.log("Request headers:", req.headers)
    console.log("User from token:", req.user)
    console.log("Request body:", req.body)

    // Check if user is authenticated
    if (!req.user) {
      console.log("❌ No user found in request")
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in to create a listing.",
      })
    }

    console.log("✅ User authenticated:", req.user.id)

    // Validate required fields
    const requiredFields = ["name", "description", "address", "regularPrice", "imageUrls"]
    for (const field of requiredFields) {
      if (!req.body[field]) {
        console.log(`❌ Missing required field: ${field}`)
        return res.status(400).json({ success: false, message: `${field} is required` })
      }
    }

    // Ensure imageUrls is not empty
    if (!req.body.imageUrls || req.body.imageUrls.length === 0) {
      console.log("❌ No images provided")
      return res.status(400).json({ success: false, message: "At least one image is required" })
    }

    console.log("✅ All required fields validated")

    // Create the listing (default approved to false unless user is admin)
    const isAdmin = req.user && req.user.isAdmin
    const listingData = {
      ...req.body,
      approved: isAdmin ? true : false, // Auto-approve if admin is creating the listing
      userRef: req.user.id, // Ensure userRef is set to the current user
      approvedAt: isAdmin ? new Date() : null,
      approvedBy: isAdmin ? req.user.id : null,
      // Initialize interaction fields
      views: 0,
      likes: 0,
      saves: 0,
      inquiries: 0,
      likedBy: [],
      savedBy: [],
      viewedBy: [],
      anonymousViews: [],
      inquiriesData: [],
    }

    console.log("Creating listing with data:", listingData)

    const listing = await Listing.create(listingData)

    console.log(
      `✅ Listing created successfully: ${listing.name}, ID: ${listing._id}, Type: ${listing.type}, Approved: ${listing.approved}`,
    )

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing: listing,
    })
  } catch (error) {
    console.error("❌ Error creating listing:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ success: false, message: messages.join(", ") })
    }
    next(error)
  }
}

export const deleteListing = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    // Allow admin to delete any listing OR user to delete their own
    if (req.user && req.user.id !== listing.userRef && !req.user.isAdmin) {
      return next(errorHandler(401, "You can only delete your own listings or you must be an admin!"))
    }

    await Listing.findByIdAndDelete(req.params.id)
    console.log(`Listing deleted: ${req.params.id} by ${req.user.isAdmin ? "admin" : "user"} ${req.user.id}`)
    res.status(200).json({ success: true, message: "Listing has been deleted" })
  } catch (error) {
    console.error("Error deleting listing:", error)
    next(error)
  }
}

export const updateListing = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    // Allow admin to update any listing OR user to update their own
    if (req.user && req.user.id !== listing.userRef && !req.user.isAdmin) {
      return next(errorHandler(401, "You can only update your own listings or you must be an admin!"))
    }

    // If a non-admin is updating, don't allow them to change the approved status
    if (!req.user.isAdmin && req.body.hasOwnProperty("approved")) {
      delete req.body.approved
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true })
    console.log(`Listing updated: ${updatedListing.name} by ${req.user.isAdmin ? "admin" : "user"} ${req.user.id}`)
    res.status(200).json(updatedListing)
  } catch (error) {
    console.error("Error updating listing:", error)
    next(error)
  }
}

export const getListing = async (req, res, next) => {
  try {
    console.log(`Fetching listing with ID: ${req.params.id}`)

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    // Enhanced view tracking for all visitors
    const shouldTrackView = !req.query.admin // Don't track admin panel views

    if (shouldTrackView) {
      let viewTracked = false

      if (req.user) {
        // Authenticated user - track unique daily views
        const userId = req.user.id
        const today = new Date().toDateString()
        const alreadyViewedToday = listing.viewedBy.some(
          (view) => view.userId === userId && new Date(view.timestamp).toDateString() === today,
        )

        if (!alreadyViewedToday) {
          listing.viewedBy.push({
            userId,
            timestamp: new Date(),
            userAgent: req.headers["user-agent"] || "Unknown",
            ip: req.ip || req.connection.remoteAddress || "Unknown",
          })
          listing.views += 1
          viewTracked = true
        }
      } else {
        // Anonymous user - track by IP and session
        const visitorIP = req.ip || req.connection.remoteAddress || "Unknown"
        const userAgent = req.headers["user-agent"] || "Unknown"
        const sessionId = req.headers["x-session-id"] || `${visitorIP}-${userAgent}`

        // Check if this IP/session viewed in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const alreadyViewedRecently = listing.anonymousViews.some(
          (view) => view.sessionId === sessionId && new Date(view.timestamp) > oneDayAgo,
        )

        if (!alreadyViewedRecently) {
          // Clean old anonymous views (older than 30 days)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          listing.anonymousViews = listing.anonymousViews.filter((view) => new Date(view.timestamp) > thirtyDaysAgo)

          listing.anonymousViews.push({
            sessionId,
            ip: visitorIP,
            userAgent,
            timestamp: new Date(),
          })
          listing.views += 1
          viewTracked = true
        }
      }

      if (viewTracked) {
        await listing.save()
        console.log(`View tracked for listing ${listing.name}. Total views: ${listing.views}`)
      }
    }

    // Add user interaction data
    const userInteractions = { liked: false, saved: false }
    if (req.user) {
      userInteractions.liked = listing.likedBy.some((like) => like.userId === req.user.id)
      userInteractions.saved = listing.savedBy.some((save) => save.userId === req.user.id)
    }

    const listingWithInteractions = {
      ...listing.toObject(),
      userInteractions,
    }

    res.status(200).json(listingWithInteractions)
  } catch (error) {
    console.error(`Error fetching listing: ${error.message}`)
    next(error)
  }
}

export const getListings = async (req, res, next) => {
  try {
    console.log("Fetching listings with query:", req.query)
    console.log("User in request:", req.user ? `ID: ${req.user.id}, Admin: ${req.user.isAdmin}` : "No user")

    const limit = Number.parseInt(req.query.limit) || 9
    const startIndex = Number.parseInt(req.query.startIndex) || 0

    // Build query object
    const query = {}

    // Simplified approval logic - show all approved listings by default
    if (req.user && req.user.isAdmin) {
      // Admin can see all listings unless specifically filtering
      if (req.query.approved !== undefined) {
        query.approved = req.query.approved === "true"
      }
      console.log("Admin user - showing based on query params")
    } else if (req.query.userRef && req.user && req.query.userRef === req.user.id) {
      // User viewing their own listings - show all their listings
      query.userRef = req.query.userRef
      console.log("User viewing own listings")
    } else {
      // Public/general view - ALWAYS show only approved listings
      query.approved = true
      console.log("Public view - showing ALL approved listings")
    }

    // Handle other filters
    if (req.query.offer === "true") {
      query.offer = true
    }

    if (req.query.furnished === "true") {
      query.furnished = true
    }

    if (req.query.parking === "true") {
      query.parking = true
    }

    if (req.query.type && req.query.type !== "all") {
      query.type = req.query.type
    }

    if (req.query.searchTerm) {
      query.name = { $regex: req.query.searchTerm, $options: "i" }
    }

    console.log("Final query:", JSON.stringify(query))

    // Sort
    const sort = {}
    const sortField = req.query.sort || "createdAt"
    const sortOrder = req.query.order === "asc" ? 1 : -1
    sort[sortField] = sortOrder

    const listings = await Listing.find(query).sort(sort).limit(limit).skip(startIndex)
    const total = await Listing.countDocuments(query)

    console.log(`Found ${listings.length} listings out of ${total} total`)

    return res.status(200).json(listings)
  } catch (error) {
    console.error(`Error fetching listings: ${error.message}`)
    next(error)
  }
}

// Get owner contact information
export const getOwnerContact = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    // Get owner information
    const owner = await User.findById(listing.userRef).select("email phone username")
    if (!owner) {
      return next(errorHandler(404, "Owner not found"))
    }

    // Return contact information
    res.status(200).json({
      email: owner.email,
      phone: owner.phone || null,
      name: owner.username,
    })
  } catch (error) {
    console.error("Error getting owner contact:", error)
    next(error)
  }
}

// Approve a listing (admin only)
export const approveListing = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Only administrators can approve listings"))
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user.id,
        rejectionReason: null, // Clear any previous rejection reason
      },
      { new: true },
    )

    console.log(`Listing approved: ${updatedListing.name} by admin ${req.user.id}`)
    res.status(200).json(updatedListing)
  } catch (error) {
    console.error("Error approving listing:", error)
    next(error)
  }
}

// Reject a listing (admin only)
export const rejectListing = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Only administrators can reject listings"))
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const { reason } = req.body

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        approved: false,
        rejectionReason: reason || "Rejected by administrator",
        approvedAt: null,
        approvedBy: null,
      },
      { new: true },
    )

    console.log(`Listing rejected: ${updatedListing.name} by admin ${req.user.id}`)
    res.status(200).json(updatedListing)
  } catch (error) {
    console.error("Error rejecting listing:", error)
    next(error)
  }
}

// Bulk approve all listings (admin only)
export const bulkApproveListings = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Only administrators can bulk approve listings"))
    }

    const result = await Listing.updateMany(
      { approved: { $ne: true } },
      {
        approved: true,
        approvedAt: new Date(),
        approvedBy: req.user.id,
        rejectionReason: null,
      },
    )

    console.log(`Bulk approved ${result.modifiedCount} listings by admin ${req.user.id}`)
    res.status(200).json({
      message: `Successfully approved ${result.modifiedCount} listings`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error bulk approving listings:", error)
    next(error)
  }
}

export const getListingStats = async (req, res, next) => {
  try {
    console.log("Getting listing stats")

    const total = await Listing.countDocuments()
    const active = await Listing.countDocuments({ approved: true })
    const forRent = await Listing.countDocuments({ type: "rent", approved: true })
    const forSale = await Listing.countDocuments({ type: "sale", approved: true })
    const pendingApproval = await Listing.countDocuments({ approved: false })

    const revenueData = await Listing.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: null,
          total: { $sum: "$regularPrice" },
        },
      },
    ])

    const revenue = revenueData.length > 0 ? revenueData[0].total : 0

    console.log(
      `Stats - Total: ${total}, Active: ${active}, For Rent: ${forRent}, For Sale: ${forSale}, Pending: ${pendingApproval}`,
    )

    res.status(200).json({
      total,
      active,
      forRent,
      forSale,
      pendingApproval,
      revenue,
    })
  } catch (error) {
    console.error("Error in getListingStats:", error)
    next(error)
  }
}

export const getRecentListings = async (req, res, next) => {
  try {
    console.log("Getting recent listings")

    const query = req.user && req.user.isAdmin ? {} : { approved: true }
    const recentListings = await Listing.find(query).sort({ createdAt: -1 }).limit(5)

    console.log(`Found ${recentListings.length} recent listings`)
    res.status(200).json(recentListings)
  } catch (error) {
    console.error("Error in getRecentListings:", error)
    next(error)
  }
}

// Like/Unlike a listing
export const likeListing = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const userId = req.user.id
    const userIndex = listing.likedBy.findIndex((like) => like.userId === userId)

    if (userIndex === -1) {
      // User hasn't liked this listing yet, add like
      listing.likedBy.push({ userId, timestamp: new Date() })
      listing.likes = listing.likedBy.length
      await listing.save()
      return res.status(200).json({ liked: true, likes: listing.likes })
    } else {
      // User already liked this listing, remove like
      listing.likedBy.splice(userIndex, 1)
      listing.likes = listing.likedBy.length
      await listing.save()
      return res.status(200).json({ liked: false, likes: listing.likes })
    }
  } catch (error) {
    next(error)
  }
}

// Save/Unsave a listing
export const saveListing = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const userId = req.user.id
    const userIndex = listing.savedBy.findIndex((save) => save.userId === userId)

    if (userIndex === -1) {
      // User hasn't saved this listing yet, add save
      listing.savedBy.push({ userId, timestamp: new Date() })
      listing.saves = listing.savedBy.length
      await listing.save()
      return res.status(200).json({ saved: true, saves: listing.saves })
    } else {
      // User already saved this listing, remove save
      listing.savedBy.splice(userIndex, 1)
      listing.saves = listing.savedBy.length
      await listing.save()
      return res.status(200).json({ saved: false, saves: listing.saves })
    }
  } catch (error) {
    next(error)
  }
}

// Enhanced track view function
export const trackView = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    let viewTracked = false

    if (req.user) {
      // Authenticated user - track unique daily views
      const userId = req.user.id
      const today = new Date().toDateString()
      const alreadyViewedToday = listing.viewedBy.some(
        (view) => view.userId === userId && new Date(view.timestamp).toDateString() === today,
      )

      if (!alreadyViewedToday) {
        listing.viewedBy.push({
          userId,
          timestamp: new Date(),
          userAgent: req.headers["user-agent"] || "Unknown",
          ip: req.ip || req.connection.remoteAddress || "Unknown",
        })
        listing.views += 1
        viewTracked = true
      }
    } else {
      // Anonymous user - track by IP and session
      const visitorIP = req.ip || req.connection.remoteAddress || "Unknown"
      const userAgent = req.headers["user-agent"] || "Unknown"
      const sessionId = req.headers["x-session-id"] || `${visitorIP}-${userAgent}`

      // Check if this IP/session viewed in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const alreadyViewedRecently = listing.anonymousViews.some(
        (view) => view.sessionId === sessionId && new Date(view.timestamp) > oneDayAgo,
      )

      if (!alreadyViewedRecently) {
        // Clean old anonymous views (older than 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        listing.anonymousViews = listing.anonymousViews.filter((view) => new Date(view.timestamp) > thirtyDaysAgo)

        listing.anonymousViews.push({
          sessionId,
          ip: visitorIP,
          userAgent,
          timestamp: new Date(),
        })
        listing.views += 1
        viewTracked = true
      }
    }

    if (viewTracked) {
      await listing.save()
      console.log(`View tracked for listing ${listing.name}. Total views: ${listing.views}`)
    }

    return res.status(200).json({
      views: listing.views,
      tracked: viewTracked,
      message: viewTracked ? "View tracked successfully" : "View already counted recently",
    })
  } catch (error) {
    next(error)
  }
}

// Create an inquiry
export const createInquiry = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(errorHandler(400, "Invalid listing ID format"))
    }

    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return next(errorHandler(404, "Listing not found"))
    }

    const { type, message } = req.body

    // Increment inquiries count
    listing.inquiries += 1

    // Add inquiry to listing
    listing.inquiriesData = listing.inquiriesData || []
    listing.inquiriesData.push({
      userId: req.user.id,
      type: type || "general",
      message: message || "General inquiry",
      timestamp: new Date(),
    })

    await listing.save()

    console.log(`Inquiry received for listing ${listing.name} from user ${req.user.id}`)

    return res.status(200).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiries: listing.inquiries,
    })
  } catch (error) {
    next(error)
  }
}

// Get user's interactions (likes, saves)
export const getUserInteractions = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Find all listings liked by user
    const likedListings = await Listing.find({
      "likedBy.userId": userId,
    }).select("_id name imageUrls")

    // Find all listings saved by user
    const savedListings = await Listing.find({
      "savedBy.userId": userId,
    }).select("_id name imageUrls")

    return res.status(200).json({
      likedListings,
      savedListings,
    })
  } catch (error) {
    next(error)
  }
}

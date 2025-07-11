import bcryptjs from "bcryptjs"
import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import Listing from "../models/listing.model.js"
import dotenv from "dotenv"

dotenv.config()

export const test = (req, res) => {
  res.json({
    message: "API route is working!",
  })
}

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return next(errorHandler(401, "You can only update your own account or you must be an admin!"))
  }
  try {
    console.log("Update request body:", req.body) // Debug log

    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10)
    }

    // Prepare update object
    const updateData = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    }

    // Handle phone number - only update if provided
    if (req.body.phone !== undefined) {
      updateData.phone = req.body.phone || null // Store null if empty string
    }

    // Handle password - only update if provided
    if (req.body.password) {
      updateData.password = req.body.password
    }

    // Allow admin to update user roles
    if (req.user.isAdmin && req.body.hasOwnProperty("isAdmin")) {
      updateData.isAdmin = req.body.isAdmin
    }

    console.log("Update data being sent to database:", updateData) // Debug log

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    )

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    const { password, ...rest } = updatedUser._doc
    console.log("Updated user data:", rest) // Debug log

    res.status(200).json(rest)
  } catch (error) {
    console.error("Update user error:", error) // Debug log
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  // Allow admin to delete any user, or user to delete their own account
  const isAdmin = req.user.isAdmin
  const isOwnAccount = req.user.id === req.params.id

  if (!isAdmin && !isOwnAccount) {
    return next(errorHandler(401, "You can only delete your own account or you must be an admin!"))
  }

  try {
    await User.findByIdAndDelete(req.params.id)

    // Only clear cookie if deleting own account
    if (isOwnAccount) {
      res.clearCookie("access_token")
    }

    res.status(200).json("User has been deleted!")
  } catch (error) {
    next(error)
  }
}

export const getUserListings = async (req, res, next) => {
  try {
    console.log("getUserListings called with ID:", req.params.id)
    console.log("Authenticated user ID:", req.user.id)

    // Check if user is admin or requesting their own listings
    const isOwnListings = req.user.id === req.params.id
    const isAdmin = req.user.isAdmin

    if (!isOwnListings && !isAdmin) {
      console.log("Unauthorized: User can only view their own listings")
      return next(errorHandler(403, "You can only view your own listings or you must be an admin!"))
    }

    // Find listings for the requested user
    const listings = await Listing.find({ userRef: req.params.id })
    console.log(`Found ${listings.length} listings for user ${req.params.id}`)

    res.status(200).json(listings)
  } catch (error) {
    console.error("Error in getUserListings:", error)
    next(error)
  }
}

export const getUser = async (req, res, next) => {
  try {
    console.log("getUser called with ID:", req.params.id)

    // Validate that the ID is a valid ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid ObjectId format:", req.params.id)
      return next(errorHandler(400, "Invalid user ID format"))
    }

    const user = await User.findById(req.params.id)

    if (!user) return next(errorHandler(404, "User not found!"))

    const { password: pass, ...rest } = user._doc

    res.status(200).json(rest)
  } catch (error) {
    console.error("Error in getUser:", error)
    next(error)
  }
}

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    console.log("getAllUsers called")
    console.log("Request user:", req.user)

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found")
      return next(errorHandler(401, "Authentication required"))
    }

    // Get current user and check admin status
    const currentUser = await User.findById(req.user.id)
    console.log("Current user found:", currentUser ? "Yes" : "No", "isAdmin:", currentUser?.isAdmin)

    if (!currentUser) {
      console.log("Current user not found in database")
      return next(errorHandler(404, "User not found"))
    }

    if (!currentUser.isAdmin) {
      console.log("User is not admin")
      return next(errorHandler(403, "Admin access required"))
    }

    // Fetch all users excluding passwords
    const users = await User.find({}).select("-password").sort({ createdAt: -1 })
    console.log(`Found ${users.length} users`)

    res.status(200).json(users)
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    next(error)
  }
}

// Get user count (admin only)
export const getUserCount = async (req, res, next) => {
  try {
    console.log("getUserCount called")

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found")
      return next(errorHandler(401, "Authentication required"))
    }

    // Get current user and check admin status
    const currentUser = await User.findById(req.user.id)
    console.log("Current user found:", currentUser ? "Yes" : "No", "isAdmin:", currentUser?.isAdmin)

    if (!currentUser) {
      console.log("Current user not found in database")
      return next(errorHandler(404, "User not found"))
    }

    if (!currentUser.isAdmin) {
      console.log("User is not admin")
      return next(errorHandler(403, "Admin access required"))
    }

    const count = await User.countDocuments()
    console.log(`Total user count: ${count}`)

    res.status(200).json({ count })
  } catch (error) {
    console.error("Error in getUserCount:", error)
    next(error)
  }
}

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    console.log("updateUserRole called")

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log("No authenticated user found")
      return next(errorHandler(401, "Authentication required"))
    }

    // Get current user and check admin status
    const adminUser = await User.findById(req.user.id)
    console.log("Admin user found:", adminUser ? "Yes" : "No", "isAdmin:", adminUser?.isAdmin)

    if (!adminUser) {
      console.log("Admin user not found in database")
      return next(errorHandler(404, "User not found"))
    }

    if (!adminUser.isAdmin) {
      console.log("User is not admin")
      return next(errorHandler(403, "Admin access required"))
    }

    const { isAdmin } = req.body

    if (typeof isAdmin !== "boolean") {
      return next(errorHandler(400, "isAdmin must be a boolean value"))
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { isAdmin } }, { new: true }).select(
      "-password",
    )

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    console.log(`User ${updatedUser.username} role updated to admin: ${isAdmin}`)
    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    next(error)
  }
}

// Add a direct admin promotion endpoint for emergency access
export const promoteToAdmin = async (req, res, next) => {
  try {
    const { email, secretKey } = req.body

    // Verify the secret key matches the environment variable
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return next(errorHandler(403, "Invalid secret key"))
    }

    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    // Update the user to be an admin
    user.isAdmin = true
    await user.save()

    res.status(200).json({ message: "User promoted to admin successfully" })
  } catch (error) {
    console.error("Error in promoteToAdmin:", error)
    next(error)
  }
}

// Check if a user is an admin
export const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.params.id

    // Validate that the ID is a valid ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid ObjectId format:", userId)
      return next(errorHandler(400, "Invalid user ID format"))
    }

    const user = await User.findById(userId)

    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    res.status(200).json({ isAdmin: !!user.isAdmin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    next(error)
  }
}

// Admin can edit any user
export const adminEditUser = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Admin access required"))
    }

    const { username, email, isAdmin, phone } = req.body
    const userId = req.params.id

    const updateData = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (typeof isAdmin === "boolean") updateData.isAdmin = isAdmin

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"))
    }

    console.log(`Admin ${req.user.id} updated user ${userId}`)
    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error in adminEditUser:", error)
    next(error)
  }
}

// Admin can delete any user
export const adminDeleteUser = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return next(errorHandler(403, "Admin access required"))
    }

    const userId = req.params.id

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return next(errorHandler(400, "You cannot delete your own account"))
    }

    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
      return next(errorHandler(404, "User not found"))
    }

    console.log(`Admin ${req.user.id} deleted user ${userId}`)
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error in adminDeleteUser:", error)
    next(error)
  }
}

// Change user password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    console.log("Change password request for user:", userId)

    // Validate input
    if (!currentPassword || !newPassword) {
      return next(errorHandler(400, "Current password and new password are required"))
    }

    if (newPassword.length < 6) {
      return next(errorHandler(400, "New password must be at least 6 characters long"))
    }

    // Get user from database
    const user = await User.findById(userId)
    if (!user) {
      return next(errorHandler(404, "User not found"))
    }

    // Verify current password
    const isCurrentPasswordValid = bcryptjs.compareSync(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return next(errorHandler(400, "Current password is incorrect"))
    }

    // Check if new password is different from current
    const isSamePassword = bcryptjs.compareSync(newPassword, user.password)
    if (isSamePassword) {
      return next(errorHandler(400, "New password must be different from current password"))
    }

    // Hash new password
    const hashedNewPassword = bcryptjs.hashSync(newPassword, 10)

    // Update password in database
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword })

    console.log("Password changed successfully for user:", userId)
    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    next(error)
  }
}

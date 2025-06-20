import express from "express"
import {
  deleteUser,
  test,
  updateUser,
  getUserListings,
  getUser,
  getAllUsers,
  getUserCount,
  updateUserRole,
  promoteToAdmin,
  checkAdmin,
  adminEditUser,
  adminDeleteUser,
  changePassword, // Add this
} from "../controllers/user.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

// Test route
router.get("/test", test)

// Emergency admin promotion endpoint (no auth required)
router.post("/promote-admin", promoteToAdmin)

// User count route - move this BEFORE /:id route
router.get("/count", verifyToken, getUserCount)

// Admin-specific routes (must come before any /:id routes)
router.get("/all", verifyToken, getAllUsers)

// Admin user management routes
router.put("/admin/edit/:id", verifyToken, adminEditUser)
router.delete("/admin/delete/:id", verifyToken, adminDeleteUser)

// User management routes with specific paths
router.post("/update/:id", verifyToken, updateUser)
router.delete("/delete/:id", verifyToken, deleteUser)
router.get("/listings/:id", verifyToken, getUserListings)
router.post("/role/:id", verifyToken, updateUserRole)
router.get("/check-admin/:id", verifyToken, checkAdmin)

// Change password route
router.post("/change-password", verifyToken, changePassword)

// Generic /:id route MUST be absolutely last
router.get("/:id", verifyToken, getUser)

export default router

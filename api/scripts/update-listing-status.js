import mongoose from "mongoose"
import Listing from "../models/listing.model.js"
import dotenv from "dotenv"

dotenv.config()

const updateListingStatus = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGO)
    console.log("✅ Connected to MongoDB")

    // Find all listings that don't have a status field or have null/undefined status
    const listingsToUpdate = await Listing.find({
      $or: [{ status: { $exists: false } }, { status: null }, { status: undefined }],
    })

    console.log(`📊 Found ${listingsToUpdate.length} listings without status`)

    if (listingsToUpdate.length === 0) {
      console.log("✅ All listings already have status field")
      process.exit(0)
    }

    // Update all listings to have status: "available"
    const result = await Listing.updateMany(
      {
        $or: [{ status: { $exists: false } }, { status: null }, { status: undefined }],
      },
      {
        $set: { status: "available" },
      },
    )

    console.log(`✅ Updated ${result.modifiedCount} listings with status: "available"`)

    // Verify the update
    const totalListings = await Listing.countDocuments()
    const availableListings = await Listing.countDocuments({ status: "available" })
    const approvedListings = await Listing.countDocuments({ approved: true })
    const approvedAvailableListings = await Listing.countDocuments({
      approved: true,
      status: "available",
    })

    console.log("📊 Database Status:")
    console.log(`   Total listings: ${totalListings}`)
    console.log(`   Available listings: ${availableListings}`)
    console.log(`   Approved listings: ${approvedListings}`)
    console.log(`   Approved & Available listings: ${approvedAvailableListings}`)

    if (approvedAvailableListings === 0) {
      console.log("⚠️  No approved and available listings found!")
      console.log("   This might be why the home page shows 0 listings.")

      // Check if we have any approved listings at all
      if (approvedListings === 0) {
        console.log("❌ No approved listings found. You may need to approve some listings first.")
      }
    }

    console.log("✅ Migration completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error updating listing status:", error)
    process.exit(1)
  }
}

updateListingStatus()

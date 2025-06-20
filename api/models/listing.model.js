import mongoose from "mongoose"

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
      required: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      enum: ["USD", "UGX"],
      default: "UGX",
      required: true,
    },
    // Enhanced tracking fields
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        userId: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        userAgent: {
          type: String,
          default: "Unknown",
        },
        ip: {
          type: String,
          default: "Unknown",
        },
      },
    ],
    anonymousViews: [
      {
        sessionId: {
          type: String,
          required: true,
        },
        ip: {
          type: String,
          default: "Unknown",
        },
        userAgent: {
          type: String,
          default: "Unknown",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        userId: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    saves: {
      type: Number,
      default: 0,
    },
    savedBy: [
      {
        userId: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    inquiries: {
      type: Number,
      default: 0,
    },
    inquiriesData: [
      {
        userId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["call", "email", "message", "general"],
          default: "general",
        },
        message: {
          type: String,
          default: "",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
)

const Listing = mongoose.model("Listing", listingSchema)

export default Listing

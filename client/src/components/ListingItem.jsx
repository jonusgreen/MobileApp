"use client"

import { Link } from "react-router-dom"
import { MdLocationOn } from "react-icons/md"
import { FaHeart, FaRegHeart, FaEye } from "react-icons/fa"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"

const ListingItem = ({ listing }) => {
  const { currentUser } = useSelector((state) => state.user)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likes, setLikes] = useState(listing.likes || 0)
  const [saves, setSaves] = useState(listing.saves || 0)
  const [isHeartActive, setIsHeartActive] = useState(false)

  // Initialize heart state based on user interactions
  useEffect(() => {
    if (listing.userInteractions) {
      setIsLiked(listing.userInteractions.liked || false)
      setIsSaved(listing.userInteractions.saved || false)
      setIsHeartActive(listing.userInteractions.liked || listing.userInteractions.saved || false)
    }
  }, [listing.userInteractions])

  const getCurrencySymbol = (currency) => {
    return currency === "UGX" ? "UGX " : "$"
  }

  const handleHeartClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      alert("Please sign in to like and save listings")
      return
    }

    try {
      // If heart is not active, both like and save the listing
      if (!isHeartActive) {
        // Like the listing
        const likeRes = await fetch(`/api/listing/like/${listing._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        const likeData = await likeRes.json()

        // Save the listing
        const saveRes = await fetch(`/api/listing/save/${listing._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        const saveData = await saveRes.json()

        if (likeData.success !== false && saveData.success !== false) {
          setIsLiked(true)
          setIsSaved(true)
          setIsHeartActive(true)
          setLikes(likeData.likes)
          setSaves(saveData.saves)
          console.log("Listing liked and saved!")
        }
      } else {
        // If heart is active, remove both like and save
        const unlikeRes = await fetch(`/api/listing/like/${listing._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        const unlikeData = await unlikeRes.json()

        const unsaveRes = await fetch(`/api/listing/save/${listing._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        const unsaveData = await unsaveRes.json()

        if (unlikeData.success !== false && unsaveData.success !== false) {
          setIsLiked(false)
          setIsSaved(false)
          setIsHeartActive(false)
          setLikes(unlikeData.likes)
          setSaves(unsaveData.saves)
          console.log("Listing unliked and unsaved!")
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Something went wrong")
    }
  }

  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px] relative">
      {/* Property Type Badge */}
      <div
        className={`absolute top-3 right-3 z-10 px-2 py-1 rounded text-xs font-bold text-white ${
          listing.type === "rent" ? "bg-blue-600" : "bg-green-600"
        }`}
      >
        {listing.type === "rent" ? "FOR RENT" : "FOR SALE"}
      </div>

      {/* Heart Button - Like & Save Combined */}
      {currentUser && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={handleHeartClick}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all shadow-sm hover:scale-110"
            title={isHeartActive ? "Remove from favorites" : "Add to favorites"}
          >
            {isHeartActive ? (
              <FaHeart className="text-red-500" size={18} />
            ) : (
              <FaRegHeart className="text-gray-600 hover:text-red-500" size={18} />
            )}
          </button>
        </div>
      )}

      <Link to={`/listing/${listing._id}`}>
        <img
          src={
            listing.imageUrls[0] ||
            "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg" ||
            "/placeholder.svg"
          }
          alt="listing cover"
          className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300"
        />

        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="text-lg font-semibold text-slate-700 truncate">{listing.name}</p>

          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-700" />
            <p className="text-sm text-gray-600 truncate">{listing.address}</p>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>

          <p className="text-slate-500 mt-2 font-semibold">
            {getCurrencySymbol(listing.currency)}
            {listing.offer
              ? listing.discountPrice.toLocaleString("en-US")
              : listing.regularPrice.toLocaleString("en-US")}
            {listing.type === "rent" && " / month"}
          </p>

          {/* Property Details */}
          <div className="flex gap-4">
            <div className="font-bold text-xs">
              {listing.bedrooms > 1 ? `${listing.bedrooms} bedrooms ` : `${listing.bedrooms} bedroom`}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms ` : `${listing.bathrooms} bathroom `}
            </div>
          </div>

          {/* Metrics Display */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1" title="Views">
                <FaEye className="text-blue-500" />
                <span>{listing.views || 0}</span>
              </div>
              <div className="flex items-center gap-1" title="Favorites">
                <FaHeart className={isHeartActive ? "text-red-500" : "text-gray-400"} />
                <span>{likes + saves}</span>
              </div>
            </div>

            {/* Status indicator for current user */}
            {currentUser && isHeartActive && <span className="text-red-500 font-medium">❤️ Favorited</span>}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ListingItem

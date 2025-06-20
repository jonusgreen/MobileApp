"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import SwiperCore from "swiper"
import { useSelector } from "react-redux"
import { Navigation } from "swiper/modules"
import "swiper/css/bundle"
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaEye,
} from "react-icons/fa"
import { Link } from "react-router-dom"
import Contact from "../components/Contact"
import { toast } from "react-toastify"

const Listing = () => {
  SwiperCore.use([Navigation])
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [contact, setContact] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const params = useParams()
  const { currentUser } = useSelector((state) => state.user)

  // Function to get currency symbol
  const getCurrencySymbol = (currency) => {
    return currency === "UGX" ? "UGX " : "$"
  }

  /**********************   FETCH LISTING USEEFFECT  ********************************/
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/listing/get/${params.listingId}`)
        const data = await response.json()
        if (data.success === false) {
          setError(true)
          setLoading(false)
          setTimeout(() => setError(false), 4000)
          return
        }
        setListing(data)
        setLiked(data.userInteractions?.liked || false)
        setSaved(data.userInteractions?.saved || false)
        setLoading(false)
        setError(false)
      } catch (error) {
        setError(true)
        setLoading(false)
        setTimeout(() => setError(false), 4000)
      }
    }
    fetchListing()
  }, [params.listingId])

  // Handle like/unlike
  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please sign in to like listings")
      return
    }

    try {
      const res = await fetch(`/api/listing/like/${listing._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token || localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()

      if (data.success === false) {
        toast.error(data.message)
        return
      }

      setLiked(data.liked)
      setListing({
        ...listing,
        likes: data.likes,
      })

      toast.success(data.liked ? "Listing liked!" : "Listing unliked")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  // Handle save/unsave
  const handleSave = async () => {
    if (!currentUser) {
      toast.error("Please sign in to save listings")
      return
    }

    try {
      const res = await fetch(`/api/listing/save/${listing._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token || localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()

      if (data.success === false) {
        toast.error(data.message)
        return
      }

      setSaved(data.saved)
      setListing({
        ...listing,
        saves: data.saves,
      })

      toast.success(data.saved ? "Listing saved!" : "Listing removed from saved")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  /**************************** RETURN UI ***************************************/

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && <p className="text-center my-7 text-2xl">Something went wrong!</p>}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                setTimeout(() => {
                  setCopied(false)
                }, 2000)
              }}
            />
          </div>
          {copied && <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">Link copied!</p>}

          {/* Interaction buttons */}
          <div className="fixed top-[13%] right-[10%] z-10 flex flex-col gap-3">
            <div
              className="border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer"
              onClick={handleLike}
            >
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-slate-500" />}
            </div>
            <div
              className="border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer"
              onClick={handleSave}
            >
              {saved ? <FaBookmark className="text-blue-500" /> : <FaRegBookmark className="text-slate-500" />}
            </div>
          </div>

          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold">
              {listing.name} - {getCurrencySymbol(listing.currency)}
              {listing.offer
                ? listing.discountPrice.toLocaleString("en-US")
                : listing.regularPrice.toLocaleString("en-US")}
              {listing.type === "rent" && " / month"}
            </p>
            <p className="flex items-center mt-6 gap-2 text-slate-600 text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>

            {/* Stats display */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <FaEye className="text-blue-500" />
                <span>{listing.views || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <FaHeart className={liked ? "text-red-500" : "text-gray-400"} />
                <span>{listing.likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <FaBookmark className={saved ? "text-blue-500" : "text-gray-400"} />
                <span>{listing.saves || 0} saves</span>
              </div>
            </div>

            <div className="flex gap-4 justify-between items-center">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  {getCurrencySymbol(listing.currency)}
                  {+listing.regularPrice - +listing.discountPrice} OFF
                </p>
              )}
              {currentUser && listing.userRef !== currentUser._id && !contact && (
                <button
                  onClick={() => setContact(true)}
                  className="bg-slate-900 w-full max-w-[200px] text-white text-center p-1 rounded-md"
                >
                  Contact Landlord
                </button>
              )}
              {contact && <Contact listing={listing} />}

              <Link to={"/"}>
                <p className="text-green-700 font-semibold underline">To Home Page</p>
              </Link>
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black truncate">Description - </span>
              {listing.description}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1 ? `${listing.bedrooms} beds ` : `${listing.bedrooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1 ? `${listing.bathrooms} baths ` : `${listing.bathrooms} bath `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>
          </div>
        </div>
      )}
      <hr style={{ borderTop: "2px solid #ccc", margin: "20px 0" }} />
    </main>
  )
}

export default Listing

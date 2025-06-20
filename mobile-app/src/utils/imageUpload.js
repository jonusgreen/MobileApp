import { storage } from "../../firebase.js"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

export const uploadImageToFirebase = async (uri, onProgress = null) => {
  try {
    console.log("🔄 Starting image upload to Firebase...")
    console.log("📁 Image URI:", uri)

    // Fetch the image as a blob
    const response = await fetch(uri)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const blob = await response.blob()
    console.log("📦 Blob created, size:", blob.size)

    // Create a unique filename
    const filename = `images/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
    console.log("📝 Generated filename:", filename)

    // Create a reference to Firebase Storage
    const storageRef = ref(storage, filename)

    // Start the upload
    const uploadTask = uploadBytesResumable(storageRef, blob)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`📊 Upload progress: ${progress.toFixed(2)}%`)

          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          // Handle upload errors
          console.error("❌ Upload error:", error)
          console.error("Error code:", error.code)
          console.error("Error message:", error.message)
          reject(error)
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            console.log("✅ Upload successful! Download URL:", downloadURL)
            resolve(downloadURL)
          } catch (error) {
            console.error("❌ Error getting download URL:", error)
            reject(error)
          }
        },
      )
    })
  } catch (error) {
    console.error("❌ Image upload failed:", error)
    throw error
  }
}

export const uploadMultipleImages = async (imageUris, onProgress = null) => {
  try {
    console.log(`🔄 Starting upload of ${imageUris.length} images...`)

    const uploadPromises = imageUris.map((uri, index) => {
      return uploadImageToFirebase(uri, (progress) => {
        if (onProgress) {
          // Calculate overall progress
          const overallProgress = (index * 100 + progress) / imageUris.length
          onProgress(overallProgress)
        }
      })
    })

    const downloadURLs = await Promise.all(uploadPromises)
    console.log("✅ All images uploaded successfully!")
    return downloadURLs
  } catch (error) {
    console.error("❌ Multiple image upload failed:", error)
    throw error
  }
}

import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

export const signup = async (req, res, next) => {
  const { username, email, password, phone } = req.body

  try {
    console.log("Signup attempt for email:", email)
    console.log("Phone number received:", phone) // Debug log

    // Check if email already exists
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() })
    if (existingEmailUser) {
      console.log("Email already exists:", email)
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email address or sign in to your existing account.",
      })
    }

    // Check if username already exists
    const existingUsernameUser = await User.findOne({ username })
    if (existingUsernameUser) {
      console.log("Username already exists:", username)
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different username.",
      })
    }

    // Check if phone number already exists (if provided and not empty)
    if (phone && phone.trim() !== "") {
      const existingPhoneUser = await User.findOne({ phone })
      if (existingPhoneUser) {
        console.log("Phone number already exists:", phone)
        return res.status(400).json({
          success: false,
          message: "Phone number already exists. Please use a different phone number.",
        })
      }
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10)

    // Prepare user data
    const userData = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    }

    // Only add phone if it's provided and not empty
    if (phone && phone.trim() !== "") {
      userData.phone = phone
    }

    console.log("Creating user with data:", userData) // Debug log

    // Create new user
    const newUser = new User(userData)
    await newUser.save()

    console.log("New user created successfully:", newUser.username)
    console.log("User phone saved as:", newUser.phone) // Debug log

    res.status(201).json({
      success: true,
      message: "User created successfully! You can now sign in.",
    })
  } catch (error) {
    console.error("Signup error:", error)

    // Handle specific MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      let message = ""

      switch (field) {
        case "email":
          message = "Email already exists. Please use a different email address or sign in to your existing account."
          break
        case "username":
          message = "Username already exists. Please choose a different username."
          break
        case "phone":
          message = "Phone number already exists. Please use a different phone number."
          break
        default:
          message = "Account with this information already exists."
      }

      return res.status(400).json({
        success: false,
        message,
      })
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      })
    }

    next(error)
  }
}

export const signin = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const validEmail = await User.findOne({ email: email.toLowerCase() }) //Check if email exists in the db.
    if (!validEmail) return next(errorHandler(404, "Email/User not found!")) //Error if none existent
    const validPassword = bcryptjs.compareSync(password, validEmail.password) //Checks p/word
    if (!validPassword) return next(errorHandler(401, "Wrong credentials")) //Error if invalid

    //Authenticating the user:
    const token = jwt.sign(
      {
        id: validEmail._id,
        isAdmin: validEmail.isAdmin || false,
      },
      process.env.JWT_SECRET,
    )
    const { password: pasiwadi, ...restOfUserInfo } = validEmail._doc //Donna wanna send p/word to user - rest of user info.

    console.log("Setting cookie for user:", validEmail._id, "isAdmin:", validEmail.isAdmin)

    //After creating the token, we want to save it as a cookie below:
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .status(200)
      .json(restOfUserInfo)
  } catch (error) {
    next(error)
  }
}

export const google = async (req, res, next) => {
  try {
    console.log("Google auth request received:", req.body)
    const { name, email, photo } = req.body

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required Google account information",
      })
    }

    // Check if user already exists
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      console.log("Existing Google user found:", user.email)

      // Update user info if needed
      const updates = {}
      if (photo && photo !== user.avatar) {
        updates.avatar = photo
      }

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates)
        console.log("Updated user info:", updates)
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = user._doc

      console.log("Google auth - Setting cookie for existing user:", user._id, "isAdmin:", user.isAdmin)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json({
          ...rest,
          avatar: updates.avatar || rest.avatar,
          needsProfileCompletion: !rest.phone, // Flag for profile completion
        })
    } else {
      console.log("Creating new Google user:", email)

      // Generate unique username
      const baseUsername = name.split(" ").join("").toLowerCase()
      let username = baseUsername
      let counter = 1

      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Generate random password for Google users
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10)

      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        authProvider: "google",
        isEmailVerified: true, // Google emails are pre-verified
        // No phone number - will be added in profile completion
      })

      await newUser.save()
      console.log("New Google user created:", newUser.username)

      // Generate token
      const token = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = newUser._doc

      console.log("Google auth - New user, setting cookie for:", newUser._id)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json({
          ...rest,
          needsProfileCompletion: true, // New users need to complete profile
        })
    }
  } catch (error) {
    console.error("Google auth error:", error)
    res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    })
  }
}

export const facebook = async (req, res, next) => {
  try {
    console.log("Facebook auth request received:", req.body)
    const { name, email, photo } = req.body

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required Facebook account information",
      })
    }

    // Check if user already exists
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      console.log("Existing Facebook user found:", user.email)

      // Update user info if needed
      const updates = {}
      if (photo && photo !== user.avatar) {
        updates.avatar = photo
      }

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates)
        console.log("Updated user info:", updates)
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = user._doc

      console.log("Facebook auth - Setting cookie for existing user:", user._id, "isAdmin:", user.isAdmin)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json({
          ...rest,
          avatar: updates.avatar || rest.avatar,
          needsProfileCompletion: !rest.phone, // Flag for profile completion
        })
    } else {
      console.log("Creating new Facebook user:", email)

      // Generate unique username
      const baseUsername = name.split(" ").join("").toLowerCase()
      let username = baseUsername
      let counter = 1

      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Generate random password for Facebook users
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10)

      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        authProvider: "facebook",
        isEmailVerified: true, // Facebook emails are pre-verified
        // No phone number - will be added in profile completion
      })

      await newUser.save()
      console.log("New Facebook user created:", newUser.username)

      // Generate token
      const token = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = newUser._doc

      console.log("Facebook auth - New user, setting cookie for:", newUser._id)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json({
          ...rest,
          needsProfileCompletion: true, // New users need to complete profile
        })
    }
  } catch (error) {
    console.error("Facebook auth error:", error)
    res.status(500).json({
      success: false,
      message: "Facebook authentication failed. Please try again.",
    })
  }
}

export const signout = (req, res, next) => {
  try {
    console.log("Signing out user, clearing cookie")
    res.clearCookie("access_token").status(200).json("User has been signed out")
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    console.log("🔐 Password reset requested for:", email)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log("❌ User not found for email:", email)
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      })
    }

    console.log("✅ User found:", user.username)

    // Generate reset token (valid for 1 hour)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

    console.log("🔑 Reset token generated for user:", user._id)

    // Check if email credentials are configured
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.error("❌ Email credentials not configured")
      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Please contact support.",
      })
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Create reset URL (for mobile app, you might want to use a custom scheme)
    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${user._id}/${token}`

    const mailOptions = {
      from: {
        name: "Estate App",
        address: process.env.EMAIL_USERNAME,
      },
      to: user.email,
      subject: "Reset Your Password - Estate App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1F2937; margin: 0;">🏠 Estate App</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Hello <strong>${user.username}</strong>,
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              We received a request to reset your password for your Estate App account. 
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="background-color: #1F2937; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        font-size: 16px; display: inline-block;">
                🔐 Reset My Password
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If you didn't request this password reset, you can safely ignore this email. 
              Your password will remain unchanged.
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetURL}" style="color: #3B82F6; word-break: break-all;">${resetURL}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This email was sent by Estate App<br>
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
    }

    console.log("📧 Attempting to send email to:", user.email)

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error sending reset email:", error)
        return res.status(500).json({
          success: false,
          message: "Failed to send reset email. Please check your email address and try again.",
        })
      }

      console.log("✅ Reset email sent successfully:", info.response)
      return res.status(200).json({
        success: true,
        message: "Password reset instructions have been sent to your email address. Please check your inbox.",
      })
    })
  } catch (err) {
    console.error("❌ Error in forgot password:", err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    })
  }
}

export const validateToken = async (req, res) => {
  const { id, token } = req.params

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.id !== id) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      })
    }

    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
    })
  } catch (error) {
    console.error("Error validating token:", error)
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}

export const resetPassword = async (req, res) => {
  const { id, token } = req.params
  const { password } = req.body

  try {
    console.log("Password reset attempt for user:", id)

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.id !== id) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      })
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      })
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Update user password
    const updatedUser = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true })

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log("Password reset successful for user:", updatedUser.username)

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Error resetting password:", error)

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Password reset link has expired. Please request a new one.",
      })
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token. Please request a new password reset.",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    })
  }
}

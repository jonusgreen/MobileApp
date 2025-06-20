import express from "express"

const router = express.Router()

// Test cookie setting
router.post("/set-test-cookie", (req, res) => {
  console.log("=== SETTING TEST COOKIE ===")

  res.cookie("test_cookie", "test_value", {
    httpOnly: true,
    secure: false, // Set to false for local development
    sameSite: "lax",
    maxAge: 60000, // 1 minute
    path: "/",
  })

  res.json({ message: "Test cookie set" })
})

// Test cookie reading
router.get("/read-cookies", (req, res) => {
  console.log("=== READING COOKIES ===")
  console.log("All cookies:", req.cookies)
  console.log("Raw cookie header:", req.headers.cookie)

  res.json({
    cookies: req.cookies,
    rawCookieHeader: req.headers.cookie,
    testCookie: req.cookies.test_cookie,
    accessToken: req.cookies.access_token,
  })
})

export default router

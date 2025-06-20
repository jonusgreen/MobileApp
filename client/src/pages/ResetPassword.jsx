"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [tokenValid, setTokenValid] = useState(true)
  const navigate = useNavigate()
  const { id, token } = useParams()

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-token/${id}/${token}`)
        const data = await response.json()

        if (!response.ok) {
          setTokenValid(false)
          setMessage({
            type: "error",
            text: "This password reset link is invalid or has expired. Please request a new one.",
          })
        }
      } catch (error) {
        console.error("Error validating token:", error)
        setTokenValid(false)
        setMessage({
          type: "error",
          text: "Unable to validate reset link. Please try again later.",
        })
      }
    }

    validateToken()
  }, [id, token])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords
    if (!password) {
      setMessage({ type: "error", text: "Please enter a new password" })
      return
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords don't match" })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch(`/api/auth/reset-password/${id}/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Password has been reset successfully! Redirecting to sign in...",
        })

        // Navigate after 3 seconds
        setTimeout(() => {
          navigate("/sign-in")
        }, 3000)
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to reset password. Please try again.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again later.",
      })
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-4 rounded w-100" style={{ maxWidth: "400px" }}>
        <h4 className="text-center mb-4">Set New Password</h4>

        {message.text && (
          <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"} mb-3`}>
            {message.text}
          </div>
        )}

        {tokenValid ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                <strong>New Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                autoComplete="new-password"
                name="password"
                className="form-control"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setMessage({ type: "", text: "" })
                }}
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                <strong>Confirm Password</strong>
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                name="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setMessage({ type: "", text: "" })
                }}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div className="text-center mt-3">
            <a href="/forgot-password" className="btn btn-outline-primary">
              Request New Reset Link
            </a>
          </div>
        )}

        <div className="mt-3 text-center">
          <a href="/sign-in" className="text-decoration-none">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

"use client"

import { useState } from "react"

export default function CookieTest() {
  const [result, setResult] = useState("")

  const testSetCookie = async () => {
    try {
      const response = await fetch("/api/debug/set-test-cookie", {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json()
      setResult(`Set Cookie: ${JSON.stringify(data)}`)
    } catch (error) {
      setResult(`Error setting cookie: ${error.message}`)
    }
  }

  const testReadCookies = async () => {
    try {
      const response = await fetch("/api/debug/read-cookies", {
        credentials: "include",
      })
      const data = await response.json()
      setResult(`Read Cookies: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Error reading cookies: ${error.message}`)
    }
  }

  const checkBrowserCookies = () => {
    setResult(`Browser Cookies: ${document.cookie}`)
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">Cookie Test Tool</h3>
      <div className="space-x-2 mb-4">
        <button onClick={testSetCookie} className="bg-blue-500 text-white px-3 py-1 rounded">
          Set Test Cookie
        </button>
        <button onClick={testReadCookies} className="bg-green-500 text-white px-3 py-1 rounded">
          Read Server Cookies
        </button>
        <button onClick={checkBrowserCookies} className="bg-purple-500 text-white px-3 py-1 rounded">
          Check Browser Cookies
        </button>
      </div>
      {result && (
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-xs whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}

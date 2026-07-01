import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import { useInterview } from "@/hooks/useInterview"
import { changePassword } from "@/features/auth/services/auth.api"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import "./Settings.css"

const Settings = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { reports } = useInterview()

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("mockmint_theme") || "system"
  })

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" }) // type: 'success' | 'error'

  // Fetch stats from real reports
  const totalSessions = reports.length
  const avgMatchScore =
    totalSessions > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / totalSessions)
      : 0

  // Apply Theme Helper
  const applyTheme = (selectedTheme) => {
    const root = document.documentElement
    root.removeAttribute("data-theme")
    if (selectedTheme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.setAttribute("data-theme", systemDark ? "dark" : "light")
    } else {
      root.setAttribute("data-theme", selectedTheme)
    }
  }

  // Handle Theme Change
  const handleThemeChange = (e) => {
    const nextTheme = e.target.value
    setTheme(nextTheme)
    localStorage.setItem("mockmint_theme", nextTheme)
    applyTheme(nextTheme)
  }

  // Handle Password Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: "All fields are required.", type: "error" })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ text: "New password must be at least 6 characters long.", type: "error" })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" })
      return
    }

    setPasswordLoading(true)
    try {
      const res = await changePassword({ currentPassword, newPassword })
      setMessage({ text: res.message || "Password updated successfully. Logging out...", type: "success" })
      
      // Clear forms
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Force logout after 2 seconds to allow session invalidation
      setTimeout(() => {
        setUser(null)
        navigate("/login")
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update password."
      setMessage({ text: errorMsg, type: "error" })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <header className="settings-header">
        <button onClick={() => navigate("/")} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <h1>Account &amp; Settings</h1>
        <p>Manage your login credentials, system preferences, and review your profile diagnostics.</p>
      </header>

      {/* Grid Layout */}
      <div className="settings-grid">
        {/* Left Column: Profile Card & Stats Widget */}
        <div className="left-panel">
          {/* Profile Overview card */}
          <div className="settings-card profile-info-card">
            <h2>Profile Details</h2>
            <div className="profile-details-list">
              <div className="detail-item">
                <span className="detail-label">Username</span>
                <span className="detail-value">{user?.username || "Candidate"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user?.email || "N/A"}</span>
              </div>
            </div>

            <div className="stats-sub-panel">
              <h3>Preparation Metrics</h3>
              <div className="stats-grid-row">
                <div className="stat-box">
                  <span className="stat-num">{totalSessions}</span>
                  <span className="stat-txt">Total sessions</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num">{avgMatchScore}%</span>
                  <span className="stat-txt">Average Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme card */}
          <div className="settings-card theme-card">
            <h2>Appearance Settings</h2>
            <p className="card-sub">Select the theme style to customize application backgrounds</p>
            <div className="control-group-settings">
              <label htmlFor="themeSelect">Theme Mode</label>
              <select id="themeSelect" value={theme} onChange={handleThemeChange} className="theme-select-form">
                <option value="system">System Default</option>
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password Card */}
        <div className="right-panel">
          <div className="settings-card security-card">
            <h2>Change Password</h2>
            <p className="card-sub">Updating your password will invalidate your session and require logging back in</p>
            
            {message.text && (
              <div className={`settings-alert ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="security-form">
              <div className="form-item">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-item">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-item">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Verify new password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="button primary-button btn-submit-security"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

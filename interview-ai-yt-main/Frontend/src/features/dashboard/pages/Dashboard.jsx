import React from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import { useInterview } from "@/hooks/useInterview"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import "./Dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, handleLogout } = useAuth()
  const { reports, loading } = useInterview()

  // Calculate statistics from real user reports
  const totalSessions = reports.length
  const avgMatchScore =
    totalSessions > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / totalSessions)
      : 0

  const highMatchCount = reports.filter((r) => (r.matchScore || 0) >= 80).length
  const midMatchCount = reports.filter((r) => (r.matchScore || 0) >= 60 && (r.matchScore || 0) < 80).length
  const lowMatchCount = reports.filter((r) => (r.matchScore || 0) < 60).length

  // Calculate weekly activity (which days in the last 7 days had sessions)
  const getWeeklyActivity = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const activityMap = {}
    
    // Initialize last 7 days
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = days[d.getDay()]
      const dateKey = d.toDateString()
      activityMap[dateKey] = 0
      last7Days.push({ dayName: dayStr, dateKey, dateObj: d })
    }

    // Populate with real data
    reports.forEach((report) => {
      const reportDate = new Date(report.createdAt).toDateString()
      if (reportDate in activityMap) {
        activityMap[reportDate] += 1
      }
    })

    return last7Days.map((day) => ({
      name: day.name,
      dayName: day.dayName,
      count: activityMap[day.dateKey] || 0,
      label: day.dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }))
  }

  const weeklyActivity = getWeeklyActivity()

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <header className="dashboard-header">
        <div className="header-info">
          <h1>Welcome back, <span className="highlight">{user?.username || "Candidate"}</span>!</h1>
          <p>Here is your interview readiness snapshot.</p>
        </div>
        <div className="quick-actions">
          <button onClick={() => navigate("/session/new")} className="button primary-button btn-new">
            + New Session
          </button>
          <button onClick={handleLogout} className="btn-logout" title="Log Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      </header>

      {totalSessions === 0 ? (
        /* Empty State */
        <div className="dashboard-card empty-card">
          <div className="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2>No prep sessions generated yet</h2>
          <p>Upload your resume and target job description to get customized interview questions, skill gaps, and a personalized road map.</p>
          <button onClick={() => navigate("/session/new")} className="button primary-button">
            Start Your First Prep Session
          </button>
        </div>
      ) : (
        /* Dashboard Content Grid */
        <div className="dashboard-grid">
          {/* Progress Summary Card */}
          <div className="dashboard-card metrics-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4, 16px)" }}>
              <h2 style={{ margin: 0 }}>Preparation Progress</h2>
              <button 
                onClick={() => navigate("/analytics")} 
                className="btn-logout" 
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", border: "1px solid var(--border-primary, #27272a)", color: "var(--accent-primary, #818cf8)" }}
              >
                View Insights →
              </button>
            </div>
            <div className="metrics-row">
              <div className="metric-box">
                <span className="metric-value">{totalSessions}</span>
                <span className="metric-label">Total Sessions</span>
              </div>
              <div className="metric-box">
                <span className="metric-value">{avgMatchScore}%</span>
                <span className="metric-label">Avg Match Score</span>
              </div>
            </div>
            <div className="match-levels">
              <h3>Match Score Levels</h3>
              <div className="level-bar">
                <div className="level-fill high" style={{ width: `${(highMatchCount / totalSessions) * 100}%` }} title={`High Match: ${highMatchCount}`} />
                <div className="level-fill mid" style={{ width: `${(midMatchCount / totalSessions) * 100}%` }} title={`Mid Match: ${midMatchCount}`} />
                <div className="level-fill low" style={{ width: `${(lowMatchCount / totalSessions) * 100}%` }} title={`Needs Work: ${lowMatchCount}`} />
              </div>
              <div className="level-legend">
                <span><span className="dot high" /> High ({highMatchCount})</span>
                <span><span className="dot mid" /> Mid ({midMatchCount})</span>
                <span><span className="dot low" /> Low ({lowMatchCount})</span>
              </div>
            </div>
          </div>

          {/* Weekly Activity Heatmap Card */}
          <div className="dashboard-card activity-card">
            <h2>Weekly Prep Activity</h2>
            <p className="card-sub">Completed sessions in the last 7 days</p>
            <div className="activity-heatmap">
              {weeklyActivity.map((day, idx) => (
                <div key={idx} className="heatmap-column">
                  <div 
                    className={`heatmap-cell ${day.count > 0 ? "active" : ""}`} 
                    title={`${day.count} session(s) on ${day.label}`}
                  >
                    {day.count > 0 && <span className="cell-count">{day.count}</span>}
                  </div>
                  <span className="heatmap-label">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card list-card">
            <div className="card-header-row">
              <h2>Recent Prep Sessions</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button 
                  onClick={() => navigate("/history")} 
                  className="btn-logout" 
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", border: "1px solid var(--border-primary, #27272a)", color: "var(--accent-primary, #818cf8)" }}
                >
                  View History →
                </button>
                <span className="item-count">Showing {Math.min(5, totalSessions)} of {totalSessions}</span>
              </div>
            </div>
            <div className="sessions-list">
              {reports.slice(0, 5).map((report) => (
                <div 
                  key={report._id} 
                  className="session-row" 
                  onClick={() => navigate(`/interview/${report._id}`)}
                >
                  <div className="session-info">
                    <h4>{report.title || "Untitled Position"}</h4>
                    <span className="session-date">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className={`session-score ${report.matchScore >= 80 ? "high" : report.matchScore >= 60 ? "mid" : "low"}`}>
                    {report.matchScore}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

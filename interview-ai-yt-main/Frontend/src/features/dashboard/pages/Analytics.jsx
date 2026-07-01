import React, { useMemo } from "react"
import { useNavigate } from "react-router"
import { useInterview } from "@/hooks/useInterview"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import "./Analytics.css"

// Register only needed Chart.js components for tree-shaking & minimal bundle impact
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Analytics = () => {
  const navigate = useNavigate()
  const { reports, loading } = useInterview()

  // 1. Process statistics from reports
  const stats = useMemo(() => {
    const total = reports.length
    if (total === 0) return null

    // Reverse chronological order for trend tracking
    const trendReports = [...reports].reverse()

    // Line Chart: Match Score Trend
    const lineData = {
      labels: trendReports.map((r) =>
        new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      ),
      datasets: [
        {
          label: "Match Score (%)",
          data: trendReports.map((r) => r.matchScore || 0),
          borderColor: "#818cf8",
          backgroundColor: "rgba(129, 140, 248, 0.1)",
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "#818cf8",
          pointBorderColor: "#fff",
          pointHoverRadius: 6
        }
      ]
    }

    // Doughnut Chart: Match Level Segment Breakdown
    const high = reports.filter((r) => (r.matchScore || 0) >= 80).length
    const mid = reports.filter((r) => (r.matchScore || 0) >= 60 && (r.matchScore || 0) < 80).length
    const low = reports.filter((r) => (r.matchScore || 0) < 60).length

    const doughnutData = {
      labels: ["High Match (>=80%)", "Mid Match (60-79%)", "Low Match (<60%)"],
      datasets: [
        {
          data: [high, mid, low],
          backgroundColor: ["#22c55e", "#3b82f6", "#ef4444"],
          borderColor: ["#111113", "#111113", "#111113"],
          borderWidth: 2
        }
      ]
    }

    // Bar Chart: Skills Gap Frequency aggregation
    const gapCounts = {}
    reports.forEach((report) => {
      // Each report contains a skillGaps array
      const gaps = report.skillGaps || []
      gaps.forEach((g) => {
        const skillName = g.skill.trim()
        gapCounts[skillName] = (gapCounts[skillName] || 0) + 1
      })
    })

    // Sort gaps by frequency count descending
    const sortedGaps = Object.entries(gapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Show top 8 most frequent gaps

    const barData = {
      labels: sortedGaps.map((item) => item[0]),
      datasets: [
        {
          label: "Times Flagged as Gap",
          data: sortedGaps.map((item) => item[1]),
          backgroundColor: "rgba(239, 68, 68, 0.85)",
          borderColor: "#ef4444",
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    }

    // Calculate aggregated stats
    const averageScore = Math.round(reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / total)
    const highestScore = Math.max(...reports.map((r) => r.matchScore || 0))

    return {
      lineData,
      doughnutData,
      barData,
      averageScore,
      highestScore,
      total
    }
  }, [reports])

  // Chart configuration options (dark theme overrides)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#fafafa",
          font: { family: "system-ui", weight: "500" }
        }
      },
      tooltip: {
        backgroundColor: "#1a1a1f",
        titleColor: "#fafafa",
        bodyColor: "#fafafa",
        borderColor: "#27272a",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: "#27272a" },
        ticks: { color: "#71717a" }
      },
      y: {
        grid: { color: "#27272a" },
        ticks: { color: "#71717a" },
        min: 0,
        max: 100
      }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { color: "#27272a" },
        ticks: { color: "#71717a" }
      },
      y: {
        grid: { color: "#27272a" },
        ticks: { color: "#71717a", stepSize: 1 }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fafafa",
          font: { family: "system-ui" }
        }
      }
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading analytics dashboard..." />
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <button onClick={() => navigate("/")} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <h1>Preparation Insights</h1>
        <p>Analyze match score trends, match distribution levels, and focus areas to guide your next study session.</p>
      </header>

      {!stats ? (
        /* Empty State */
        <div className="analytics-card empty-analytics">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-svg">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <h2>No analytics data available</h2>
          <p>Generate some interview preparation sessions to populate performance trends and skill gap analytics.</p>
          <button onClick={() => navigate("/session/new")} className="button primary-button btn-action">
            Start Your First Prep Session
          </button>
        </div>
      ) : (
        /* Main Grid Layout */
        <div className="analytics-grid">
          {/* Top Level Metric Cards */}
          <div className="metrics-summary-row">
            <div className="metric-summary-card">
              <span className="summary-value">{stats.total}</span>
              <span className="summary-label">Total Prep Sessions</span>
            </div>
            <div className="metric-summary-card">
              <span className="summary-value">{stats.averageScore}%</span>
              <span className="summary-label">Average Match Score</span>
            </div>
            <div className="metric-summary-card">
              <span className="summary-value">{stats.highestScore}%</span>
              <span className="summary-label">Highest Score Achieved</span>
            </div>
          </div>

          {/* Chart Cards */}
          <div className="chart-row">
            {/* Trend Card */}
            <div className="analytics-card trend-card">
              <h2>Match Score Trend</h2>
              <div className="chart-wrapper">
                <Line data={stats.lineData} options={chartOptions} />
              </div>
            </div>

            {/* Distribution Card */}
            <div className="analytics-card distribution-card">
              <h2>Match Level Distribution</h2>
              <div className="chart-wrapper">
                <Doughnut data={stats.doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          <div className="chart-row single-row">
            {/* Skills Gap Card */}
            <div className="analytics-card gaps-freq-card">
              <h2>Most Common Skill Gaps</h2>
              <p className="card-sub">The top skills flagged as preparation gaps across all sessions</p>
              <div className="chart-wrapper">
                <Bar data={stats.barData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useInterview } from "@/hooks/useInterview"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import "./InterviewReport.css"

const InterviewReport = () => {
  const { report, getReportById, loading, getResumePdf } = useInterview()
  const { interviewId } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("technical")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [checkedActions, setCheckedActions] = useState({})
  const [copySuccess, setCopySuccess] = useState("")
  const [shareSuccess, setShareSuccess] = useState(false)
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    learningPath: false,
    actionItems: false,
    skillGaps: false
  })

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    }
  }, [interviewId])

  // Toggle single question accordion
  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Toggle parent layout sections
  const toggleSection = (sectionName) => {
    setSectionsCollapsed((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  // Toggle checkable action item state
  const toggleActionItem = (itemKey) => {
    setCheckedActions((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }))
  }

  // Copy single question text to clipboard
  const handleCopyQuestion = (e, questionText) => {
    e.stopPropagation()
    navigator.clipboard.writeText(questionText)
      .then(() => {
        setCopySuccess(questionText)
        setTimeout(() => setCopySuccess(""), 2000)
      })
      .catch((err) => console.error("Could not copy text: ", err))
  }

  // Copy entire report summary to clipboard
  const handleCopyEntireReport = () => {
    if (!report) return
    const textSummary = `
MOCKMINT AI INTERVIEW REPORT
Position: ${report.title || "Untitled Position"}
Match Score: ${report.matchScore}%
Skill Gaps: ${(report.skillGaps || []).map(g => `${g.skill} (${g.severity})`).join(", ")}
Preparation Path: ${(report.preparationPlan || []).map(p => `Day ${p.day}: ${p.focus}`).join("\n")}
    `.trim()

    navigator.clipboard.writeText(textSummary)
      .then(() => {
        alert("Entire report summary copied to clipboard!")
      })
      .catch((err) => console.error("Could not copy report: ", err))
  }

  // Share report mock action
  const handleShareReport = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
      })
      .catch((err) => console.error("Could not copy share link: ", err))
  }

  // Trigger print view (generates PDF natively)
  const handlePrintReport = () => {
    window.print()
  }

  // Compile checkable action items from preparation plan tasks
  const actionItems = (report.preparationPlan || []).flatMap((day) =>
    (day.tasks || []).map((task, idx) => ({
      key: `day-${day.day}-task-${idx}`,
      text: `[Day ${day.day}] ${task}`
    }))
  )

  // Calculate dynamic readiness score based on matchScore and actions checked
  const calculateReadiness = () => {
    if (!report) return 0
    const baseScore = report.matchScore || 0
    const totalActions = actionItems.length
    if (totalActions === 0) return baseScore

    const completedActions = Object.values(checkedActions).filter(Boolean).length
    const remainingPotential = 100 - baseScore
    const actionWeightValue = (completedActions / totalActions) * remainingPotential
    return Math.round(baseScore + actionWeightValue)
  }

  const readinessPercentage = calculateReadiness()

  // Handle Loading Skeletons
  if (loading || !report) {
    return (
      <div className="report-container skeleton-loading">
        <header className="report-header">
          <div className="skeleton-line header-title-skele"></div>
          <div className="skeleton-line header-sub-skele"></div>
        </header>
        <div className="report-grid">
          <div className="left-panel">
            <div className="report-card skeleton-card"></div>
            <div className="report-card skeleton-card"></div>
          </div>
          <div className="right-panel">
            <div className="report-card skeleton-card large-skele"></div>
          </div>
        </div>
      </div>
    )
  }

  const scoreColor =
    report.matchScore >= 80 ? "high" : report.matchScore >= 60 ? "mid" : "low"

  // Filter questions based on search input
  const filteredTechnical = (report.technicalQuestions || []).filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredBehavioral = (report.behavioralQuestions || []).filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort skill gaps by severity (high > medium > low)
  const severityWeights = { high: 3, medium: 2, low: 1 }
  const sortedSkillGaps = [...(report.skillGaps || [])].sort(
    (a, b) => (severityWeights[b.severity] || 0) - (severityWeights[a.severity] || 0)
  )
  const top3Gaps = sortedSkillGaps.slice(0, 3)

  // Mapping heuristic-based insights matching the user's match score range
  const matchInsights =
    report.matchScore >= 80
      ? [
          "Demonstrates high alignment with targeted technical requirements.",
          "Profile matches key tech keywords in the primary job scope.",
          "Preparation needs only incremental polishing on specific edge-case details."
        ]
      : report.matchScore >= 60
      ? [
          "Candidate meets basic framework requirements but lacks secondary production experience.",
          "Resume keyword match indicates gaps in advanced optimization tools.",
          "Focus on the recommended learning path to bridge framework gaps."
        ]
      : [
          "Substantial skill gaps detected in relation to target core framework requirements.",
          "Missing keyword alignment across critical stack technologies.",
          "A structured preparation plan is highly recommended to build baseline readiness."
        ]

  return (
    <div className="report-container">
      {/* Sticky Navigation Bar */}
      <nav className="report-sticky-nav">
        <div className="sticky-nav-inner">
          <a href="#overview">Overview</a>
          <a href="#gaps">Skill Gaps</a>
          <a href="#roadmap">Learning Path</a>
          <a href="#action-items">Action Items</a>
          <a href="#questions">Questions Dojo</a>
        </div>
      </nav>

      {/* Report Header */}
      <header className="report-header">
        <button onClick={() => navigate("/")} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <div className="header-action-row">
          <div className="header-title-block">
            <h1>{report.title || "Position Strategy Plan"}</h1>
            <p className="report-meta">
              Report Generated on{" "}
              {new Date(report.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </p>
          </div>
          <div className="header-buttons">
            <button onClick={handleCopyEntireReport} className="btn-secondary" title="Copy Report to Clipboard">
              Copy Summary
            </button>
            <button onClick={handleShareReport} className="btn-secondary" title="Share Report Link">
              {shareSuccess ? "Link Copied!" : "Share Link"}
            </button>
            <button onClick={handlePrintReport} className="btn-secondary" title="Export report natively as PDF">
              Print / Save PDF
            </button>
            <button onClick={() => getResumePdf(interviewId)} className="button primary-button btn-download">
              <svg height="14" style={{ marginRight: "8px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2v12m0 0l3.5-3.5M12 14L8.5 10.5M4 20h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Tailored Resume
            </button>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="report-grid">
        {/* Left Column: Analytics, Path and Action items */}
        <div className="left-panel">
          {/* Overall Match Score Card */}
          <div id="overview" className="report-card score-card scroll-anchor">
            <h2>Overall Match Score</h2>
            <div className="score-display-row">
              <div className={`score-ring ${scoreColor}`}>
                <span className="score-value">{report.matchScore}</span>
                <span className="score-percent">%</span>
              </div>
              <div className="score-analysis">
                <h3 className={`status-text ${scoreColor}`}>
                  {report.matchScore >= 80 ? "Excellent Match" : report.matchScore >= 60 ? "Good Match" : "Needs Practice"}
                </h3>
                <p>
                  {report.matchScore >= 80
                    ? "Your skills match the core requirements of this role exceptionally well."
                    : report.matchScore >= 60
                    ? "You meet the secondary requirements but have minor skill gaps to study."
                    : "Several core requirements are missing. Focus on the learning roadmap."}
                </p>
              </div>
            </div>

            {/* Dynamic Readiness Score Box */}
            <div className="readiness-box">
              <div className="readiness-header-row">
                <h3>Interview Readiness</h3>
                <span className="readiness-value">{readinessPercentage}%</span>
              </div>
              <div className="readiness-progress-bar">
                <div className="readiness-progress-fill" style={{ width: `${readinessPercentage}%` }} />
              </div>
              <p className="readiness-desc">
                Increases dynamically as you check off items from your Action Items checklist below.
              </p>
            </div>

            {/* Match Insights (Heuristic) */}
            <div className="strengths-section">
              <h3>Match Insights</h3>
              <ul>
                {matchInsights.map((str, idx) => (
                  <li key={idx}>
                    <span className="bullet-check">ℹ</span> {str}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skill Gap Analysis Card */}
          <div id="gaps" className="report-card scroll-anchor">
            <div className="card-title-row" onClick={() => toggleSection("skillGaps")}>
              <h2>Skill Gap Analysis</h2>
              <span className={`chevron ${sectionsCollapsed.skillGaps ? "" : "open"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
            {!sectionsCollapsed.skillGaps && (
              <div className="card-content">
                {(!report.skillGaps || report.skillGaps.length === 0) ? (
                  <p className="empty-text">No gaps identified! You match the profile keywords perfectly.</p>
                ) : (
                  <div className="gaps-list">
                    {report.skillGaps.map((gap, idx) => {
                      const percentage = gap.severity === "high" ? 100 : gap.severity === "medium" ? 66 : 33
                      // Check if it is within the top 3 priority gaps
                      const isTopPriority = top3Gaps.some(tg => tg.skill === gap.skill && tg.severity === gap.severity)
                      
                      return (
                        <div key={idx} className={`gap-item ${isTopPriority ? "top-priority" : ""}`}>
                          <div className="gap-info">
                            <span className="gap-name">
                              {gap.skill} {isTopPriority && <span className="priority-dot" title="Top Priority Gap">⚠️</span>}
                            </span>
                            <span className={`gap-badge ${gap.severity}`}>{gap.severity} Priority</span>
                          </div>
                          <div className="gap-progress-bar">
                            <div className={`gap-progress-fill ${gap.severity}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recommended Learning Path (Roadmap) */}
          <div id="roadmap" className="report-card scroll-anchor">
            <div className="card-title-row" onClick={() => toggleSection("learningPath")}>
              <h2>Recommended Learning Path</h2>
              <span className={`chevron ${sectionsCollapsed.learningPath ? "" : "open"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
            {!sectionsCollapsed.learningPath && (
              <div className="card-content">
                {(!report.preparationPlan || report.preparationPlan.length === 0) ? (
                  <p className="empty-text">No customized roadmap tasks generated.</p>
                ) : (
                  <div className="roadmap-timeline">
                    {report.preparationPlan.map((day) => (
                      <div key={day.day} className="timeline-day">
                        <div className="day-badge">Day {day.day}</div>
                        <div className="day-details">
                          <h4>{day.focus}</h4>
                          <ul>
                            {day.tasks.map((task, idx) => (
                              <li key={idx}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Items Checklist */}
          <div id="action-items" className="report-card scroll-anchor">
            <div className="card-title-row" onClick={() => toggleSection("actionItems")}>
              <h2>Action Items Checklist</h2>
              <span className={`chevron ${sectionsCollapsed.actionItems ? "" : "open"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
            {!sectionsCollapsed.actionItems && (
              <div className="card-content">
                {actionItems.length === 0 ? (
                  <p className="empty-text">No action items found.</p>
                ) : (
                  <div className="checklist-container">
                    {actionItems.map((item) => (
                      <label key={item.key} className={`checklist-item ${checkedActions[item.key] ? "checked" : ""}`}>
                        <input
                          type="checkbox"
                          checked={!!checkedActions[item.key]}
                          onChange={() => toggleActionItem(item.key)}
                        />
                        <span className="checklist-text">{item.text}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Question Dojo */}
        <div id="questions" className="right-panel scroll-anchor">
          <div className="report-card questions-card">
            <div className="questions-header">
              <h2>Interview Questions Dojo</h2>
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Filter questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Tab Selectors */}
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === "technical" ? "active" : ""}`}
                onClick={() => setActiveTab("technical")}
              >
                Technical ({(report.technicalQuestions || []).length})
              </button>
              <button
                className={`tab-btn ${activeTab === "behavioral" ? "active" : ""}`}
                onClick={() => setActiveTab("behavioral")}
              >
                Behavioral ({(report.behavioralQuestions || []).length})
              </button>
            </div>

            {/* Filtered Questions Display */}
            <div className="questions-list">
              {activeTab === "technical" ? (
                filteredTechnical.length === 0 ? (
                  <p className="empty-text">No technical questions matching search.</p>
                ) : (
                  filteredTechnical.map((q, idx) => (
                    <div key={idx} className="question-accordion">
                      <div className="question-header-row" onClick={() => toggleQuestion(`tech-${idx}`)}>
                        <span className="question-prefix">Q{idx + 1}</span>
                        <p className="question-text">{q.question}</p>
                        <div className="question-actions">
                          <button 
                            onClick={(e) => handleCopyQuestion(e, q.question)} 
                            className="btn-copy-question"
                            title="Copy question text"
                          >
                            {copySuccess === q.question ? "Copied" : "Copy"}
                          </button>
                          <span className={`chevron ${expandedQuestions[`tech-${idx}`] ? "open" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                          </span>
                        </div>
                      </div>
                      {expandedQuestions[`tech-${idx}`] && (
                        <div className="question-body">
                          <div className="section-block">
                            <span className="section-label intention">Interviewer Intention</span>
                            <p>{q.intention}</p>
                          </div>
                          <div className="section-block">
                            <span className="section-label answer">Model Answer Strategy</span>
                            <p className="formatted-answer">{q.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                filteredBehavioral.length === 0 ? (
                  <p className="empty-text">No behavioral questions matching search.</p>
                ) : (
                  filteredBehavioral.map((q, idx) => (
                    <div key={idx} className="question-accordion">
                      <div className="question-header-row" onClick={() => toggleQuestion(`beh-${idx}`)}>
                        <span className="question-prefix">Q{idx + 1}</span>
                        <p className="question-text">{q.question}</p>
                        <div className="question-actions">
                          <button 
                            onClick={(e) => handleCopyQuestion(e, q.question)} 
                            className="btn-copy-question"
                            title="Copy question text"
                          >
                            {copySuccess === q.question ? "Copied" : "Copy"}
                          </button>
                          <span className={`chevron ${expandedQuestions[`beh-${idx}`] ? "open" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                          </span>
                        </div>
                      </div>
                      {expandedQuestions[`beh-${idx}`] && (
                        <div className="question-body">
                          <div className="section-block">
                            <span className="section-label intention">Interviewer Intention</span>
                            <p>{q.intention}</p>
                          </div>
                          <div className="section-block">
                            <span className="section-label answer">Model Answer Strategy</span>
                            <p className="formatted-answer">{q.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewReport

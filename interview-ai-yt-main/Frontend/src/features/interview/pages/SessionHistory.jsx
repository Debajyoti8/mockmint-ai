import React, { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useInterview } from "@/hooks/useInterview"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import "./SessionHistory.css"

const SessionHistory = () => {
  const navigate = useNavigate()
  const { reports, loading, deleteReport, generateReport } = useInterview()
  const searchInputRef = useRef(null)

  // Local Controls State
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem("mockmint_history_sort") || "newest"
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Pinned/Favorite Reports State (stored in localStorage)
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const stored = localStorage.getItem("mockmint_pins")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Duplicate Loading indicator
  const [duplicatingId, setDuplicatingId] = useState(null)
  // Delete confirmation overlay ID
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Remember last selected sort order
  useEffect(() => {
    localStorage.setItem("mockmint_history_sort", sortBy)
  }, [sortBy])

  // Sync Pinned state to localStorage
  const togglePin = (e, id) => {
    e.stopPropagation()
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem("mockmint_pins", JSON.stringify(next))
      return next
    })
  }

  // Keyboard shortcut: Press "/" to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search only if user is not typing in a text area or another input
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Duplicate past session API call
  const handleDuplicate = async (e, report) => {
    e.stopPropagation()
    setDuplicatingId(report._id)
    try {
      // Re-triggers generation pipeline with same inputs
      const data = await generateReport({
        jobDescription: report.jobDescription || "Job description placeholder",
        selfDescription: report.selfDescription || "Self profile placeholder"
      })
      if (data && data._id) {
        navigate(`/interview/${data._id}`)
      }
    } catch (err) {
      console.error("Duplicate failed", err)
      alert("Failed to duplicate report. Please try again.")
    } finally {
      setDuplicatingId(null)
    }
  }

  // Confirm delete report call
  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      await deleteReport(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  // Memoized Filter & Sort
  const filteredAndSortedReports = useMemo(() => {
    let list = [...reports]

    // 1. Apply Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      list = list.filter((r) => (r.title || "").toLowerCase().includes(query))
    }

    // 2. Sorting (Pinned items always bubble to the top)
    list.sort((a, b) => {
      const aPinned = pinnedIds.includes(a._id)
      const bPinned = pinnedIds.includes(b._id)

      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      // Sub-sort secondary sort selection
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (sortBy === "score_desc") {
        return (b.matchScore || 0) - (a.matchScore || 0)
      }
      if (sortBy === "score_asc") {
        return (a.matchScore || 0) - (b.matchScore || 0)
      }
      return 0
    })

    return list
  }, [reports, searchTerm, sortBy, pinnedIds])

  // Pagination calculations
  const totalItems = filteredAndSortedReports.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedReports.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedReports, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortBy, pageSize])

  return (
    <div className="history-container">
      {/* Header */}
      <header className="history-header">
        <button onClick={() => navigate("/")} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <h1>Preparation History</h1>
        <p>Manage, search, and review all your previous interview preparation strategies. Press <kbd className="shortcut-kbd">/</kbd> to search.</p>
      </header>

      {/* Control Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by job title... (Press '/' to focus)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search"
            aria-label="Search past sessions"
          />
        </div>
        <div className="select-controls">
          <div className="control-group">
            <label htmlFor="sortBy">Sort By</label>
            <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_desc">Highest Match</option>
              <option value="score_asc">Lowest Match</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="pageSize">Page Size</label>
            <select id="pageSize" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="filter-select">
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && !duplicatingId && (
        <div className="history-list-grid skeleton-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="history-item-card skeleton-item-card">
              <div className="skeleton-pulse title-skele"></div>
              <div className="skeleton-pulse meta-skele"></div>
              <div className="skeleton-pulse btn-skele"></div>
            </div>
          ))}
        </div>
      )}

      {/* Duplicating loading state overlay */}
      {duplicatingId && (
        <LoadingSpinner fullScreen message="Duplicating session details..." />
      )}

      {/* History List */}
      {!loading && !duplicatingId && paginatedReports.length === 0 ? (
        <div className="history-card empty-history">
          <svg className="empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
          <h2>No matching plans found</h2>
          <p>Try adjusting your search keywords or generate a new strategy plan.</p>
        </div>
      ) : (
        !loading && !duplicatingId && (
          <div className="history-list-grid">
            {paginatedReports.map((report) => {
              const isPinned = pinnedIds.includes(report._id)
              return (
                <div key={report._id} className={`history-item-card ${isPinned ? "is-pinned" : ""}`} onClick={() => navigate(`/interview/${report._id}`)}>
                  <div className="card-header">
                    <div className="title-wrapper">
                      <h3>{report.title || "Untitled Position"}</h3>
                      <button 
                        onClick={(e) => togglePin(e, report._id)} 
                        className={`btn-pin ${isPinned ? "pinned" : ""}`}
                        title={isPinned ? "Unpin report" : "Pin report to top"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </button>
                    </div>
                    <div className={`score-badge ${report.matchScore >= 80 ? "high" : report.matchScore >= 60 ? "mid" : "low"}`}>
                      {report.matchScore}% Match
                    </div>
                  </div>
                  <div className="card-meta">
                    <span className="meta-date">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/interview/${report._id}`)} className="action-btn btn-continue">
                      Continue Prep
                    </button>
                    <button onClick={(e) => handleDuplicate(e, report)} className="action-btn btn-duplicate" title="Duplicate plan inputs">
                      Duplicate
                    </button>
                    <button onClick={() => setDeleteConfirmId(report._id)} className="action-btn btn-delete-card" title="Delete prep session">
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pagination-wrapper" aria-label="Pagination Navigation">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="Go to previous page"
          >
            ← Previous
          </button>
          <span className="pagination-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="Go to next page"
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {deleteConfirmId && (
        <div className="delete-modal-overlay">
          <div className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title">Delete Session?</h2>
            <p>Are you sure you want to delete this interview preparation strategy? This action is permanent and cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionHistory

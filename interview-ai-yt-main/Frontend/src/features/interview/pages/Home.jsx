import React, { useState, useRef } from "react"
import { useNavigate } from "react-router"
import { useInterview } from "@/hooks/useInterview"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import "../style/home.scss"

const Home = () => {
  const { loading, generateReport } = useInterview()
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [fileName, setFileName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")

  const resumeInputRef = useRef()
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.")
        setFileName("")
        return
      }
      setFileName(file.name)
      setError("")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      // Validate file extension
      const ext = file.name.split(".").pop().toLowerCase()
      if (ext !== "pdf" && ext !== "docx") {
        setError("Only PDF or DOCX files are allowed.")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.")
        return
      }
      
      // Assign to input element files list using DataTransfer
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      resumeInputRef.current.files = dataTransfer.files
      setFileName(file.name)
      setError("")
    }
  }

  const triggerFilePicker = () => {
    resumeInputRef.current.click()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      triggerFilePicker()
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ""
    }
    setFileName("")
  }

  const handleDropzoneClick = () => {
    if (fileName) return
    triggerFilePicker()
  }

  const handleGenerateReport = async () => {
    setError("")
    if (!jobDescription.trim()) {
      setError("Target job description is required.")
      return
    }

    const resumeFile = resumeInputRef.current?.files?.[0]
    if (!resumeFile && !selfDescription.trim()) {
      setError("Please upload a resume OR provide a self-description.")
      return
    }

    try {
      const data = await generateReport({ jobDescription, selfDescription, resumeFile })
      if (data && data._id) {
        navigate(`/interview/${data._id}`)
      } else {
        setError("Failed to generate report. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred during generation.")
      console.error(err)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Analyzing profile and generating your interview strategy..." />
  }

  return (
    <div className="home-page">
      {/* Page Header */}
      <header className="page-header">
        <button onClick={() => navigate("/")} className="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <h1>Create Your Custom <span className="highlight">Interview Plan</span></h1>
        <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      {/* Validation Message */}
      {error && (
        <div style={{ maxWidth: "800px", margin: "0 auto var(--space-4, 16px) auto", width: "100%" }}>
          <p style={{ color: "#ef4444", fontSize: "0.95rem", fontWeight: "500", textAlign: "center" }}>{error}</p>
        </div>
      )}

      {/* Main Card */}
      <div className="interview-card">
        <div className="interview-card__body">
          {/* Left Panel - Job Description */}
          <div className="panel panel--left">
            <div className="panel__header">
              <span className="panel__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>
              <h2>Target Job Description</h2>
              <span className="badge badge--required">Required</span>
            </div>
            <textarea
              onChange={(e) => setJobDescription(e.target.value)}
              value={jobDescription}
              className="panel__textarea"
              placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
              maxLength={5000}
            />
            <div className="char-counter">{jobDescription.length} / 5000 chars</div>
          </div>

          {/* Vertical Divider */}
          <div className="panel-divider" />

          {/* Right Panel - Profile */}
          <div className="panel panel--right">
            <div className="panel__header">
              <span className="panel__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <h2>Your Profile</h2>
            </div>

            {/* Upload Resume */}
            <div className="upload-section">
              <label className="section-label">
                Upload Resume
                <span className="badge badge--best">Best Results</span>
              </label>
              <div 
                className={`dropzone ${isDragging ? "dragging" : ""} ${fileName ? "has-file" : ""}`} 
                onClick={handleDropzoneClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Upload Resume"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  ref={resumeInputRef} 
                  onChange={handleFileChange} 
                  hidden 
                  type="file" 
                  id="resume" 
                  name="resume" 
                  accept=".pdf,.docx" 
                />
                
                {fileName ? (
                  <div className="file-success-container">
                    <span className="success-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </span>
                    <p className="file-success-title">Resume Ready</p>
                    <p className="file-success-name">{fileName}</p>
                    <button type="button" onClick={handleRemoveFile} className="btn-remove-file">
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="dropzone__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                      </svg>
                    </span>
                    <p className="dropzone__title">Click to upload or drag &amp; drop</p>
                    <p className="dropzone__subtitle">PDF or DOCX (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>


            {/* OR Divider */}
            <div className="or-divider"><span>OR</span></div>

            {/* Quick Self-Description */}
            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">Quick Self-Description</label>
              <textarea
                onChange={(e) => setSelfDescription(e.target.value)}
                value={selfDescription}
                id="selfDescription"
                name="selfDescription"
                className="panel__textarea panel__textarea--short"
                maxLength={1000}
                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              />
              <div className="char-counter">{selfDescription.length} / 1000 chars</div>
            </div>

            {/* Info Box */}
            <div className="info-box">
              <span className="info-box__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" />
                </svg>
              </span>
              <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="interview-card__footer">
          <span className="footer-info">AI-Powered Strategy Generation &bull; Approx 30s</span>
          <button
            onClick={handleGenerateReport}
            className="generate-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Generate My Interview Strategy
          </button>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="page-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </footer>
    </div>
  )
}

export default Home
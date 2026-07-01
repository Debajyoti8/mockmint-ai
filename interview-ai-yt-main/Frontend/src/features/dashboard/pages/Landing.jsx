import React, { useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import "./Landing.css"

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Collapsible FAQ state
  const [expandedFaq, setExpandedFaq] = useState({})

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const faqs = [
    {
      q: "How does MockMint AI generate prep sessions?",
      a: "MockMint parses your resume or self-description along with the target job requirements using Google Gemini AI models. It aggregates tech stacks, maps out skill discrepancies, and writes custom questions matching the interviewer's intention."
    },
    {
      q: "How long does generation take?",
      a: "Typically between 20 to 30 seconds. Gemini performs a complete scan and generates technical & behavioral questions, a 7-day preparation path, and a tailored resume download link."
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. MockMint does not sell or share your resume text. Your session profiles are fully private, protected by cookie authentication, and can be permanently deleted from your History dashboard at any time."
    },
    {
      q: "Is there a light theme available?",
      a: "Yes! MockMint supports dark, light, and system preference themes, configurable directly inside your Account Settings page."
    }
  ]

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <span className="brand-logo">MockMint AI 🍃</span>
          <div className="nav-links">
            {user ? (
              <button onClick={() => navigate("/")} className="btn-nav-primary">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="btn-nav-secondary">
                  Sign In
                </button>
                <button onClick={() => navigate("/register")} className="btn-nav-primary">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Mint Your Next <span className="highlight">Opportunity</span>.
        </h1>
        <p className="hero-subtitle">
          Accelerate your tech preparation. Upload your resume, paste target job requirements, and receive custom interview strategy roadmaps in 30 seconds.
        </p>
        <div className="hero-actions">
          <button 
            onClick={() => navigate(user ? "/" : "/register")} 
            className="button primary-button btn-hero-cta"
          >
            Start Preparing Free
          </button>
        </div>
      </section>

      {/* Product Value Proposition & Features */}
      <section className="features-section">
        <h2 className="section-title">Engineered for Technical Candidates</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Gemini AI Diagnostics</h3>
            <p>Deep scan matching target requirements against your profile parameters with high keyword fidelity.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📈</span>
            <h3>Dynamic Readiness Score</h3>
            <p>Interactive daily checklist items that recalculate and feed back directly into your preparation completion rates.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Skill Gap Analytics</h3>
            <p>Aggregated frequency charts powered by Chart.js displaying technical gaps across all sessions to prioritize study focus.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <h2 className="section-title">How MockMint Works</h2>
        <div className="steps-container">
          <div className="step-item">
            <span className="step-num">1</span>
            <h4>Input Profile &amp; Role</h4>
            <p>Upload your resume PDF/DOCX or write a self-description, then paste the full target Job Description text.</p>
          </div>
          <div className="step-item">
            <span className="step-num">2</span>
            <h4>Gemini Analysis Run</h4>
            <p>AI scans framework criteria, writes detailed interview questions, and compiles matching study focuses.</p>
          </div>
          <div className="step-item">
            <span className="step-num">3</span>
            <h4>Practice &amp; Track</h4>
            <p>Complete checkable action goals, study model answer strategies, and download your optimized tailored resume.</p>
          </div>
        </div>
      </section>

      {/* Mock Screenshot Placeholder Section */}
      <section className="screenshot-section">
        <div className="mock-window">
          <div className="window-header">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="window-title">MockMint SaaS Interface Preview</span>
          </div>
          <div className="window-body">
            <div className="mock-widget">
              <div className="mock-progress">
                <span>Overall Match Score</span>
                <span className="value">84%</span>
              </div>
              <div className="mock-bar-container"><div className="mock-bar" style={{ width: "84%" }} /></div>
            </div>
            <div className="mock-timeline">
              <div className="mock-day">Day 1 Focus: System Design &amp; Scalability</div>
              <div className="mock-day">Day 2 Focus: React 19 Concurrent Features</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="section-title">Candidate Success Stories</h2>
        <p className="section-subtitle-demo">*Demo Feedback (Simulated User Outcomes)</p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="quote">"MockMint helped me identify that I was missing key GraphQL keywords on my resume. Bridged the gaps in 3 days and landed a Senior Role."</p>
            <span className="author">— Sarah K., Frontend Engineer</span>
          </div>
          <div className="testimonial-card">
            <p className="quote">"The readiness progress bar is incredibly gamified. Watching my score climb as I completed tasks kept me accountable."</p>
            <span className="author">— Alex M., Software Developer</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item" onClick={() => toggleFaq(idx)}>
              <div className="faq-question-row">
                <h4>{faq.q}</h4>
                <span className={`chevron ${expandedFaq[idx] ? "open" : ""}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
              </div>
              {expandedFaq[idx] && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-section">
        <h2>Start Minting Opportunities Today</h2>
        <p>Build your first tailored interview strategy roadmap in seconds.</p>
        <button 
          onClick={() => navigate(user ? "/" : "/register")} 
          className="button primary-button btn-cta-end"
        >
          Generate My First Plan
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <span>&copy; {new Date().getFullYear()} MockMint AI. All rights reserved.</span>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing

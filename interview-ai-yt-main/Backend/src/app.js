const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const config = require("./config")

const app = express()

// Apply security headers
app.use(helmet())

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}))

// Rate Limiting Configurations
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    message: { message: "Too many requests from this IP. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Strict limit for registration/login/password updates
    message: { message: "Too many login or configuration attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
})

// Apply Rate Limiters
app.use("/api/", globalLimiter)
app.use("/api/auth/login", authLimiter)
app.use("/api/auth/register", authLimiter)
app.use("/api/auth/change-password", authLimiter)

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Global error handling middleware (Backend Hardening)
app.use((err, req, res, next) => {
    if (err instanceof require("multer").MulterError) {
        return res.status(400).json({
            message: `File upload limit exceeded: ${err.message}`
        })
    }
    
    if (err.message === "Only PDF files are supported.") {
        return res.status(400).json({
            message: err.message
        })
    }

    console.error("Unhandled Error:", err.stack)
    res.status(500).json({
        message: "Internal server error."
    })
})

module.exports = app
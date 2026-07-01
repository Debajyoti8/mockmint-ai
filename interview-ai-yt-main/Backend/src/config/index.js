require("dotenv").config()

const isProduction = process.env.NODE_ENV === "production"

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-for-dev-only",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  googleGenaiApiKey: process.env.GOOGLE_GENAI_API_KEY,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}


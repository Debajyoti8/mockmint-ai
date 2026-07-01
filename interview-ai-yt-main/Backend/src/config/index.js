require("dotenv").config()

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-for-dev-only",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  googleGenaiApiKey: process.env.GOOGLE_GENAI_API_KEY
}

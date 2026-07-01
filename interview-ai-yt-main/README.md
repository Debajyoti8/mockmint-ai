# MockMint AI 🍃
> "Mint your next opportunity."

MockMint AI is a premium SaaS-style AI-powered interview preparation platform. It parses resumes and target job descriptions using Gemini AI models to generate tailored technical & behavioral questions, identify skill gaps, and produce customized daily learning roadmaps.

---

## 🛠️ Tech Stack
* **Frontend**: React 19, Vite, React Router 7, Chart.js, SCSS / Vanilla CSS variables (with Dark & Light theme support).
* **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT).
* **AI Engine**: Google Gemini API.

---

## 🔑 Key Features
* **Interactive Dashboard**: Dynamically computes statistics (average match score, total preparation sessions) and tracks weekly activity heatmap.
* **Smart Session Planner**: Drag-and-drop resume upload (PDF/DOCX) combined with real-time text validation and character constraints.
* **Analytics Board**: Interactive Line (score trends), Bar (aggregated skill gap frequency), and Doughnut (match level ranges) charts powered by tree-shaken Chart.js.
* **Detailed Analytics Report**: Fully checkable Action Items list (progress feeds back into preparation readiness score), copy tools, and a print-friendly media layer for native PDF generation.
* **Unified Profile & Settings**: Custom password security updates and light/dark theme preference syncing via `localStorage`.

---

## 🛡️ Future Security Improvements

To maintain architectural simplicity at the current scale, several enterprise-level security paradigms are deferred to future enhancements. 

### 1. Global Session Invalidation via Token Versioning
* **Current State**: JWT session cookies are cleared locally on the user's browser during a password change or logout request. However, if a token was previously intercepted (e.g. via XSS or network eavesdropping), that stateless token remains cryptographically valid until its natural 24-hour expiration window closes.
* **Future Enhancement**: Introduce a `tokenVersion` counter field on the `User` schema (defaulting to `0`).
  * Sign the JWT incorporating `tokenVersion` inside the payload object.
  * Update the authentication middleware to query the database and assert `decoded.tokenVersion === user.tokenVersion`.
  * During a password update, increment `user.tokenVersion += 1` and save. This immediately invalidates all previously issued JWT tokens globally across every active browser or client with zero session leakage.

### 2. JWT Blacklist Cleanup Optimization
* **Current State**: Revoked tokens are logged in a `blacklistTokens` collection containing a 24-hour automatic TTL index for database self-maintenance.
* **Future Enhancement**: Implement a server-side cron service or Redis cache to handle high-frequency blacklist checks, keeping database read overhead minimum at high request volumes.

---

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v18+)
* MongoDB (Local instance or Atlas Connection)
* Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file using the provided `.env.example` template:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/mockmint
   JWT_SECRET=your-secure-secret
   CORS_ORIGIN=http://localhost:5173
   GOOGLE_GENAI_API_KEY=your-gemini-api-key
   ```
4. Run the development server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application on `http://localhost:5173`.

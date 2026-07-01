# MockMint AI — Interview Preparation Guide 🍃
> A candidate's companion guide explaining implementation, trade-offs, architectural design decisions, and potential interview questions.

---

## 🏗️ 1. Architecture & Design Patterns

### Q1: Why did you choose React + Vite instead of Next.js?
* **Trade-off / Decision**: Next.js is highly optimized for server-side rendering (SSR), which is excellent for public e-commerce websites but introduces unnecessary overhead for interactive, private dashboards. MockMint is a state-heavy dashboard application. Using a **Single Page Application (SPA)** architecture with Vite allows us to bundle the client app statically, deploy it cheaply via a CDN, and query a dedicated REST API, separating the client layout logic from database queries.
* **Potential Interview Follow-up**: *"How do you handle initial page load latency?"*
  * **Answer**: We solved this by using **Route-Based Code Splitting** via `React.lazy()` and `Suspense`. This allowed us to shrink the initial Javascript bundle size by **38.6%** (excluding Chart.js from the initial chunk), ensuring visitors load the landing page and login screens in under 1 second.

### Q2: Why did you choose MongoDB for storing reports rather than Postgres?
* **Trade-off / Decision**: Mongoose schema configurations fit perfectly with the unstructured nature of generative AI reports. A single preparation plan consists of nested arrays of technical questions, behavioral queries, and day-by-day learning tasks. 
  * Storing this as a single nested document in MongoDB avoids expensive multi-table joins (e.g. joining `Questions`, `Tasks`, and `Reports` tables) that relational databases would require, reducing read latency.

---

## 🔒 2. Security Implementations

### Q3: How did you implement secure session management?
* **Answer**: We used **HTTP-Only Cookies** storing stateless JWT tokens:
  ```javascript
  res.cookie("token", token, {
      httpOnly: true, // Prevents Javascript (XSS) from reading the cookie
      secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
      sameSite: "lax" // Mitigates Cross-Site Request Forgery (CSRF)
  })
  ```
* **Potential Interview Follow-up**: *"What is the vulnerability of a stateless JWT, and how did you mitigate it during logout/password changes?"*
  * **Answer**: Stateless JWTs cannot be revoked from the server without maintaining state. To log users out, we clear the browser's cookie. If an attacker intercepts the token prior to logout, it remains valid. To mitigate this:
    1. We maintain a `blacklistTokens` collection with an automatic Mongoose TTL index that auto-purges tokens after 24 hours.
    2. We documented a future scalability roadmap for **Token Versioning** (storing a `tokenVersion` counter on the user document and checking it in the auth middleware), allowing global session invalidation on password change.

---

## 🚀 3. Performance & Scale Optimizations

### Q4: How does the application scale as session counts grow?
* **Client-Side vs Server-Side**: Currently, the Session History view uses client-side searching and sorting because the user's data fits comfortably within memory.
* **Scalability Threshold**: If a user generates $\ge 500$ reports, we must migrate to **Server-Side Pagination**. 
  * *Reasoning*: Loading thousands of database documents in a single API call degrades response times and consumes unnecessary browser heap memory.
  * *Proposed API*: Implement pagination on the listing endpoint:
    `GET /api/interview?page=2&limit=10&search=react` using Mongo's `.skip()` and `.limit()` parameters.

### Q5: How did you prevent race conditions during report deletion?
* **Answer**: Instead of verifying ownership first and then calling a separate delete query (which creates a Time-of-Check to Time-of-Use timing window), we merged these actions into a single atomic operation:
  ```javascript
  const report = await interviewReportModel.findOneAndDelete({
      _id: interviewId,
      user: req.user.id
  })
  ```
  MongoDB handles matching criteria and deletion as an isolated transaction, eliminating concurrency issues.

---

## 🎨 4. CSS Design Systems

### Q6: Why did you use CSS custom properties (Variables) instead of TailwindCSS?
* **Answer**: Tailwind is fast for prototyping, but it results in verbose HTML class structures and can feel restrictive when creating custom themes. By writing vanilla SCSS/CSS using CSS variables, we created a lightweight theme selector. Switching theme classes on `document.documentElement` dynamically swaps variables (backgrounds, text colors, and borders) instantly without forcing React to re-render the components.

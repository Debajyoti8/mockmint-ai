import React from "react"
import { RouterProvider } from "react-router"
import { router } from "@/app.routes"
import { AuthProvider } from "@/context/AuthContext"
import { InterviewProvider } from "@/context/InterviewContext"

function App() {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("mockmint_theme") || "system"
    const applyTheme = (theme) => {
      const root = document.documentElement
      root.removeAttribute("data-theme")
      if (theme === "system") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.setAttribute("data-theme", systemDark ? "dark" : "light")
      } else {
        root.setAttribute("data-theme", theme)
      }
    }
    applyTheme(savedTheme)
  }, [])

  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App


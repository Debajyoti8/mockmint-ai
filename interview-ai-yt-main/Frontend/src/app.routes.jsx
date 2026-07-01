import React, { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router"
import Login from "@/features/auth/pages/Login"
import Register from "@/features/auth/pages/Register"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import Dashboard from "@/features/dashboard/pages/Dashboard"
import Home from "@/features/interview/pages/Home"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

// Lazy load non-critical views to optimize initial bundle loading speed
const InterviewReport = lazy(() => import("@/features/interview/pages/InterviewReport"))
const SessionHistory = lazy(() => import("@/features/interview/pages/SessionHistory"))
const Analytics = lazy(() => import("@/features/dashboard/pages/Analytics"))
const Settings = lazy(() => import("@/features/dashboard/pages/Settings"))
const Landing = lazy(() => import("@/features/dashboard/pages/Landing"))

// Suspense loading wrapper boundary
const SuspenseWrapper = ({ children }) => (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading page components..." />}>
        {children}
    </Suspense>
)

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
    },
    {
        path: "/session/new",
        element: <ProtectedRoute><Home /></ProtectedRoute>
    },
    {
        path: "/interview/:interviewId",
        element: <ProtectedRoute><SuspenseWrapper><InterviewReport /></SuspenseWrapper></ProtectedRoute>
    },
    {
        path: "/history",
        element: <ProtectedRoute><SuspenseWrapper><SessionHistory /></SuspenseWrapper></ProtectedRoute>
    },
    {
        path: "/analytics",
        element: <ProtectedRoute><SuspenseWrapper><Analytics /></SuspenseWrapper></ProtectedRoute>
    },
    {
        path: "/settings",
        element: <ProtectedRoute><SuspenseWrapper><Settings /></SuspenseWrapper></ProtectedRoute>
    },
    {
        path: "/landing",
        element: <SuspenseWrapper><Landing /></SuspenseWrapper>
    }
])
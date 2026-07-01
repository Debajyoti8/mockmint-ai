import React from "react"
import { createBrowserRouter } from "react-router"
import Login from "@/features/auth/pages/Login"
import Register from "@/features/auth/pages/Register"
import ProtectedRoute from "@/components/layout/ProtectedRoute"
import Dashboard from "@/features/dashboard/pages/Dashboard"
import Home from "@/features/interview/pages/Home"
import InterviewReport from "@/features/interview/pages/InterviewReport"

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
        element: <ProtectedRoute><InterviewReport /></ProtectedRoute>
    }
])
import React from "react"
import { Navigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

const ProtectedRoute = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return <LoadingSpinner fullScreen message="Verifying session..." />
    }

    if (!user) {
        return <Navigate to="/landing" />
    }

    return children
}

export default ProtectedRoute


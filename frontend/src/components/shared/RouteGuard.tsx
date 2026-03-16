import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores'
import type { ReactNode } from 'react'

interface RouteGuardProps {
  children: ReactNode
  requiredRole?: 'admin' | 'officer'
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isAuthenticated, role } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && role !== requiredRole) {
    // Redirect to their correct dashboard
    const redirect = role === 'admin' ? '/admin' : '/officer'
    return <Navigate to={redirect} replace />
  }

  return <>{children}</>
}

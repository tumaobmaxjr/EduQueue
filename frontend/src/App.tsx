import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { MainLayout, PublicLayout } from './layouts'
import { RouteGuard } from './components/shared/RouteGuard'
import { ErrorBoundary } from './components/shared'

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const KioskPage = lazy(() => import('./pages/KioskPage').then((m) => ({ default: m.KioskPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const OfficerPage = lazy(() => import('./pages/OfficerPage').then((m) => ({ default: m.OfficerPage })))
const DisplayPage = lazy(() => import('./pages/DisplayPage').then((m) => ({ default: m.DisplayPage })))

function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<KioskPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/display" element={<DisplayPage />} />
          </Route>

          {/* Protected routes — sidebar layout */}
          <Route element={<MainLayout />}>
            <Route
              path="/admin"
              element={
                <RouteGuard requiredRole="admin">
                  <AdminPage />
                </RouteGuard>
              }
            />
            <Route
              path="/officer"
              element={
                <RouteGuard requiredRole="officer">
                  <OfficerPage />
                </RouteGuard>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App

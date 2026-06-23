import { Suspense, lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isApiMode } from './config/env'
import { routes } from './lib/routes'
import { getSession } from './lib/session'

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const LoginPage = lazy(() => import('./pages/login/LoginPage'))
const EmpleadosPage = lazy(() => import('./pages/empleados/EmpleadosPage'))
const EmpleadoJuanPerezPage = lazy(() => import('./pages/empleado-detalle/EmpleadoDetallePage'))
const FicharPage = lazy(() => import('./pages/fichar/FicharPage'))
const FichadasPage = lazy(() => import('./pages/fichadas/FichadasPage'))
const HorariosPage = lazy(() => import('./pages/horarios/HorariosPage'))
const NovedadesPage = lazy(() => import('./pages/novedades/NovedadesPage'))
const CierrePage = lazy(() => import('./pages/cierre/CierrePage'))
const ExportacionesPage = lazy(() => import('./pages/exportaciones/ExportacionesPage'))
const MiAreaPage = lazy(() => import('./pages/mi-area/MiAreaPage'))
const MiFichadasPage = lazy(() => import('./pages/mi-area/MiFichadasPage'))
const MiNovedadesPage = lazy(() => import('./pages/mi-area/MiNovedadesPage'))
const MiFicharPage = lazy(() => import('./pages/mi-area/MiFicharPage'))

function homeForRole(role) {
  if (role === 'Empleado') return routes.miArea
  return routes.dashboard
}

function ProtectedRoute({ children, roles }) {
  if (!isApiMode()) return children
  const session = getSession()
  if (!session?.token) return <Navigate to={routes.login} replace />
  if (roles?.length && !roles.includes(session.user?.role)) {
    return <Navigate to={homeForRole(session.user?.role)} replace />
  }
  return children
}

function HomeRoute() {
  if (!isApiMode()) return <DashboardPage />
  const session = getSession()
  if (session?.user?.role === 'Empleado') {
    return <Navigate to={routes.miArea} replace />
  }
  return <DashboardPage />
}

function FallbackRoute() {
  if (!isApiMode()) return <Navigate to={routes.dashboard} replace />
  const session = getSession()
  if (!session?.token) return <Navigate to={routes.login} replace />
  return <Navigate to={homeForRole(session.user?.role)} replace />
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path={routes.dashboard} element={<ProtectedRoute roles={['Admin', 'Contador', 'Empleado']}><HomeRoute /></ProtectedRoute>} />
          <Route path={routes.login} element={<LoginPage />} />
          <Route path={routes.fichar} element={<FicharPage />} />
          <Route path={routes.miArea} element={<ProtectedRoute roles={['Empleado']}><MiAreaPage /></ProtectedRoute>} />
          <Route path={routes.miFichadas} element={<ProtectedRoute roles={['Empleado']}><MiFichadasPage /></ProtectedRoute>} />
          <Route path={routes.miNovedades} element={<ProtectedRoute roles={['Empleado']}><MiNovedadesPage /></ProtectedRoute>} />
          <Route path={routes.miFichar} element={<ProtectedRoute roles={['Empleado']}><MiFicharPage /></ProtectedRoute>} />
          <Route path={routes.empleados} element={<ProtectedRoute roles={['Admin']}><EmpleadosPage /></ProtectedRoute>} />
          <Route path={routes.empleadoDetalle} element={<ProtectedRoute roles={['Admin']}><EmpleadoJuanPerezPage /></ProtectedRoute>} />
          <Route path={routes.empleadoJuanPerez} element={<ProtectedRoute roles={['Admin']}><EmpleadoJuanPerezPage /></ProtectedRoute>} />
          <Route path={routes.fichadas} element={<ProtectedRoute roles={['Admin']}><FichadasPage /></ProtectedRoute>} />
          <Route path={routes.horarios} element={<ProtectedRoute roles={['Admin']}><HorariosPage /></ProtectedRoute>} />
          <Route path={routes.novedades} element={<ProtectedRoute roles={['Admin', 'Contador']}><NovedadesPage /></ProtectedRoute>} />
          <Route path={routes.cierre} element={<ProtectedRoute roles={['Admin', 'Contador']}><CierrePage /></ProtectedRoute>} />
          <Route path={routes.exportaciones} element={<ProtectedRoute roles={['Admin', 'Contador']}><ExportacionesPage /></ProtectedRoute>} />
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

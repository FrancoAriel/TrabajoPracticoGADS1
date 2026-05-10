import { Suspense, lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { routes } from './lib/routes'

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const LoginPage = lazy(() => import('./pages/login/LoginPage'))
const EmpleadosPage = lazy(() => import('./pages/empleados/EmpleadosPage'))
const EmpleadoJuanPerezPage = lazy(() => import('./pages/empleado-detalle/EmpleadoDetallePage'))
const FichadasPage = lazy(() => import('./pages/fichadas/FichadasPage'))
const HorariosPage = lazy(() => import('./pages/horarios/HorariosPage'))
const NovedadesPage = lazy(() => import('./pages/novedades/NovedadesPage'))
const CierrePage = lazy(() => import('./pages/cierre/CierrePage'))
const ExportacionesPage = lazy(() => import('./pages/exportaciones/ExportacionesPage'))

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path={routes.login} element={<LoginPage />} />
          <Route path={routes.empleados} element={<EmpleadosPage />} />
          <Route path={routes.empleadoDetalle} element={<EmpleadoJuanPerezPage />} />
          <Route path={routes.empleadoJuanPerez} element={<EmpleadoJuanPerezPage />} />
          <Route path={routes.fichadas} element={<FichadasPage />} />
          <Route path={routes.horarios} element={<HorariosPage />} />
          <Route path={routes.novedades} element={<NovedadesPage />} />
          <Route path={routes.cierre} element={<CierrePage />} />
          <Route path={routes.exportaciones} element={<ExportacionesPage />} />
          <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { routes } from '../../lib/routes'
import { createEmployee, listEmployees } from '../../services/employeeService'

const initialEmployees = [
  { legajo: '0042', name: 'Juan Perez', category: 'Operario', convenio: 'UOM', jornada: 'Completa', schedule: 'Manana', status: 'Activo', detail: true },
  { legajo: '0018', name: 'Ana Gomez', category: 'Administracion', convenio: 'Comercio', jornada: 'Completa', schedule: 'Central', status: 'Activo' },
  { legajo: '0031', name: 'Luis Diaz', category: 'Operario', convenio: 'UOM', jornada: 'Completa', schedule: 'Noche', status: 'Inactivo' },
  { legajo: '0050', name: 'Carla Ruiz', category: 'Supervision', convenio: 'Fuera de convenio', jornada: 'Parcial', schedule: 'Flexible', status: 'Activo' },
  { legajo: '0027', name: 'Martin Sosa', category: 'Operario', convenio: 'UOM', jornada: 'Completa', schedule: 'Tarde', status: 'Activo' },
  { legajo: '0064', name: 'Noelia Vera', category: 'Administracion', convenio: 'Comercio', jornada: 'Completa', schedule: 'Central', status: 'Activo' },
  { legajo: '0068', name: 'Pedro Luna', category: 'Operario', convenio: 'UOM', jornada: 'Parcial', schedule: 'Tarde', status: 'Activo' },
  { legajo: '0071', name: 'Rocio Mendez', category: 'Supervision', convenio: 'Fuera de convenio', jornada: 'Completa', schedule: 'Flexible', status: 'Activo' },
]

function calculateCuil(dni, sexo) {
  if (!dni || dni.length < 7) return ''
  const prefix = sexo === 'F' ? '27' : sexo === 'M' ? '20' : '23'
  return `${prefix}-${dni}-${dni.slice(-1)}`
}

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [stats, setStats] = useState({ active: 42, partial: 8, outOfAgreement: 4, newThisMonth: 3 })
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', jornada: '', status: '' })
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', sexo: 'M', fechaIngreso: '', categoria: 'Operario', convenio: 'UOM', jornada: 'Completa', parcialHoras: '4', horario: 'Manana', fichada: 'Biometrica' })
  const pageSize = 7

  useEffect(() => {
    document.title = 'Gestion de Empleados'
    let cancelled = false

    listEmployees().then((data) => {
      if (!cancelled) {
        setEmployees(data.items)
        setStats(data.stats)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const cuil = useMemo(() => calculateCuil(form.dni, form.sexo), [form.dni, form.sexo])

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = `${employee.legajo} ${employee.name}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !filters.category || employee.category === filters.category
      const matchesJornada = !filters.jornada || employee.jornada === filters.jornada
      const matchesStatus = !filters.status || employee.status === filters.status
      return matchesSearch && matchesCategory && matchesJornada && matchesStatus
    })
  }, [employees, search, filters])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize))
  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleSave = async (event) => {
    event.preventDefault()
    const created = await createEmployee(form)
    setEmployees((current) => [...current, created])
    setOpen(false)
  }

  return (
    <AppShell topbarTitle="EMPLEADOS">
      <PageHeader
        title="Gestion de Empleados"
        subtitle="Nomina activa, filtros y alta de personal."
        actions={<button type="button" onClick={() => setOpen(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">Nuevo empleado</button>}
      />

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Activos" value={String(stats.active)} icon="groups" valueClassName="text-on-secondary-container" />
        <StatCard label="Jornada parcial" value={String(stats.partial)} icon="schedule" valueClassName="text-tertiary" />
        <StatCard label="Fuera de convenio" value={String(stats.outOfAgreement)} icon="badge" valueClassName="text-primary" />
        <StatCard label="Altas del mes" value={String(stats.newThisMonth)} icon="person_add" valueClassName="text-on-background" />
      </div>

      <SectionCard title="NOMINA ACTIVA" icon="groups" bodyClassName="p-5">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar por legajo o empleado" className="rounded-lg border border-slate-200 bg-surface-container-low px-4 py-2.5 text-sm" />
          <select value={filters.category} onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1) }} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"><option value="">Categoria</option><option>Operario</option><option>Administracion</option><option>Supervision</option></select>
          <select value={filters.jornada} onChange={(e) => { setFilters((f) => ({ ...f, jornada: e.target.value })); setPage(1) }} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"><option value="">Jornada</option><option>Completa</option><option>Parcial</option></select>
          <select value={filters.status} onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1) }} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"><option value="">Estado</option><option>Activo</option><option>Inactivo</option></select>
          <button type="button" onClick={() => { setSearch(''); setFilters({ category: '', jornada: '', status: '' }); setPage(1) }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Limpiar</button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {['Legajo', 'Empleado', 'Categoria', 'Convenio', 'Jornada', 'Horario', 'Estado', ''].map((header) => (
                  <th key={header} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length ? paginatedEmployees.map((employee) => (
                <tr key={employee.legajo} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-medium">{employee.legajo}</td>
                  <td className="px-5 py-3.5 text-sm font-bold">{employee.detail ? <Link to={routes.empleadoJuanPerez} className="hover:text-primary hover:underline">{employee.name}</Link> : employee.name}</td>
                  <td className="px-5 py-3.5 text-sm">{employee.category}</td>
                  <td className="px-5 py-3.5 text-sm">{employee.convenio}</td>
                  <td className="px-5 py-3.5 text-sm">{employee.jornada}</td>
                  <td className="px-5 py-3.5 text-sm">{employee.schedule}</td>
                  <td className="px-5 py-3.5">{employee.status === 'Activo' ? <Badge className="bg-primary/10 text-primary">Activo</Badge> : <Badge className="bg-slate-200 text-slate-600">Inactivo</Badge>}</td>
                  <td className="px-5 py-3.5">{employee.detail ? <Link to={routes.empleadoJuanPerez} className="rounded border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">Ver</Link> : null}</td>
                </tr>
              )) : <tr><td colSpan="8" className="px-5 py-10 text-center text-sm text-on-surface-variant">Sin resultados para los filtros actuales.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
          <span>Pagina {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Anterior</button>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </SectionCard>

      <Modal open={open} title="Nuevo empleado" onClose={() => setOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Nombre" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
            <input required value={form.apellido} onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))} placeholder="Apellido" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
            <input required value={form.dni} onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value.replace(/\D/g, '') }))} placeholder="DNI" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
            <select value={form.sexo} onChange={(e) => setForm((f) => ({ ...f, sexo: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option value="M">Masculino</option><option value="F">Femenino</option><option value="X">X</option></select>
            <input value={cuil} readOnly placeholder="CUIL" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" />
            <input type="date" required value={form.fechaIngreso} onChange={(e) => setForm((f) => ({ ...f, fechaIngreso: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
            <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Operario</option><option>Administracion</option><option>Supervision</option></select>
            <select value={form.convenio} onChange={(e) => setForm((f) => ({ ...f, convenio: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>UOM</option><option>Comercio</option><option>Fuera de convenio</option></select>
            <select value={form.jornada} onChange={(e) => setForm((f) => ({ ...f, jornada: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Completa</option><option>Parcial</option></select>
            <select value={form.horario} onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Manana</option><option>Tarde</option><option>Noche</option><option>Central</option><option>Flexible</option></select>
            <select value={form.fichada} onChange={(e) => setForm((f) => ({ ...f, fichada: e.target.value }))} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Biometrica</option><option>App movil</option><option>Manual</option></select>
            {form.jornada === 'Parcial' ? <input type="number" min="1" max="7" value={form.parcialHoras} onChange={(e) => setForm((f) => ({ ...f, parcialHoras: e.target.value }))} placeholder="Horas por dia" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /> : <div />}
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancelar</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Guardar empleado</button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}

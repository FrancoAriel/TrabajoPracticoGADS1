import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { isApiMode } from '../../config/env'
import { createEmployee, createEmployeeAssignment, listEmployees } from '../../services/employeeService'
import { getLaborCatalogs } from '../../services/scheduleService'

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''

/** Columna tabla: mismo criterio que ficha Parcial (6hs). */
function textoJornadaLista(employee) {
  const j = employee.jornada
  if (j !== 'Parcial') return capitalize(j || '')
  if (employee.jornadaHoras) {
    const inner = employee.jornadaHoras.replace(/hs$/i, '').trim()
    return `Parcial (${inner}hs)`
  }
  return 'Parcial'
}

function getStatusDotClass(status) {
  const s = status?.toLowerCase()
  if (s === 'activo')    return 'bg-green-500'
  if (s === 'inactivo')  return 'bg-red-500'
  if (s === 'suspendido') return 'bg-yellow-400'
  return 'bg-slate-400'
}

function getStatusTextClass(status) {
  const s = status?.toLowerCase()
  if (s === 'activo')    return 'text-green-700'
  if (s === 'inactivo')  return 'text-red-600'
  if (s === 'suspendido') return 'text-yellow-700'
  return 'text-slate-500'
}

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getCategoryBadgeClass(category) {
  if (category === 'Administrativo') return 'bg-secondary-container/30 text-on-secondary-container'
  if (category === 'Operario') return 'bg-tertiary-container/30 text-on-tertiary-container'
  if (category === 'Técnico') return 'bg-surface-container-highest text-on-surface-variant'
  return 'bg-primary-container/30 text-on-primary-container'
}

function calculateCuil(dni, sexo) {
  if (!dni || dni.length < 7) return ''
  const prefix = sexo === 'F' ? '27' : sexo === 'M' ? '20' : '23'
  return `${prefix}-${dni}-${dni.slice(-1)}`
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]
    if (char === '"' && quoted && next === '"') {
      current += '"'
      i += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

function parseEmployeesCsv(text) {
  const lines = String(text).split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0]).map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

export default function EmpleadosPage() {
  const api = isApiMode()
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState({ totalActivos: 0, jornadaCompleta: 0, jornadaParcial: 0, bajasEsteMes: 0 })
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', jornada: '', status: '' })
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', sexo: '', fechaIngreso: '',
    categoria: '', convenio: '', jornada: '',
    parcialHoras: '4', horario: '', asignacionApi: '', fichada: 'Biométrico',
  })
  /** Catálogo real: horarios y ciclos activos (solo modo API). */
  const [catalogHorarios, setCatalogHorarios] = useState([])
  const [catalogCiclos, setCatalogCiclos] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const pageSize = 7

  useEffect(() => {
    if (!open || !api) return
    let c = false
    setCatalogLoading(true)
    getLaborCatalogs()
      .then((cat) => {
        if (!c) {
          setCatalogHorarios(cat?.horarios ?? [])
          setCatalogCiclos(cat?.ciclos ?? [])
        }
      })
      .catch(() => {
        if (!c) {
          setCatalogHorarios([])
          setCatalogCiclos([])
        }
      })
      .finally(() => {
        if (!c) setCatalogLoading(false)
      })
    return () => { c = true }
  }, [open, api])

  useEffect(() => {
    document.title = 'Gestión de Empleados'
    let cancelled = false
    listEmployees()
      .then((data) => {
        if (!cancelled) {
          setEmployees(data?.items ?? [])
          const st = data?.stats ?? {}
          setStats({
            totalActivos:    st.active          ?? st.totalActivos  ?? 0,
            jornadaCompleta: st.jornadaCompleta ?? 0,
            jornadaParcial:  st.jornadaParcial  ?? st.partial       ?? 0,
            bajasEsteMes:    st.bajasEsteMes    ?? 0,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEmployees([])
          setStats({ totalActivos: 0, jornadaCompleta: 0, jornadaParcial: 0, bajasEsteMes: 0 })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
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
    if (form.jornada === 'Parcial') {
      const h = Number(form.parcialHoras)
      if (!form.parcialHoras.trim() || Number.isNaN(h) || h < 1 || h > 7) {
        alert('Indicá las horas diarias de la jornada parcial (entre 1 y 7).')
        return
      }
    }
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        cuil,
        fechaIngreso: form.fechaIngreso,
        categoria: form.categoria,
        convenio: form.convenio,
        jornada: form.jornada,
        parcialHoras: form.jornada === 'Parcial' ? Number(form.parcialHoras) : undefined,
        fichada: form.fichada,
      }
      if (!api) payload.horario = form.horario
      const created = await createEmployee(payload)
      const legajoNuevo = created.id ?? created.legajo

      if (api && form.asignacionApi && form.fechaIngreso) {
        const [kind, idStr] = form.asignacionApi.split(':')
        const targetId = Number(idStr)
        if ((kind === 'horario' || kind === 'ciclo') && Number.isFinite(targetId)) {
          await createEmployeeAssignment(legajoNuevo, {
            type: kind === 'ciclo' ? 'ciclo' : 'horario',
            targetId,
            fechaDesde: form.fechaIngreso,
          })
        }
      }

      if (api) {
        const data = await listEmployees({ page: 1, pageSize: 500 })
        setEmployees(data?.items ?? [])
        const st = data?.stats ?? {}
        setStats({
          totalActivos:    st.active          ?? st.totalActivos  ?? 0,
          jornadaCompleta: st.jornadaCompleta ?? 0,
          jornadaParcial:  st.jornadaParcial  ?? st.partial       ?? 0,
          bajasEsteMes:    st.bajasEsteMes    ?? 0,
        })
      } else {
        setEmployees((current) => [...current, {
          id:       created.id,
          legajo:   created.legajo,
          name:     `${form.nombre} ${form.apellido}`,
          dni:      form.dni,
          category: form.categoria,
          convenio: form.convenio,
          jornada:  form.jornada,
          jornadaHoras:
            form.jornada === 'Parcial'
              ? `${String(Number(form.parcialHoras)).replace(/\.0$/, '')}hs`
              : null,
          fichada:  form.fichada || null,
          schedule: form.horario || null,
          status:   'Activo',
        }])
      }
      setOpen(false)
      setForm({
        nombre: '',
        apellido: '',
        dni: '',
        sexo: '',
        fechaIngreso: '',
        categoria: '',
        convenio: '',
        jornada: '',
        parcialHoras: '4',
        horario: '',
        asignacionApi: '',
        fichada: 'Biométrico',
      })
    } catch (err) {
      alert(`Error al guardar: ${err.message}`)
    }
  }

  async function reloadEmployees() {
    const data = await listEmployees({ page: 1, pageSize: 500 })
    setEmployees(data?.items ?? [])
    const st = data?.stats ?? {}
    setStats({
      totalActivos:    st.active          ?? st.totalActivos  ?? 0,
      jornadaCompleta: st.jornadaCompleta ?? 0,
      jornadaParcial:  st.jornadaParcial  ?? st.partial       ?? 0,
      bajasEsteMes:    st.bajasEsteMes    ?? 0,
    })
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setImportLoading(true)
    setImportResult('')
    try {
      const text = await file.text()
      const rows = parseEmployeesCsv(text)
      if (!rows.length) throw new Error('El CSV no contiene empleados.')
      const payloads = rows.map((row) => {
        const dni = String(row.dni ?? row.DNI ?? '').replace(/\D/g, '')
        const sexo = row.sexo ?? row.Sexo ?? 'X'
        const payload = {
          nombre: row.nombre ?? row.Nombre,
          apellido: row.apellido ?? row.Apellido,
          dni,
          cuil: row.cuil ?? row.CUIL ?? calculateCuil(dni, sexo),
          fechaIngreso: row.fechaIngreso ?? row.fecha_ingreso ?? row.Ingreso,
          categoria: row.categoria ?? row.Categoria ?? '',
          convenio: row.convenio ?? row.Convenio ?? '',
          jornada: row.jornada ?? row.Jornada ?? 'Completa',
          parcialHoras: row.parcialHoras || row.horasParcial ? Number(row.parcialHoras || row.horasParcial) : undefined,
          fichada: row.fichada ?? row.Fichada ?? 'Biométrico',
        }
        if (!payload.nombre || !payload.apellido || !payload.dni || !payload.cuil || !payload.fechaIngreso || !payload.jornada) {
          throw new Error('Cada fila debe incluir nombre, apellido, dni, cuil o sexo, fechaIngreso y jornada.')
        }
        return payload
      })
      await Promise.all(payloads.map((payload) => createEmployee(payload)))
      const createdCount = payloads.length
      if (api) await reloadEmployees()
      else {
        const data = await listEmployees()
        setEmployees(data?.items ?? [])
      }
      setImportResult(`${createdCount} empleado${createdCount === 1 ? '' : 's'} importado${createdCount === 1 ? '' : 's'} correctamente.`)
    } catch (e) {
      setImportResult(`Error: ${e.message}`)
    } finally {
      setImportLoading(false)
      event.target.value = ''
    }
  }

  const clearFilters = () => {
    setSearch('')
    setFilters({ category: '', jornada: '', status: '' })
    setPage(1)
  }

  const topbarContent = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <span className="material-symbols-outlined text-sm">search</span>
        </span>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
          className="w-64 rounded-md border-none bg-surface-container-low py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary"
          placeholder="BUSCAR POR NOMBRE O LEGAJO..."
          type="text"
        />
      </div>
      <button
        type="button"
        onClick={() => setPage(1)}
        className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-dim"
      >
        <span className="material-symbols-outlined text-sm">search</span> Buscar
      </button>
    </div>
  )

  const filtersAction = (
    <div className="flex gap-2">
      <div className="relative flex items-center">
        <select
          value={filters.category}
          onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1) }}
          className="min-w-[11rem] appearance-none rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-8 text-xs font-medium text-on-surface-variant"
        >
          <option value="">Todas las categorías</option>
          <option>Administrativo</option>
          <option>Operario / Planta</option>
          <option>Técnico</option>
          <option>Supervisor</option>
          <option>Gerencia</option>
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-2 text-base leading-none text-on-surface-variant">expand_more</span>
      </div>
      <div className="relative flex items-center">
        <select
          value={filters.jornada}
          onChange={(e) => { setFilters((f) => ({ ...f, jornada: e.target.value })); setPage(1) }}
          className="min-w-[9rem] appearance-none rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-8 text-xs font-medium text-on-surface-variant"
        >
          <option value="">Todas las jornadas</option>
          <option>Completa</option>
          <option>Parcial</option>
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-2 text-base leading-none text-on-surface-variant">expand_more</span>
      </div>
      <div className="relative flex items-center">
        <select
          value={filters.status}
          onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1) }}
          className="min-w-[9rem] appearance-none rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-8 text-xs font-medium text-on-surface-variant"
        >
          <option value="">Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo</option>
          <option>Suspendido</option>
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-2 text-base leading-none text-on-surface-variant">expand_more</span>
      </div>
      <button
        type="button"
        onClick={clearFilters}
        className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-background"
      >
        <span className="material-symbols-outlined text-sm">filter_alt_off</span> Limpiar
      </button>
    </div>
  )

  if (loading) {
    return (
      <AppShell topbarTitle="EMPLEADOS" topbarContent={topbarContent}>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando empleados...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell topbarTitle="EMPLEADOS" topbarContent={topbarContent}>
      <PageHeader
        title="Gestión de Empleados"
        subtitle="Administre el personal activo de la organización."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 rounded-md border border-primary/20 bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span> Importar CSV
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dim"
            >
              <span className="material-symbols-outlined text-sm">person_add</span> Nuevo empleado
            </button>
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-5 gap-4">
        <StatCard label="Total activos" value={String(stats.totalActivos ?? stats.active ?? 0)} valueClassName="text-on-secondary-container" />
        <StatCard label="Jornada completa" value={String(stats.jornadaCompleta ?? 0)} valueClassName="text-primary" />
        <StatCard label="Jornada parcial" value={String(stats.jornadaParcial ?? stats.partial ?? 0)} valueClassName="text-tertiary" />
        <StatCard label="Altas este mes" value={String(stats.altasEsteMes ?? stats.newThisMonth ?? 0)} valueClassName="text-green-600" />
        <StatCard label="Bajas este mes" value={String(stats.bajasEsteMes ?? 0)} valueClassName="text-error" />
      </div>

      <SectionCard title="NÓMINA ACTIVA" icon="group" action={filtersAction}>
        {paginatedEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30">search_off</span>
            <p className="text-sm font-semibold">Sin resultados para los filtros actuales.</p>
            <button type="button" onClick={clearFilters} className="mt-1 text-xs font-bold text-primary hover:underline">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    {['Legajo', 'Empleado', 'Categoría', 'Convenio', 'Jornada', 'Horario', 'Estado', 'Acción'].map((header) => (
                      <th key={header} className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedEmployees.map((employee) => {
                    const initials = getInitials(employee.name)
                    const categoryClass = getCategoryBadgeClass(employee.category)
                    return (
                      <tr key={employee.legajo} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-4 font-mono text-sm font-bold text-primary">{employee.legajo}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${employee.avatarBg ?? 'bg-blue-100'} ${employee.avatarText ?? 'text-primary'}`}>
                              {initials}
                            </div>
                            <div>
                              <Link to={`/empleados/${employee.id}`} className="text-sm font-bold hover:text-primary">
                                {employee.name}
                              </Link>
                              <p className="font-mono text-[11px] text-on-surface-variant">DNI {employee.dni ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${categoryClass}`}>
                            {employee.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-on-surface-variant">{employee.convenio || <span className="italic text-on-surface-variant/40">Sin convenio</span>}</td>
                        <td className="px-4 py-4 text-xs font-medium">{textoJornadaLista(employee)}</td>
                        <td className="px-4 py-4 text-xs text-on-surface-variant">{employee.schedule || <span className="italic text-on-surface-variant/40">Sin asignar</span>}</td>
                        <td className="px-4 py-4">
                          <span className={`flex items-center gap-1.5 text-[11px] font-bold ${getStatusTextClass(employee.status)}`}>
                            <span className={`h-2 w-2 rounded-full ${getStatusDotClass(employee.status)}`} />
                            {capitalize(employee.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/empleados/${employee.id}`}
                            className="rounded border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-blue-900"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-5 py-4 text-sm text-on-surface-variant">
              <span>Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        ) }
      </SectionCard>

      <Modal open={open} title="Nuevo Empleado" subtitle="Completá los datos del nuevo empleado." onClose={() => setOpen(false)}>
        <form onSubmit={handleSave} className="space-y-5 px-8 py-6">

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre *</label>
              <input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: María" className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Apellido *</label>
              <input required value={form.apellido} onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))} placeholder="Ej: López" className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">DNI *</label>
              <input required maxLength={8} value={form.dni} onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value.replace(/\D/g, '') }))} placeholder="Ej: 32456789" className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Sexo *</label>
              <select required value={form.sexo} onChange={(e) => setForm((f) => ({ ...f, sexo: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="X">No binario</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                CUIL <span className="ml-1 font-normal normal-case text-on-surface-variant">(calculado)</span>
              </label>
              <input value={cuil} readOnly placeholder="—" className="w-full cursor-default rounded-lg border border-outline-variant/20 bg-surface-container-highest px-3 py-2.5 font-mono text-sm font-bold text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Fecha de ingreso *</label>
              <input type="date" required value={form.fechaIngreso} onChange={(e) => setForm((f) => ({ ...f, fechaIngreso: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Categoría laboral *</label>
              <select required value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Seleccionar...</option>
                <option>Administrativo</option>
                <option>Operario / Planta</option>
                <option>Técnico</option>
                <option>Supervisor</option>
                <option>Gerencia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Convenio colectivo</label>
              <select value={form.convenio} onChange={(e) => setForm((f) => ({ ...f, convenio: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Sin convenio / No aplica</option>
                <option>Comercio (130/75)</option>
                <option>Metalúrgico (260/75)</option>
                <option>Gastronómico (389/04)</option>
                <option>Construcción (76/75)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo de jornada *</label>
              <select required value={form.jornada} onChange={(e) => setForm((f) => ({ ...f, jornada: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Seleccionar...</option>
                <option value="Completa">Completa</option>
                <option value="Parcial">Parcial</option>
              </select>
            </div>
          </div>

          {form.jornada === 'Parcial' && (
            <div className="overflow-hidden rounded-xl border border-primary/20 bg-primary-container/10">
              <div className="flex items-center gap-2 border-b border-primary/20 bg-primary-container/30 px-5 py-3">
                <span className="material-symbols-outlined text-sm text-primary">calendar_view_week</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">Configuración de jornada parcial</span>
              </div>
              <div className="px-5 py-4">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Horas diarias *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number" min="1" max="7" step="0.5"
                    value={form.parcialHoras}
                    onChange={(e) => setForm((f) => ({ ...f, parcialHoras: e.target.value }))}
                    placeholder="Ej: 4"
                    className="w-32 rounded-lg border border-outline-variant/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm font-medium text-on-surface-variant">hs / día <span className="text-on-surface-variant/60">(máx. 7)</span></span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Horario / Ciclo asignado</label>
              <select
                value={api ? form.asignacionApi : form.horario}
                onChange={(e) =>
                  setForm((f) =>
                    api ? { ...f, asignacionApi: e.target.value } : { ...f, horario: e.target.value },
                  )}
                disabled={api && catalogLoading}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              >
                <option value="">{api ? 'Sin asignar' : 'Sin asignar'}</option>
                {api ? (
                  <>
                    {(catalogHorarios ?? []).length > 0 ? (
                      <optgroup label="Horarios">
                        {catalogHorarios.map((h) => (
                          <option key={`h-${h.id}`} value={`horario:${h.id}`}>
                            H-{String(h.id).padStart(3, '0')} · {h.nombre}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    {(catalogCiclos ?? []).length > 0 ? (
                      <optgroup label="Ciclos rotativos">
                        {catalogCiclos.map((c) => (
                          <option key={`c-${c.id}`} value={`ciclo:${c.id}`}>
                            C-{String(c.id).padStart(3, '0')} · {c.nombre}
                            {c.duracionDias != null ? ` (${c.duracionDias} días)` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                  </>
                ) : (
                  <>
                    <option>H-001 Planta Mañana</option>
                    <option>H-002 Soporte Nocturno</option>
                    <option>H-003 Oficina central</option>
                    <option>C-001 4x2 Producción</option>
                    <option>C-002 Rotación planta A</option>
                  </>
                )}
              </select>
              {api && !catalogLoading && catalogHorarios.length === 0 && catalogCiclos.length === 0 ? (
                <p className="mt-1 text-[10px] text-on-surface-variant">No hay horarios o ciclos activos en el catálogo.</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Modalidad de fichada</label>
              <select value={form.fichada} onChange={(e) => setForm((f) => ({ ...f, fichada: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Biométrico</option>
                <option>App móvil</option>
                <option>PIN / Teclado</option>
                <option>QR</option>
                <option>Manual</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">person_add</span> Guardar empleado
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={importOpen} title="Importar empleados" subtitle="Carga masiva inicial desde CSV con encabezados." onClose={() => setImportOpen(false)} size="max-w-xl">
        <div className="space-y-5 px-8 py-6">
          <div className="rounded-lg bg-surface-container-low p-4 text-xs text-on-surface-variant">
            <p className="mb-2 font-bold text-on-surface">Encabezados aceptados</p>
            <p className="font-mono">nombre,apellido,dni,sexo,fechaIngreso,categoria,convenio,jornada,parcialHoras,fichada</p>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary-container/10 px-6 py-10 text-center transition-colors hover:bg-primary-container/20">
            <span className="material-symbols-outlined mb-2 text-4xl text-primary">upload_file</span>
            <span className="text-sm font-bold text-primary">{importLoading ? 'Importando...' : 'Seleccionar CSV'}</span>
            <span className="mt-1 text-xs text-on-surface-variant">El archivo se procesa localmente y se crean empleados con el endpoint actual.</span>
            <input type="file" accept=".csv,text/csv" disabled={importLoading} onChange={handleImportFile} className="hidden" />
          </label>
          {importResult && (
            <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${importResult.startsWith('Error') ? 'bg-error-container/30 text-error' : 'bg-green-50 text-green-700'}`}>
              {importResult}
            </div>
          )}
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setImportOpen(false)} className="rounded-lg border border-outline-variant/40 px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}

export const mockEmployees = [
  { id: 'emp_42',  legajo: '0042', name: 'Juan Perez',    dni: '30.111.222', category: 'Administrativo', convenio: 'Comercio (130/75)',    jornada: 'Completa', schedule: 'H-003 Oficina central',    status: 'Activo',   detail: true, avatarBg: 'bg-blue-100',   avatarText: 'text-primary' },
  { id: 'emp_18',  legajo: '0018', name: 'Ana Gomez',     dni: '28.445.601', category: 'Administrativo', convenio: 'Comercio (130/75)',    jornada: 'Parcial',  jornadaHoras: '6hs', schedule: 'H-003 Oficina central', status: 'Activo',   avatarBg: 'bg-purple-100', avatarText: 'text-tertiary' },
  { id: 'emp_27',  legajo: '0027', name: 'Martin Sosa',   dni: '33.987.412', category: 'Operario',       convenio: 'Metalúrgico (260/75)', jornada: 'Completa', schedule: 'C-002 Rotación planta A', status: 'Activo',   avatarBg: 'bg-slate-200',  avatarText: 'text-slate-600' },
  { id: 'emp_31',  legajo: '0031', name: 'Luis Diaz',     dni: '31.200.033', category: 'Operario',       convenio: 'Metalúrgico (260/75)', jornada: 'Completa', schedule: 'H-001 Planta Mañana',    status: 'Activo',   avatarBg: 'bg-red-100',    avatarText: 'text-error' },
  { id: 'emp_50',  legajo: '0050', name: 'Carla Ruiz',    dni: '35.120.099', category: 'Administrativo', convenio: 'Comercio (130/75)',    jornada: 'Parcial',  jornadaHoras: '4hs', schedule: 'H-003 Oficina central', status: 'Activo',   avatarBg: 'bg-purple-100', avatarText: 'text-tertiary' },
  { id: 'emp_158', legajo: '0158', name: 'Maria Alvez',   dni: '29.774.421', category: 'Operario',       convenio: 'Metalúrgico (260/75)', jornada: 'Completa', schedule: 'C-001 4x2 Producción',   status: 'Activo',   avatarBg: 'bg-slate-200',  avatarText: 'text-slate-600' },
  { id: 'emp_892', legajo: '0892', name: 'Roberto Gomez', dni: '27.663.300', category: 'Técnico',        convenio: 'Metalúrgico (260/75)', jornada: 'Completa', schedule: 'H-002 Soporte Nocturno', status: 'Activo',   avatarBg: 'bg-blue-100',   avatarText: 'text-primary' },
]

export const mockEmployeeStats = { totalActivos: 37, jornadaCompleta: 30, jornadaParcial: 7, altasEsteMes: 3, bajasEsteMes: 0 }

export const mockEmployeeDetail = {
  employee: {
    id: 'emp_42', legajo: '0042', name: 'Juan Perez', initials: 'JP',
    status: 'Activo', category: 'Administrativo', convenio: 'Comercio (130/75)',
    dni: '30.111.222', cuil: '20-30111222-3', fechaIngreso: '10/03/2023',
    jornada: 'Completa', fichada: 'Biométrico', schedule: 'H-003 Oficina central',
  },
  scheduleConfig: {
    tipo: 'Fijo', nombre: 'Oficina central', vigencia: '01/06/2025 en adelante',
    descanso: '60m', tolEntrada: '5m', tolSalida: '10m', umbralHE: '15m',
  },
  periodSummary: {
    workedDays: '20', absences: '1', late: '22m',
    he50: '6h 15m', he100: '0h 00m', missing: '40m', pending: '2',
  },
  weeklyGrid: [
    { day: 'Lunes',     workday: true,  entry: '09:00', exit: '18:00', note: '-' },
    { day: 'Martes',    workday: true,  entry: '09:00', exit: '18:00', note: '-' },
    { day: 'Miércoles', workday: true,  entry: '09:00', exit: '18:00', note: '-' },
    { day: 'Jueves',    workday: true,  entry: '09:00', exit: '18:00', note: '-' },
    { day: 'Viernes',   workday: true,  entry: '09:00', exit: '18:00', note: '-' },
    { day: 'Sábado',    workday: false, entry: '-',     exit: '-',     note: 'Descanso' },
    { day: 'Domingo',   workday: false, entry: '-',     exit: '-',     note: 'Descanso' },
  ],
  recentPunches: [
    {
      id: 'p1', date: '12/06/2025', times: '09:15 - 18:30',
      tags: [
        { label: 'Tardanza',          className: 'bg-tertiary-container text-on-tertiary-container' },
        { label: 'HE 50',             className: 'bg-primary-container text-on-primary-container' },
        { label: 'Descanso excedido', className: 'bg-error-container text-on-error-container' },
      ],
    },
    { id: 'p2', date: '11/06/2025', times: '08:58 - 18:02', interpret: 'Normal', interpretClassName: 'font-semibold text-on-secondary-container' },
    { id: 'p3', date: '10/06/2025', times: '-',              interpret: 'Ausencia justificada', interpretClassName: 'font-semibold text-error' },
  ],
  recentNews: [
    { id: '889', type: 'HE 50%',        detail: '12/06 - 0:30h',  status: 'Pendiente', statusColor: 'text-tertiary',  dotColor: 'bg-tertiary' },
    { id: '890', type: 'Justificación', detail: '10/06 - 1 día',  status: 'Aprobado',  statusColor: 'text-green-700', dotColor: 'bg-green-600' },
    { id: '891', type: 'Tardanza',      detail: '12/06 - 15m',    status: 'Rechazado', statusColor: 'text-error',     dotColor: 'bg-error' },
  ],
}

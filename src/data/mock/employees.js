export const mockEmployees = [
  { id: 'emp_42', legajo: '0042', name: 'Juan Perez', category: 'Operario', convenio: 'UOM', jornada: 'Completa', schedule: 'Manana', status: 'Activo', detail: true },
  { id: 'emp_18', legajo: '0018', name: 'Ana Gomez', category: 'Administracion', convenio: 'Comercio', jornada: 'Completa', schedule: 'Central', status: 'Activo' },
  { id: 'emp_31', legajo: '0031', name: 'Luis Diaz', category: 'Operario', convenio: 'UOM', jornada: 'Completa', schedule: 'Noche', status: 'Inactivo' },
  { id: 'emp_50', legajo: '0050', name: 'Carla Ruiz', category: 'Supervision', convenio: 'Fuera de convenio', jornada: 'Parcial', schedule: 'Flexible', status: 'Activo' },
  { id: 'emp_27', legajo: '0027', name: 'Martin Sosa', category: 'Operario', convenio: 'UOM', jornada: 'Completa', schedule: 'Tarde', status: 'Activo' },
  { id: 'emp_64', legajo: '0064', name: 'Noelia Vera', category: 'Administracion', convenio: 'Comercio', jornada: 'Completa', schedule: 'Central', status: 'Activo' },
  { id: 'emp_68', legajo: '0068', name: 'Pedro Luna', category: 'Operario', convenio: 'UOM', jornada: 'Parcial', schedule: 'Tarde', status: 'Activo' },
  { id: 'emp_71', legajo: '0071', name: 'Rocio Mendez', category: 'Supervision', convenio: 'Fuera de convenio', jornada: 'Completa', schedule: 'Flexible', status: 'Activo' },
]

export const mockEmployeeStats = { active: 42, partial: 8, outOfAgreement: 4, newThisMonth: 3 }

export const mockEmployeeDetail = {
  employee: { id: 'emp_42', legajo: '0042', name: 'Juan Perez', status: 'Activo', category: 'Operario', convenio: 'UOM' },
  scheduleConfig: { schedule: 'Manana', cycle: 'Fijo semanal', jornada: 'Completa' },
  periodSummary: { workedDays: '9', he50: '6h 15m', he100: '1h 00m', lateCount: '2', absenceCount: '0', pendingCount: '1' },
  weeklyGrid: [
    ['Lunes', '08:00', '17:00', 'Presente'],
    ['Martes', '08:02', '17:05', 'Presente'],
    ['Miercoles', '09:15', '17:00', 'Tardanza'],
    ['Jueves', '08:00', '17:40', 'HE 50%'],
    ['Viernes', '08:00', '17:00', 'Presente'],
    ['Sabado', '-', '-', 'Franco'],
    ['Domingo', '-', '-', 'Franco'],
  ],
  recentPunches: [
    { id: 'p1', date: '12/06/2025 09:15', type: 'Entrada', origin: 'Biometrica' },
    { id: 'p2', date: '11/06/2025 17:02', type: 'Salida', origin: 'Biometrica' },
  ],
  recentNews: [
    { id: 'n1', type: 'Horas extra 50%', quantity: '1h 45m', status: 'Pendiente' },
    { id: 'n2', type: 'Tardanza', quantity: '6 min', status: 'Registrada' },
  ],
}

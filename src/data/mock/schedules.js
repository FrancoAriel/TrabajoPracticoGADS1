export const mockScheduleOverview = {
  stats: { schedules: '3', cycles: '2', assignments: '12', flexible: '1' },
  schedules: [
    { id: 'HOR-01', nombre: 'Manana', detalle: '08:00 a 17:00', flexible: 'No' },
    { id: 'HOR-02', nombre: 'Tarde', detalle: '14:00 a 22:00', flexible: 'No' },
    { id: 'HOR-03', nombre: 'Flexible', detalle: '8h objetivo', flexible: 'Si' },
  ],
  cycles: [
    { id: 'CIC-01', nombre: '4x2', detalle: '4 dias trabajo / 2 libres', duracion: '6 dias' },
    { id: 'CIC-02', nombre: 'Rotativo semanal', detalle: 'Manana / Tarde / Noche', duracion: '21 dias' },
  ],
  assignments: [
    { id: 'ASG-01', empleado: 'Juan Perez', employeeId: 'emp_42', tipo: 'Horario', nombre: 'Manana', estado: 'Activa' },
    { id: 'ASG-02', empleado: 'Carla Ruiz', employeeId: 'emp_50', tipo: 'Horario', nombre: 'Flexible', estado: 'Activa' },
    { id: 'ASG-03', empleado: 'Ana Gomez', employeeId: 'emp_18', tipo: 'Ciclo', nombre: '4x2', estado: 'Pendiente' },
  ],
}

export const mockPunches = [
  { id: 'pun_1', employeeId: 'emp_42', legajo: '0042', empleado: 'Juan Perez', fecha: '12/06/2025 09:15', tipo: 'Entrada', origen: 'Biometrica', correccion: 'Si', estado: 'Tardanza' },
  { id: 'pun_2', employeeId: 'emp_18', legajo: '0018', empleado: 'Ana Gomez', fecha: '12/06/2025 08:45', tipo: 'Entrada', origen: 'Biometrica', correccion: '-', estado: 'Doble' },
  { id: 'pun_3', employeeId: 'emp_50', legajo: '0050', empleado: 'Carla Ruiz', fecha: '12/06/2025 08:58', tipo: 'Entrada', origen: 'App movil', correccion: '-', estado: 'Normal' },
  { id: 'pun_4', employeeId: 'emp_27', legajo: '0027', empleado: 'Martin Sosa', fecha: '12/06/2025 08:40', tipo: 'Salida', origen: 'Biometrica', correccion: '-', estado: 'Anticipada' },
  { id: 'pun_5', employeeId: 'emp_31', legajo: '0031', empleado: 'Luis Diaz', fecha: '12/06/2025 00:00', tipo: 'Ausencia', origen: 'Automatica', correccion: '-', estado: 'Ausente' },
]

export const mockPunchStats = { normal: '34', late: '7', double: '2', absence: '3' }

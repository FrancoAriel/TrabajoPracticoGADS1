export const mockClosure = {
  currentPeriod: 'Junio 2025',
  stats: { liquidated: '39', pending: '3', he50: '42h 15m', he100: '8h 00m' },
  periodCards: [
    { id: 'may-2025', label: 'Mayo 2025', status: 'Cerrado' },
    { id: 'jun-2025', label: 'Junio 2025', status: 'En progreso' },
    { id: 'jul-2025', label: 'Julio 2025', status: 'Futuro' },
  ],
  employeeBreakdown: [
    { id: 'emp_42', name: 'Juan Perez', normal: '72h', he50: '6h 15m', he100: '1h 00m', ausencias: '0', estado: 'OK' },
    { id: 'emp_18', name: 'Ana Gomez', normal: '68h', he50: '0', he100: '0', ausencias: '1', estado: 'Pendiente' },
    { id: 'emp_31', name: 'Luis Diaz', normal: '0', he50: '0', he100: '0', ausencias: '2', estado: 'Pendiente' },
  ],
  checklist: [
    'Revisar novedades pendientes',
    'Validar horas extra y ausencias',
    'Confirmar personal sin liquidar',
    'Ejecutar cierre cuando todos los puntos esten OK',
  ],
}

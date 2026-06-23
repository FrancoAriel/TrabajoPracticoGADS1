export const mockExports = {
  stats: { today: '12', csv: '12', pdf: '0', xlsx: '0' },
  reports: [
    { key: 'punches', label: 'Fichadas', periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV'] },
    { key: 'news', label: 'Novedades', periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV'] },
    { key: 'closure', label: 'Liquidacion mensual', periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV'] },
    { key: 'overtime', label: 'Horas extra', periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV'] },
    { key: 'employees', label: 'Nomina de empleados', periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV'] },
    { key: 'assignments', label: 'Horarios asignados', periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV'] },
  ],
  history: [
    { id: 'exp_1', report: 'Fichadas', period: 'Junio 2025', format: 'CSV', date: '12/06/2025 10:32', user: 'Admin' },
    { id: 'exp_2', report: 'Liquidacion mensual', period: 'Mayo 2025', format: 'CSV', date: '01/06/2025 18:11', user: 'Admin' },
  ],
}

# Flujos principales - Administrador y Contador

## Flujo del administrador

1. Ingresa al sistema con usuario administrador.
2. Mantiene datos maestros:
   - alta, edición y baja lógica de empleados;
   - definición de horarios fijos, flexibles y ciclos rotativos;
   - asignación de horarios o ciclos a empleados.
3. Revisa fichadas del día:
   - consulta entradas y salidas;
   - carga fichadas manuales con motivo;
   - registra correcciones sin modificar la fichada original.
4. Ejecuta o reprocesa el motor de reglas:
   - detecta tardanzas;
   - detecta ausencias;
   - detecta salidas anticipadas;
   - detecta horas extra al 50% o 100%;
   - detecta dobles fichadas para revisión.
5. Gestiona novedades:
   - revisa novedades automáticas;
   - carga novedades manuales;
   - aprueba o rechaza cada novedad.
6. Ejecuta el cierre mensual:
   - valida que no queden novedades pendientes;
   - confirma el resumen por empleado;
   - genera snapshot de novedades aprobadas;
   - marca el período como cerrado.
7. Exporta el resumen para el contador.

## Flujo del contador

1. Recibe el archivo exportado del cierre mensual.
2. Revisa el resumen por empleado:
   - días trabajados;
   - ausencias justificadas e injustificadas;
   - horas extra al 50%;
   - horas extra al 100%;
   - tardanzas acumuladas;
   - detalle de novedades aprobadas.
3. Importa o copia la información en su sistema de liquidación.
4. Solicita correcciones solo si detecta inconsistencias en el resumen.

## Reglas de trazabilidad

- Una fichada cruda no se modifica: las correcciones se guardan como nuevas fichadas referenciando la original.
- Las novedades automáticas pueden reprocesarse si cambian horarios o fichadas históricas.
- El cierre cerrado queda como snapshot inmutable.
- Solo las novedades aprobadas entran en el cierre mensual.
- La exportación es el output para liquidación; el sistema no calcula sueldo neto.

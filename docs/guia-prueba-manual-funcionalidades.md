# Guia de prueba manual de funcionalidades implementadas

## 1. Objetivo

Validar manualmente el frontend React y el backend local con Supabase real para comprobar las funcionalidades ya implementadas sin depender de pruebas automáticas.

## 2. Precondiciones

### Backend

Verificar `/home/maxi/TrabajoPracticoGADS1-backend/.env`:

```env
SUPABASE_URL=https://dkmxzzveiuyvpiuamtua.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
PORT=3000
```

Levantar backend:

```bash
cd /home/maxi/TrabajoPracticoGADS1-backend
npm run dev
```

### Frontend

Verificar `/home/maxi/TrabajoPracticoGADS1/.env`:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=/api
```

Levantar frontend:

```bash
cd /home/maxi/TrabajoPracticoGADS1
npm run dev -- --host 127.0.0.1 --port 5173
```

### Smoke inicial

1. Abrir `http://127.0.0.1:5173`.
2. Confirmar que no haya errores de red en consola por `Invalid API key`.
3. Confirmar que `GET /api/closures/current` y `GET /api/news` respondan 200 en la pestaña Network.

## 3. Recorrido base de UI

1. Entrar a `/#/login` y verificar render del login.
2. Entrar a `/#/` y verificar dashboard.
3. Verificar que aparezca el indicador `Dobles fichadas`.
4. Navegar a `/#/empleados`.
5. Navegar a `/#/horarios`.
6. Navegar a `/#/fichadas`.
7. Navegar a `/#/novedades`.
8. Navegar a `/#/cierre`.
9. Navegar a `/#/exportaciones`.

Resultado esperado:

- Todas las pantallas renderizan.
- No deben aparecer datos mock mientras se está cargando `cierre` o `novedades`.
- Deben verse loaders hasta que llegue la respuesta real.

## 4. Empleados

### Alta manual

1. Ir a `/#/empleados`.
2. Click en `Nuevo empleado`.
3. Completar datos requeridos.
4. Guardar.
5. Confirmar que el empleado aparezca en la lista.

### Importación CSV

1. Click en `Importar CSV`.
2. Usar un CSV con encabezados:

```csv
nombre,apellido,dni,sexo,fechaIngreso,categoria,convenio,jornada,parcialHoras,fichada
Test,Empleado,12345678,X,2026-06-01,Admin,Fuera de convenio,Completa,,Biométrico
```

3. Confirmar mensaje de éxito.
4. Confirmar que el empleado se vea en la tabla.

Caso negativo:

1. Probar una fila sin `dni` o sin `fechaIngreso`.
2. Confirmar mensaje de error.

## 5. Horarios

1. Ir a `/#/horarios`.
2. Verificar pestañas `Horarios`, `Ciclos rotativos`, `Asignaciones`.
3. Abrir cada pestaña.
4. Si hay datos disponibles, seleccionar filas y abrir detalle.
5. Probar apertura de modales:
   `Nuevo horario`, `Nuevo ciclo`, `Asignar horario`, `Asignar ciclo`.

Resultado esperado:

- La navegación entre tabs funciona.
- No hay crashes al abrir detalles o modales.

## 5.1 Detalle de empleado

1. Ir a `/#/empleados`.
2. Abrir un empleado existente.
3. Editar datos básicos y guardar.
4. Confirmar que el detalle se refresca con los datos persistidos.
5. Cambiar el estado laboral y guardar.
6. Confirmar que el badge y los campos del detalle reflejan el cambio.
7. Asignar horario o ciclo desde los modales del detalle.
8. Confirmar que la configuración visible del empleado se refresca después de guardar.
9. Cargar una novedad manual desde el detalle.
10. Confirmar que el bloque de novedades recientes se actualiza.
11. Cargar una fichada manual desde el detalle.
12. Confirmar que el bloque de fichadas recientes se actualiza.

## 6. Fichadas

1. Ir a `/#/fichadas`.
2. Confirmar que cargue la lista.
3. Abrir `Nueva fichada manual`.
4. Abrir una fichada existente si la tabla tiene datos.
5. Probar apertura del flujo de corrección si está disponible.

Resultado esperado:

- La pantalla carga sin errores.
- El modal manual abre correctamente.

## 7. Novedades

1. Ir a `/#/novedades`.
2. Confirmar que primero aparezca loader y luego datos reales.
3. Verificar KPIs reales: pendientes, aprobadas, rechazadas, total.
4. Filtrar por tipos:
   `Tardanza`, `Ausencia`, `Salida anticipada`, `Horas extra 50%`, `Horas extra 100%`, `Doble fichada`.
5. Seleccionar una novedad y revisar detalle.

### Aprobación real

1. Buscar una novedad `Pendiente`.
2. Click en `Aprobar`.
3. Confirmar toast de éxito.
4. Confirmar recarga de datos.
5. Confirmar que la novedad cambie a `Aprobado`.

### Rechazo real

1. Buscar una novedad `Pendiente`.
2. Click en `Rechazar`.
3. Completar motivo.
4. Confirmar rechazo.
5. Confirmar toast de éxito.
6. Confirmar que cambie a `Rechazado`.

Resultado esperado:

- No deben aparecer datos mock durante la carga.
- Los filtros deben funcionar con los tipos V4 del backend.

### Alta manual desde Novedades

1. Click en `Nueva novedad`.
2. Completar empleado, tipo, fecha y cantidad.
3. Guardar.
4. Confirmar toast de éxito.
5. Confirmar cierre del modal.
6. Confirmar refetch automático de la lista.
7. Verificar que la nueva novedad aparezca con estado `Pendiente`.

## 8. Cierre mensual

1. Ir a `/#/cierre`.
2. Confirmar que primero aparezca loader y luego datos reales.
3. Verificar:
   período actual, KPIs, tarjetas de período, tabla de empleados, checklist.
4. Confirmar que no aparezcan empleados o checklist mock mientras la API está cargando.

### Reproceso en simulación

1. Click en `Reprocesar período`.
2. Usar un rango corto.
3. Mantener `Simulación` activada.
4. Ejecutar.
5. Confirmar resultado:
   `created`, `ok`, `skipped`, `error`, `byRule`.

### Cierre real

Esta prueba es destructiva.

1. Ejecutarla solo si el equipo confirma que el período puede cerrarse.
2. Verificar antes que no queden pendientes.
3. Click en `Crear y cerrar` o `Ejecutar cierre`.
4. Confirmar mensaje de éxito.
5. Confirmar actualización del historial de cierres.

Resultado esperado:

- `/#/cierre` ya no debe romper por `Invalid API key`.
- En modo API no deben verse datos mock durante la carga.

## 9. Motor de reglas

### Dry run

1. Desde `/#/cierre`, usar `Reprocesar período` con `Simulación`.
2. Confirmar que vuelve un resumen por regla.
3. Revisar si aparecen reglas como:
   `ausencia`, `doble_fichada`, `tardanza`, `salida_anticipada`, `horas_extra_50`, `horas_extra_100`.

### Reproceso real

Esta prueba modifica novedades automáticas.

1. Ejecutarla solo con confirmación.
2. Desactivar `Simulación`.
3. Ejecutar reproceso.
4. Verificar en `/#/novedades` que cambien las novedades automáticas del rango.

## 10. Exportaciones

1. Ir a `/#/exportaciones`.
2. Verificar que carguen las cards.
3. Generar cada reporte disponible:
   `Fichadas`, `Novedades`, `Empleados`, `Cierre mensual`, `Horas extra`, `Horarios asignados`.
4. Descargar cada CSV.
5. Abrir cada archivo y validar columnas y contenido.

Resultado esperado:

- La generación devuelve descarga válida.
- El historial de exportaciones se actualiza si la pantalla lo refleja.

## 11. Verificaciones técnicas mínimas

1. Ejecutar build:

```bash
cd /home/maxi/TrabajoPracticoGADS1
npm run build
```

2. Confirmar que no falle el build.
3. Revisar consola del navegador durante el recorrido completo.
4. Revisar Network para confirmar que no haya 401/500 inesperados.

## 12. Casos que requieren cuidado

1. `Aprobar` o `Rechazar` novedades modifica datos reales.
2. `Reprocesar período` con `Simulación` desactivada modifica novedades automáticas.
3. `Ejecutar cierre` puede cerrar el período y generar snapshot real.

## 13. Criterio de cierre de prueba manual

La prueba manual queda aprobada cuando:

1. Todas las pantallas cargan sin errores fatales.
2. `Cierre` y `Novedades` no muestran datos mock antes de cargar datos reales.
3. `GET /api/closures/current`, `GET /api/news`, `POST /api/reasoning/reprocess-range` y `POST /api/exports` funcionan.
4. Al menos una aprobación o rechazo real de novedad fue validada.
5. Al menos una exportación real fue descargada y abierta.
6. Las pruebas destructivas se ejecutan solo con confirmación explícita.

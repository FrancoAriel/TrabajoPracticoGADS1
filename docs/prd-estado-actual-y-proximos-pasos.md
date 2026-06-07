# PRD - Estado actual, cambios implementados y pendientes

## 1. Objetivo

Documentar el estado real del trabajo practico Labor Pulse / Executive Architect despues de la implementacion V4, dejando trazabilidad de cambios en frontend, backend y base de datos, y una lista completa de pendientes para llegar a una entrega validada con datos reales.

## 2. Resumen ejecutivo

La aplicacion ya cuenta con la migracion React de las pantallas principales, integracion preparada contra backend, motor de reglas V4 expuesto desde UI, cierre mensual conectado a endpoints nuevos y exportaciones CSV conectables a API.

El bloqueo por `SUPABASE_SERVICE_ROLE_KEY` placeholder fue resuelto localmente el 2026-06-06 cargando una service role real en el `.env` no versionado del backend. Para desarrollo local, el frontend queda configurado con proxy Vite (`VITE_API_BASE_URL=/api`) para evitar CORS. Siguen pendientes las validaciones destructivas controladas: cierre real, reproceso real sin `dryRun` y aprobacion/rechazo real de novedades.

## 3. Cambios implementados en frontend

### 3.1 Configuracion e integracion API

- Se dejo el frontend preparado para modo API con `VITE_DATA_SOURCE=api`.
- Se corrigio la configuracion local recomendada para usar proxy Vite con `VITE_API_BASE_URL=/api`.
- El proxy Vite ya apunta `/api` al backend local `http://127.0.0.1:3000`.
- Se mantiene soporte mock para poder demo/probar UI cuando la API real esta bloqueada.

### 3.2 Dashboard

- Se agrego indicador de `Dobles fichadas` en el estado del periodo.
- Se actualizo el mock de dashboard para incluir `doublePunches`.
- Se normalizaron tipos de novedades para que `Horas_Extra_50`, `Horas_Extra_100`, `Salida_Anticipada` y `Doble_Fichada` se reflejen correctamente.
- Se mejoro accesibilidad puntual agregando texto oculto para la columna de acciones.

Archivos relevantes:

- `src/pages/dashboard/DashboardPage.jsx`
- `src/services/dashboardService.js`
- `src/data/mock/dashboard.js`

### 3.3 Empleados

- Se agrego importacion CSV desde la pantalla de empleados.
- El modal acepta encabezados: `nombre,apellido,dni,sexo,fechaIngreso,categoria,convenio,jornada,parcialHoras,fichada`.
- Se implemento parser CSV simple con soporte de comillas y comas dentro de campos quoted.
- Se valida que cada fila tenga datos minimos: nombre, apellido, DNI, CUIL o sexo, fecha de ingreso y jornada.
- En modo API, la importacion crea empleados usando el endpoint existente `createEmployee`.
- En modo mock, permite probar el flujo visual sin backend real.

Archivo relevante:

- `src/pages/empleados/EmpleadosPage.jsx`

### 3.4 Novedades

- La pantalla reconoce los nuevos tipos del motor V4:
  - `Salida_Anticipada`
  - `Horas_Extra_50`
  - `Horas_Extra_100`
  - `Doble_Fichada`
- Se corrigio el problema de casing entre backend y frontend: el frontend normaliza a lowercase para comparar tipos.
- Se amplio el filtro por tipo para contemplar las nuevas reglas.
- Se mantienen acciones de aprobacion/rechazo de novedades.

Archivo relevante:

- `src/pages/novedades/NovedadesPage.jsx`

### 3.5 Cierre mensual

- Se conecto la pantalla a `getCurrentClosure`.
- Se agrego accion de cierre usando `createClosure` y `runClosure`.
- Se agrego boton `Reprocesar periodo`.
- El modal de reproceso permite:
  - Fecha desde.
  - Fecha hasta.
  - Legajos opcionales separados por coma.
  - Checkbox de simulacion (`dryRun`).
- El modal muestra totales y desglose por regla cuando el backend responde.
- Se agrego fallback a mocks cuando no hay API.
- Se corrigio un bug detectado por E2E: el checklist ahora soporta tanto strings de mock como objetos de API.
- El boton de cierre queda deshabilitado si hay novedades pendientes.

Archivos relevantes:

- `src/pages/cierre/CierrePage.jsx`
- `src/services/closureService.js`
- `src/services/reasoningService.js`

### 3.6 Exportaciones

- Se conecto la pantalla a `getExportOptions`.
- Se agrego `createExport` para solicitar generacion del reporte.
- Se agrego `resolveDownloadUrl` para resolver descargas relativas/absolutas.
- Las cards de exportacion usan keys estables.
- En mock, la exportacion genera un CSV descargable para validar el flujo de UI.
- En API, la exportacion queda lista para consumir `/api/exports` y descargar desde `/api/exports/:id/download`.

Archivos relevantes:

- `src/pages/exportaciones/ExportacionesPage.jsx`
- `src/services/exportService.js`

### 3.7 Documentacion frontend

- Se agrego referencia en `README.md` a la documentacion de flujos.
- Se creo `docs/flujos-admin-contador.md` para documentar flujo administrador/contador.
- Se creo `docs/prd-reporte-e2e-trabajo-practico.md` con resultados de validacion E2E.
- Se creo este PRD como documento central de estado y pendientes.

## 4. Cambios implementados en backend

Repositorio: `/home/maxi/TrabajoPracticoGADS1-backend`.

### 4.1 Cierre mensual

Se reemplazo/amplio `src/routes/closures.js` con soporte real de cierre mensual:

- Helper de periodos en español (`Enero`, `Febrero`, etc.).
- Calculo de rango mensual desde label tipo `Junio 2026`.
- `GET /api/closures/current`:
  - Devuelve periodo actual.
  - Devuelve cierre actual si existe.
  - Calcula resumen del periodo.
  - Calcula novedades aprobadas y pendientes.
  - Calcula desglose por empleado.
  - Devuelve checklist de cierre.
  - Devuelve historial de cierres.
- `POST /api/closures`:
  - Crea cierre en borrador para un periodo.
  - Usa defaults locales cuando no se envia usuario/fecha.
- `POST /api/closures/:id/run`:
  - Valida que no queden pendientes salvo ejecucion forzada.
  - Genera snapshot en `cierre_mensual_detalle` con novedades aprobadas del periodo.
  - Marca cierre como cerrado.
  - Devuelve totales y desglose.
- `DELETE /api/closures/:id`:
  - Mantiene eliminacion segun ruta previa.

Archivo relevante:

- `/home/maxi/TrabajoPracticoGADS1-backend/src/routes/closures.js`

### 4.2 Exportaciones

Se reemplazo/amplio `src/routes/exports.js` con exportacion CSV:

- `GET /api/exports/options`:
  - Devuelve reportes disponibles.
  - Devuelve formatos soportados.
  - Devuelve periodos recientes.
  - Devuelve historial in-memory de exportaciones generadas.
- `POST /api/exports`:
  - Valida `reportKey` y formato CSV.
  - Consulta Supabase segun reporte solicitado.
  - Genera contenido CSV.
  - Registra el archivo generado en memoria.
  - Devuelve `downloadUrl`.
- `GET /api/exports/:id/download`:
  - Descarga el CSV generado.
  - Usa content-type `text/csv`.
  - Incluye BOM para compatibilidad con Excel.
- Reportes contemplados:
  - Fichadas.
  - Novedades.
  - Empleados.
  - Cierre mensual.
  - Horas extra.
  - Horarios asignados.

Archivo relevante:

- `/home/maxi/TrabajoPracticoGADS1-backend/src/routes/exports.js`

### 4.3 Motor de reglas V4

Estado reportado como implementado previamente:

- Tardanza.
- Ausencia.
- Salida anticipada.
- Horas extra 50% dias habiles.
- Horas extra 100% domingos y feriados.
- Doble fichada.
- Endpoint `POST /api/reasoning/reprocess-range` para borrar novedades automaticas previas y regenerar por rango.

Pendiente: validacion real contra Supabase cuando la key sea valida.

## 5. Cambios implementados en base de datos

### 5.1 Enum de novedades

Se agrego migracion local:

- `supabase/migrations/20260605000000_motor_v4_tipo_novedad_enum.sql`

Valores agregados a `tipo_novedad_enum`:

- `Salida_Anticipada`
- `Horas_Extra_50`
- `Horas_Extra_100`
- `Doble_Fichada`

### 5.2 Parametro de horas extra

Estado reportado como aplicado en Supabase:

- Se bajo `umbral_horas_extra_min` del horario `Turno Mañana Fijo` de `480` a `15` minutos.
- Motivo: `480` implicaba detectar horas extra recien despues de 8 horas adicionales, lo cual era incorrecto para el caso del TP.

### 5.3 Tablas involucradas por cierre/exportacion

Las rutas actuales asumen disponibilidad y permisos sobre:

- `empleado`
- `fichada`
- `novedad`
- `cierre_mensual`
- `cierre_mensual_detalle`

Pendiente: confirmar esquema final y permisos con key valida.

## 6. Validaciones ejecutadas

### 6.1 Frontend build

Comando:

```bash
npm run build
```

Resultado:

```text
✓ built
```

### 6.2 E2E UI mock

Resultado:

```text
1 passed
```

Cobertura:

- Login.
- Dashboard.
- Empleados e importacion CSV.
- Horarios, ciclos y asignaciones.
- Fichadas y modal de fichada manual.
- Novedades con tipos V4.
- Cierre mensual y reproceso.
- Exportaciones.

### 6.3 Backend smoke

Resultados actuales:

- `GET /health`: OK.
- `GET /api/exports/options`: OK.
- `GET /api/closures/current`: OK con datos reales.
- `GET /api/news`: OK con novedades reales.
- `POST /api/reasoning/reprocess-range` con `dryRun=true`: OK.
- `POST /api/exports` para reporte de empleados: OK.

### 6.4 React Doctor

Resultado:

```text
77 / 100
37 warnings
```

Lectura:

- No bloquea compilacion.
- Quedan warnings de accesibilidad, estado derivado y componentes grandes.
- No se corrigieron todos porque implican refactor amplio y la regla actual del repo pide evitar refactorizacion grande.

## 7. Bloqueos actuales

### 7.1 Supabase service role

Estado actual:

- Resuelto localmente el 2026-06-06.
- El backend usa una `SUPABASE_SERVICE_ROLE_KEY` real en `.env`, archivo ignorado por Git.
- `GET /api/closures/current` responde 200 OK con datos reales.
- Se agrego validacion defensiva en backend para detectar placeholders o ausencia de key al iniciar.

Pendiente operativo:

1. No commitear secretos.
2. Configurar la misma variable en Render/hosting si se prueba backend desplegado.
3. Mantener `.env.example` solo con placeholder descriptivo.

### 7.2 Configuracion local frontend/backend

Estado:

- Para evitar CORS en desarrollo local, el frontend debe usar el proxy de Vite.

Configuracion recomendada en `/home/maxi/TrabajoPracticoGADS1/.env`:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=/api
```

Alternativa:

- Mantener URL absoluta al backend y ampliar `CORS_ORIGINS` en backend con todos los origins locales usados.

## 8. Pendientes completos

### P0 - Desbloqueo obligatorio

1. Configurar `SUPABASE_SERVICE_ROLE_KEY` valida en backend local. Estado: hecho.
2. Reiniciar backend y confirmar `GET /health`. Estado: hecho.
3. Confirmar que `GET /api/closures/current` deja de devolver `Invalid API key`. Estado: hecho.
4. Confirmar que el frontend usa `VITE_API_BASE_URL=/api` o que CORS permite el origin exacto. Estado: hecho local.
5. Reiniciar frontend para que tome `.env`. Estado: hecho.
6. Reejecutar smoke API desde navegador en `/#/cierre`. Estado: hecho, E2E real paso.
7. Configurar la misma service role en el backend desplegado si se usa Render/produccion. Estado: pendiente.

### P1 - Validacion real del motor de reglas

1. Ejecutar `POST /api/reasoning/reprocess-range` con `dryRun=true` sobre un rango con fichadas reales.
2. Verificar totales `created`, `ok`, `skipped`, `error`.
3. Verificar desglose `byRule` para las 5 reglas.
4. Ejecutar reproceso real con `dryRun=false`.
5. Confirmar que borra/regenera solo novedades automaticas del rango.
6. Confirmar que no elimina novedades manuales.
7. Validar clasificacion de feriados/domingos para HE 100%.
8. Validar doble fichada menor a 5 minutos y estado de revision.

### P1 - Validacion real de novedades

1. Listar novedades desde UI y API.
2. Filtrar por cada tipo V4.
3. Aprobar novedad.
4. Rechazar novedad con motivo.
5. Confirmar persistencia en Supabase.
6. Confirmar que el dashboard refleja cambios.
7. Confirmar que cierre mensual se bloquea si hay pendientes.

### P1 - Validacion real de cierre mensual

1. Abrir `/#/cierre` con API real.
2. Confirmar carga de resumen mensual.
3. Confirmar desglose por empleado.
4. Confirmar checklist.
5. Intentar cerrar con pendientes y verificar bloqueo.
6. Aprobar/rechazar pendientes.
7. Ejecutar cierre.
8. Confirmar registro en `cierre_mensual`.
9. Confirmar snapshot en `cierre_mensual_detalle`.
10. Confirmar que el historial muestra el cierre.
11. Confirmar comportamiento ante cierre ya cerrado.

### P1 - Validacion real de exportaciones

1. Probar `GET /api/exports/options`.
2. Generar CSV de fichadas.
3. Generar CSV de novedades.
4. Generar CSV de empleados.
5. Generar CSV de cierre mensual.
6. Generar CSV de horas extra.
7. Generar CSV de asignaciones.
8. Descargar cada archivo desde `downloadUrl`.
9. Abrir CSV y validar columnas/contenido.
10. Confirmar historial de exportaciones en UI.

### P1 - Validacion de empleados

1. Crear empleado manual con API real.
2. Importar CSV con 1 empleado.
3. Importar CSV con multiples empleados.
4. Probar error por fila incompleta.
5. Confirmar listado actualizado.
6. Confirmar estadisticas actualizadas.
7. Confirmar que no se dupliquen legajos/DNI si backend lo valida.

### P1 - Validacion de horarios y asignaciones

1. Crear horario fijo.
2. Crear horario flexible si aplica al TP.
3. Crear ciclo rotativo.
4. Asignar horario a empleado.
5. Asignar ciclo a empleado.
6. Cambiar asignacion y reprocesar rango afectado.
7. Confirmar impacto en reglas de tardanza, ausencia, salida anticipada y horas extra.

### P2 - Calidad frontend

1. Asociar labels con controles en cierre y empleados.
2. Agregar labels accesibles a controles sin texto.
3. Reducir warnings de React Doctor.
4. Revisar estados vacios por pantalla.
5. Revisar mensajes de error API por pantalla.
6. Revisar loaders y disabled states en acciones asincronas.
7. Revisar responsive basico de modales y tablas.

### P2 - Calidad backend

1. Agregar validacion explicita de variables de entorno al iniciar backend.
2. Devolver error de configuracion claro si falta `SUPABASE_SERVICE_ROLE_KEY`.
3. Revisar manejo de CORS para entorno local y produccion.
4. Persistir historial de exportaciones si el TP lo requiere.
5. Agregar tests unitarios/integracion para cierre y exportaciones si se permite tooling.
6. Revisar id de usuario real en cierre en lugar de default local.
7. Revisar permisos/RLS esperados para service role.

### P2 - Base de datos

1. Confirmar que la migracion del enum esta aplicada en Supabase real.
2. Confirmar estructura de `cierre_mensual`.
3. Confirmar estructura de `cierre_mensual_detalle`.
4. Confirmar indices necesarios por `fecha_desde`, `legajo`, `estado`.
5. Confirmar que `cantidad` en novedades representa minutos para HE/tardanza.
6. Confirmar datos semilla minimos para demo.
7. Documentar rollback de migraciones si aplica.

### P3 - Entrega y demo

1. Preparar guion de demo Admin.
2. Preparar guion de demo Contador/RRHH.
3. Documentar credenciales/variables necesarias sin exponer secretos.
4. Preparar dataset demo con casos para las 5 reglas.
5. Capturar evidencia de E2E real post-fix.
6. Congelar alcance antes de entregar.

## 9. Definicion de terminado

La entrega se considera cerrada cuando:

1. Frontend y backend corren en modo API real sin CORS.
2. Supabase responde correctamente con service role valida.
3. Las 5 reglas generan novedades correctas sobre datos reales.
4. El reproceso regenera automaticas sin afectar manuales.
5. Novedades se aprueban/rechazan y persisten.
6. Cierre mensual genera snapshot reproducible.
7. Exportaciones descargan CSV reales.
8. E2E navegador pasa sin errores de consola relevantes.
9. `npm run build` pasa.
10. Los pendientes P0 y P1 estan cerrados o documentados como fuera de alcance.

## 10. Actualizacion 2026-06-07 - Implementacion de cierre de alcance

### 10.1 Backend implementado

1. Autenticacion con token firmado tipo JWT sin dependencias nuevas.
2. Middleware `requireAuth` para rutas privadas.
3. Middleware `requireRole` para permisos por rol.
4. Login real contra tabla `usuario`, con rechazo de usuarios inactivos.
5. Fallback temporal de desarrollo para login `admin` / `admin`, antes de consultar Supabase, con usuario `Admin Sistema` y rol `Admin`.
6. Proteccion de rutas:
   - Admin: empleados, fichadas, horarios, reproceso, alta/aprobacion/rechazo de novedades y ejecucion de cierre.
   - Admin/Contador: novedades, cierre y exportaciones.
   - Admin/Contador/Empleado: dashboard.
7. Registro generico de fichadas desde `POST /api/punches` con origen `Manual`, `Biometrico`, `Qr`, `Pin` o `Api`.
8. Evaluacion automatica de reglas despues de registrar fichadas manuales/simuladas.
9. Baja logica de empleados en lugar de eliminacion fisica.
10. Bloqueo de eliminacion destructiva de fichadas, novedades y cierres.
11. Regla nueva de descanso no tomado o excedido basada en `descanso_minimo_min`.
12. Exportaciones CSV con historial persistible en tabla `exportacion` si la migracion esta aplicada.
13. Descarga de exportaciones historicas reconstruyendo el CSV si el backend se reinicio.
14. Catalogos alineados a CSV como unico formato operativo.

### 10.2 Frontend implementado

1. Sesion persistida en `localStorage`.
2. Inyeccion automatica de `Authorization: Bearer` en requests API.
3. Limpieza de sesion ante `401`.
4. Rutas protegidas en modo API.
5. Menu lateral filtrado segun rol.
6. Topbar muestra usuario real de sesion.
7. Novedades reconoce `Descanso_No_Tomado` y `Descanso_Excedido`.
8. Contador ve novedades/cierre/exportaciones en modo solo lectura.
9. Acciones criticas de cierre, reproceso y aprobacion/rechazo piden confirmacion.
10. Fichadas permite registrar origen simulado: manual, biometrico, QR, PIN o API.
11. Exportaciones muestra CSV como unico formato operativo.
12. Descarga de CSV agrega `access_token` cuando usa link directo.

### 10.3 Base de datos / migraciones

1. Se agregaron al enum `tipo_novedad_enum`:
   - `Descanso_No_Tomado`
   - `Descanso_Excedido`
2. Se agrego migracion para tabla `exportacion`.
3. Pendiente operativo: aplicar ambas migraciones en Supabase real antes de validar descanso e historial persistido.

### 10.4 Validacion ejecutada

1. Frontend: `npm run build` OK.
2. Backend: `node --check` OK en rutas, app, auth y servicio de reglas modificados.
3. API smoke:
   - `GET /health`: OK.
   - `GET /api/closures/current` sin token: `401` esperado.
   - `POST /api/auth/login` con usuario Admin real: OK.
   - `POST /api/auth/login` con `admin` / `admin`: OK.
   - Token del fallback `admin` / `admin` contra `/api/closures/current`: OK.
   - `GET /api/closures/current` con token: OK.
   - `GET /api/exports/options` con token: OK.
   - `GET /api/news?pageSize=1` con token: OK.
   - `POST /api/exports` para empleados CSV: OK.
   - descarga CSV: OK.
   - `POST /api/punches` con origen `Qr`: OK, luego se limpio la fichada de smoke.
4. React Doctor:
   - Corregidas advertencias nuevas de Novedades.
   - Persisten dos warnings de calidad no bloqueantes: `EmpleadoDetallePage.jsx` y `CierrePage.jsx`.

### 10.5 Pendientes reales restantes

P0 - Aplicar migraciones en Supabase:

1. Ejecutar migracion de enum con `Descanso_No_Tomado` y `Descanso_Excedido`.
2. Ejecutar migracion de tabla `exportacion`.
3. Verificar que `POST /api/exports` persista historial.
4. Verificar que la regla de descanso pueda insertar novedades reales.

P0 - Validacion funcional completa con datos reales:

1. Crear dataset demo con fichadas para tardanza, ausencia, salida anticipada, HE 50, HE 100, doble fichada y descanso.
2. Ejecutar reproceso `dryRun=true`.
3. Ejecutar reproceso real solo con confirmacion.
4. Validar que automaticas se regeneran y manuales no se eliminan.
5. Validar dashboard, novedades y cierre despues del reproceso.

P1 - Seguridad y roles:

1. Crear o confirmar usuario Contador real.
2. Probar que Contador no pueda modificar novedades ni ejecutar cierre/reproceso.
3. Crear o confirmar usuario Empleado real.
4. Probar que Empleado no acceda a pantallas Admin.
5. Reemplazar o desactivar el fallback `admin` / `admin` antes de cualquier despliegue no local.
6. Definir una credencial demo segura si se necesita presentar sin depender de passwords reales de Supabase.

P1 - Cierre mensual:

1. Validar bloqueo con novedades pendientes.
2. Aprobar/rechazar novedades reales.
3. Ejecutar cierre real.
4. Confirmar snapshot en `cierre_mensual_detalle`.
5. Verificar que no pueda eliminarse destructivamente.

P1 - Exportaciones:

1. Generar y descargar todos los CSV: fichadas, novedades, empleados, cierre, horas extra y asignaciones.
2. Validar columnas contra necesidad del contador.
3. Confirmar historial visible en UI despues de aplicar tabla `exportacion`.

P2 - Calidad:

1. Resolver warnings restantes de React Doctor.
2. Agregar pruebas automatizadas si se permite tooling.
3. Preparar guion de demo con credenciales sin exponer secretos.

## 11. Actualizacion 2026-06-07 - Login demo local

### 11.1 Cambio aplicado

Se agrego un acceso de desarrollo hardcodeado para destrabar pruebas manuales locales:

- Usuario: `admin`
- Password: `admin`
- Rol: `Admin`
- Nombre visible: `Admin Sistema`

Este fallback vive en el backend y se ejecuta antes de consultar Supabase. No modifica la base de datos ni depende de la tabla `usuario`.

### 11.2 Archivos involucrados

- `/home/maxi/TrabajoPracticoGADS1-backend/src/routes/auth.js`

### 11.3 Validacion ejecutada

1. `node --check src/routes/auth.js`: OK.
2. `POST /api/auth/login` con `admin` / `admin`: OK.
3. Token obtenido contra `GET /api/closures/current`: OK, respuesta `200`.

### 11.4 Pendiente de seguridad

Este acceso debe considerarse temporal. Antes de entregar en un entorno compartido o productivo hay que:

1. Quitar el fallback `admin` / `admin`, o protegerlo con una variable de entorno tipo `ENABLE_DEV_LOGIN=true`.
2. Crear usuarios demo reales en Supabase con roles `Admin`, `Contador` y `Empleado`.
3. Documentar credenciales demo sin exponer service role ni claves privadas.

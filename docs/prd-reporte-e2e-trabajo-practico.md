# PRD - Reporte de pruebas E2E del Trabajo Practico

## 1. Objetivo

Validar end-to-end el estado funcional de la aplicacion Labor Pulse / Executive Architect contra los requerimientos del trabajo practico: administracion de empleados, horarios, fichadas, novedades, motor de reglas, cierre mensual y exportaciones.

## 2. Alcance probado

Se probaron las pantallas React productivas bajo `src/` y endpoints backend disponibles en `/home/maxi/TrabajoPracticoGADS1-backend`.

No se modificaron las referencias visuales HTML en `docs/`.

## 3. Herramientas y entorno

- Fecha de ejecucion: 2026-06-06.
- Frontend API local: `http://127.0.0.1:5174/`.
- Frontend mock local: `http://127.0.0.1:5175/`.
- Backend local: `http://127.0.0.1:3000/`.
- Runner E2E usado: Playwright temporal fuera del repo, sin agregar dependencia al proyecto.
- MCP Google: no disponible en esta sesion. La validacion se ejecuto con tooling local equivalente.

## 4. Resultado ejecutivo

| Area | Estado | Evidencia |
| --- | --- | --- |
| Navegacion principal | Aprobado en mock | Login, dashboard, empleados, horarios, fichadas, novedades, cierre y exportaciones renderizan. |
| UI de empleados | Aprobado en mock | Abre modal de importacion CSV. |
| UI de horarios | Aprobado en mock | Abre pestañas Horarios, Ciclos rotativos y Asignaciones. |
| UI de fichadas | Aprobado en mock | Abre modal de Nueva Fichada Manual. |
| UI de novedades | Aprobado en mock | Filtro reconoce Salida anticipada, HE 50%, HE 100% y Doble fichada. |
| UI de cierre mensual | Aprobado en mock | Abre modal de reproceso con rango, legajos opcionales y simulacion. |
| UI de exportaciones | Aprobado en mock | Renderiza cards y accion Exportar. |
| Backend health | Aprobado | `GET /health` devuelve 200. |
| Backend opciones de exportacion | Aprobado parcial | `GET /api/exports/options` devuelve 200 y reportes disponibles. |
| Backend datos Supabase | Bloqueado | Endpoints con datos fallan por `Invalid API key`. |
| E2E API real desde navegador | Bloqueado | Preflight CORS falla cuando el front apunta directo a `http://localhost:3000/api`. |

## 5. Pruebas E2E ejecutadas

### 5.1 Recorrido UI en modo mock

Comando equivalente ejecutado:

```bash
VITE_DATA_SOURCE=mock VITE_API_BASE_URL= npm run dev -- --host 127.0.0.1 --port 5175
cd /tmp/labor-pulse-e2e-runner
E2E_BASE_URL=http://127.0.0.1:5175 npx playwright test labor-pulse-e2e.spec.mjs --browser=chromium --reporter=line
```

Resultado:

```text
1 passed (2.5s)
```

Cobertura del recorrido:

1. Login renderiza marca y formulario.
2. Dashboard renderiza y muestra indicador de dobles fichadas.
3. Empleados renderiza y abre modal de importacion CSV.
4. Horarios renderiza y permite navegar entre horarios, ciclos y asignaciones.
5. Fichadas renderiza y abre modal de fichada manual.
6. Novedades renderiza y contiene los nuevos tipos del motor V4.
7. Cierre mensual renderiza y abre modal de reproceso.
8. Exportaciones renderiza y muestra accion de exportar.
9. No quedan errores de consola React en el flujo mock tras corregir `CierrePage`.

### 5.2 Endpoints backend locales

Comandos ejecutados:

```bash
curl -i http://127.0.0.1:3000/health
curl -i http://127.0.0.1:3000/api/exports/options
curl -i http://127.0.0.1:3000/api/closures/current
curl -i http://127.0.0.1:3000/api/news?pageSize=1
curl -i -X POST http://127.0.0.1:3000/api/reasoning/reprocess-range \
  -H 'Content-Type: application/json' \
  -d '{"desde":"2026-06-01","hasta":"2026-06-06","dryRun":true}'
```

Resultados:

- `GET /health`: 200 OK.
- `GET /api/exports/options`: 200 OK.
- `GET /api/closures/current`: 500 `Invalid API key`.
- `GET /api/news?pageSize=1`: 500 `Invalid API key`.
- `POST /api/reasoning/reprocess-range`: 500 `Invalid API key`.

## 6. Hallazgos

### 6.1 Bloqueante: credencial Supabase invalida

El backend esta levantado, pero los endpoints que consultan Supabase no pueden validarse con datos reales porque `SUPABASE_SERVICE_ROLE_KEY` sigue siendo placeholder o invalida.

Impacto:

- No se puede validar cierre mensual real con snapshots.
- No se puede validar reproceso real de reglas.
- No se puede validar novedades reales ni exportaciones reales dependientes de datos.

Accion requerida:

- Configurar en `/home/maxi/TrabajoPracticoGADS1-backend/.env` una `SUPABASE_SERVICE_ROLE_KEY` valida.
- Reiniciar backend.
- Reejecutar E2E API.

### 6.2 Bloqueante de integracion navegador: CORS por base URL local

El frontend API estaba ejecutandose con:

```text
VITE_API_BASE_URL=http://localhost:3000/api
```

Desde `http://127.0.0.1:5174`, el navegador considera otro origin y el backend rechaza el preflight.

Impacto:

- El recorrido navegador en modo API produce errores CORS antes de llegar a Supabase.

Accion recomendada:

- Para desarrollo local, usar el proxy Vite ya existente:

```text
VITE_API_BASE_URL=/api
```

- Alternativa: agregar `http://127.0.0.1:5174` y `http://localhost:5174` en `CORS_ORIGINS` del backend.

### 6.3 Corregido durante la validacion: checklist de cierre mock

El E2E mock detecto warnings React en `CierrePage` porque el mock de cierre entrega `checklist` como strings y la pagina esperaba objetos. Se normalizaron ambos formatos.

## 7. Criterios de aceptacion verificados

- La app compila visualmente y las rutas principales cargan en modo mock.
- Los flujos de UI requeridos tienen entrada navegable.
- Los nuevos tipos de novedades del motor V4 estan contemplados en la UI.
- El reproceso de periodo esta expuesto desde cierre mensual.
- Exportaciones tiene UI y backend base de opciones.

## 8. Criterios pendientes de validacion real

Quedan pendientes hasta resolver credenciales/CORS:

1. Reprocesar rango real y confirmar generacion/regeneracion de novedades automaticas.
2. Validar las 5 reglas contra datos reales desde UI y backend.
3. Ejecutar cierre mensual real y confirmar snapshot en base.
4. Descargar CSV real de fichadas, novedades, empleados, cierre, horas extra y asignaciones.
5. Validar flujo completo Admin/Contador con persistencia real.

## 9. Validacion final posterior a correcciones

### 9.1 Build frontend

Comando ejecutado:

```bash
npm run build
```

Resultado:

```text
✓ built
```

### 9.2 React Doctor

Comando ejecutado:

```bash
npx -y react-doctor@latest . --verbose --diff
```

Resultado:

```text
77 / 100 Needs work
37 warnings
```

Lectura del resultado:

- No bloqueo la build.
- Los avisos restantes son principalmente accesibilidad, estado derivado y componentes grandes.
- No se abordaron en esta iteracion porque implican refactor transversal y la regla del repo pide evitar refactorizacion grande en esta etapa.

## 10. Actualizacion de pendientes por error `Invalid API key`

Al ingresar a `/#/cierre`, el navegador ejecuta:

```bash
curl 'http://localhost:3000/api/closures/current' \
  -H 'Origin: http://localhost:5173'
```

La respuesta actual es:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Invalid API key"
  }
}
```

Diagnostico:

- El error se origina en el backend al consultar Supabase.
- La `SUPABASE_SERVICE_ROLE_KEY` local es placeholder/invalida.
- La key valida debe obtenerse desde Supabase Project Settings > API > `service_role`.
- El frontend local debe usar `VITE_API_BASE_URL=/api` para aprovechar el proxy Vite o el backend debe permitir el origin exacto por CORS.

Tareas pendientes agregadas al PRD de estado:

- P0: configurar service role real.
- P0: reiniciar backend.
- P0: confirmar `GET /api/closures/current` sin `Invalid API key`.
- P0: reiniciar frontend con `VITE_API_BASE_URL=/api`.
- P1: reejecutar E2E real de cierre, novedades, reproceso y exportaciones.

## 11. Actualizacion posterior: API key configurada y E2E real

Fecha: 2026-06-06.

Se recibieron credenciales reales de Supabase y se configuro localmente el backend sin versionar secretos.

Cambios realizados:

- Backend `.env` local actualizado con `SUPABASE_SERVICE_ROLE_KEY` real.
- Frontend `.env` local actualizado con `VITE_API_BASE_URL=/api` para usar proxy Vite.
- Backend reiniciado en `http://127.0.0.1:3000`.
- Frontend reiniciado en `http://127.0.0.1:5173`.
- Se actualizo `/home/maxi/TrabajoPracticoGADS1-backend/.env.example` para evitar el placeholder anterior.
- Se actualizo `.env.example` del frontend para recomendar `/api`.
- Se agrego validacion defensiva en `src/lib/supabase.js` del backend para fallar con mensaje claro si falta una service role real.

Validaciones reales ejecutadas:

- `GET /health`: 200 OK.
- `GET /api/closures/current`: 200 OK con periodo `Junio 2026` y 6 empleados activos.
- `GET /api/news?pageSize=3`: 200 OK con novedades reales.
- `POST /api/reasoning/reprocess-range` con `dryRun=true`: 200 OK, `created=16`, `ok=30`, `skipped=20`, `error=0`.
- `POST /api/exports` para reporte `employees`: 201 Created con `downloadUrl`.
- E2E navegador contra API real via proxy Vite: `1 passed`.
- `npm run build`: `✓ built`.

Pendientes que siguen vigentes:

- No se ejecuto cierre mensual real para no cerrar el periodo `Junio 2026` sin confirmacion explicita.
- No se ejecuto reproceso con `dryRun=false` para no modificar novedades automaticas reales sin confirmacion explicita.
- Falta validar descarga y contenido de todos los CSV, no solo generacion del reporte de empleados.
- Falta validar aprobacion/rechazo real de novedades desde UI.

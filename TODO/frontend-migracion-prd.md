# PRD Frontend - Migracion pendiente a React

## 1. Objetivo

Este documento define lo que falta migrar del frontend de `Labor Pulse / Executive Architect` desde las pantallas HTML de `docs/` hacia una implementacion React real, manteniendo:

- equivalencia visual con las pantallas de referencia
- navegacion funcional entre secciones
- estructura simple del proyecto
- Tailwind CSS como capa de estilos
- JavaScript en React sin agregar complejidad innecesaria

## 2. Estado actual

Hoy el proyecto ya tiene:

- base de React con Vite
- Tailwind configurado
- rutas principales creadas
- una pagina React por pantalla
- paginas migradas a JSX nativo como base de trabajo
- navegacion interna basica funcionando
- login mock funcionando
- fecha del dashboard funcionando
- layout compartido base
- componentes UI minimos
- services y mocks por dominio preparados para integracion API

Hoy el proyecto todavia no tiene:

- paridad visual fina validada en todas las pantallas
- logica completa de cada seccion en React
- toasts y feedbacks centralizados
- pruebas automatizadas o verificaciones visuales formales
- integracion con backend real

## 3. Meta de esta migracion

Pasar de un esquema de `HTML embebido como referencia` a una app React real donde:

1. cada pantalla exista como pagina React propia
2. cada pantalla tenga su logica implementada en React
3. la UI siga siendo visualmente equivalente a `docs/`
4. la navegacion interna reemplace por completo los links HTML originales
5. existan solo los componentes compartidos realmente necesarios
6. `docs/` permanezca como referencia visual hasta cerrar toda la migracion

## 4. Principios de implementacion

1. Migrar pantalla por pantalla.
2. Mantener cambios acotados.
3. Priorizar paridad visual antes que refactor grande.
4. No introducir librerias de UI.
5. Crear componentes compartidos solo cuando se repitan de verdad.
6. Mantener la logica cerca de cada pagina.
7. Usar mocks simples mientras no exista backend.
8. No borrar `docs/` en esta etapa.

## 5. Estructura definitiva propuesta

La estructura final debe seguir siendo simple, pero ya preparada para una app React mantenible.

```text
docs/
  index.html
  login.html
  empleados.html
  empleado-juan-perez.html
  fichadas.html
  horarios.html
  novedades.html
  cierre.html
  exportaciones.html

src/
  app/
    router.jsx

  components/
    layout/
      AppShell.jsx
      Sidebar.jsx
      Topbar.jsx
      PageHeader.jsx
    ui/
      Button.jsx
      Input.jsx
      Select.jsx
      Modal.jsx
      Table.jsx
      Badge.jsx
      StatCard.jsx
      Toast.jsx
      Tabs.jsx
      EmptyState.jsx
      Pagination.jsx
    feedback/
      ConfirmDialog.jsx
      LoadingOverlay.jsx

  data/
    empleados.js
    fichadas.js
    horarios.js
    novedades.js
    cierre.js
    exportaciones.js
    dashboard.js

  hooks/
    useToast.js
    useModal.js
    usePagination.js
    useFilters.js

  lib/
    routes.js
    formatters.js
    dates.js
    constants.js

  pages/
    dashboard/
      DashboardPage.jsx
      dashboard.constants.js
      dashboard.helpers.js
    login/
      LoginPage.jsx
    empleados/
      EmpleadosPage.jsx
      empleados.constants.js
      empleados.helpers.js
    empleado-detalle/
      EmpleadoDetallePage.jsx
      empleadoDetalle.constants.js
      empleadoDetalle.helpers.js
    fichadas/
      FichadasPage.jsx
      fichadas.constants.js
      fichadas.helpers.js
    horarios/
      HorariosPage.jsx
      horarios.constants.js
      horarios.helpers.js
    novedades/
      NovedadesPage.jsx
      novedades.constants.js
      novedades.helpers.js
    cierre/
      CierrePage.jsx
      cierre.constants.js
      cierre.helpers.js
    exportaciones/
      ExportacionesPage.jsx
      exportaciones.constants.js
      exportaciones.helpers.js

  styles/
    globals.css

  App.jsx
  main.jsx
  index.css
```

## 6. Estructura minima aceptable si se quiere mantener aun mas simple

Si se quiere evitar demasiados archivos auxiliares, esta version tambien es valida:

```text
src/
  components/
    layout/
    ui/
  lib/
  data/
  pages/
    dashboard/
      DashboardPage.jsx
    login/
      LoginPage.jsx
    empleados/
      EmpleadosPage.jsx
    empleado-detalle/
      EmpleadoDetallePage.jsx
    fichadas/
      FichadasPage.jsx
    horarios/
      HorariosPage.jsx
    novedades/
      NovedadesPage.jsx
    cierre/
      CierrePage.jsx
    exportaciones/
      ExportacionesPage.jsx
```

Recomendacion: usar esta segunda variante como base inicial y sumar archivos auxiliares solo cuando una pagina realmente los necesite.

## 7. Componentes compartidos necesarios

Estos son los compartidos que probablemente valga la pena crear en la siguiente iteracion.

### 7.1 Layout

- `AppShell`
- `Sidebar`
- `Topbar`
- `PageHeader`

Motivo:

- el layout lateral y superior se repite en casi todas las pantallas
- la navegacion principal debe centralizarse
- el item activo no deberia depender de manipular HTML crudo

### 7.2 UI base

- `Button`
- `Input`
- `Select`
- `Modal`
- `Badge`
- `Toast`
- `Pagination`
- `EmptyState`
- `Tabs`
- `StatCard`

Motivo:

- tablas, filtros, formularios, estados y modales se repiten en varias secciones
- conviene unificar estilos sin reinterpretar el diseno

### 7.3 Utilidades de comportamiento

- `useToast`
- `useModal`
- `usePagination`
- `useFilters`

Motivo:

- varias pantallas comparten patrones casi iguales de interaccion

## 8. Estado de migracion por seccion

### 8.1 Dashboard

Archivo referencia:

- `docs/index.html`

Estado actual hecho:

- ruta React creada
- render de referencia visual dentro de React
- navegacion por links internos funcionando
- item activo del menu funcionando
- fecha larga y corta del dashboard funcionando

Pendiente por migrar:

- convertir todo el markup a JSX real
- mover metricas y bloques a datos mock internos o constantes
- recrear cards de metricas como estructura React
- recrear secciones de alertas, actividad y novedades pendientes como listas React
- recrear acciones rapidas en componentes reales
- validar responsive en la version React nativa

Resultado esperado al cerrar la seccion:

- Dashboard sin `dangerouslySetInnerHTML`
- datos mock aislados
- layout y estilos iguales a `docs/index.html`

### 8.2 Login

Archivo referencia:

- `docs/login.html`

Estado actual hecho:

- ruta React creada
- render visual migrado como referencia embebida
- toggle mostrar/ocultar password funcionando
- validacion basica de vacios funcionando
- login mock `admin/admin` funcionando
- loading y redireccion basicos funcionando

Pendiente por migrar:

- pasar el formulario a JSX controlado o sem-controlado
- mover estado de errores a React
- mover estado loading a React
- mover autenticacion mock a una funcion aislada
- estandarizar mensajes y manejo de submit
- preparar el punto de entrada para futura integracion con backend real

Resultado esperado al cerrar la seccion:

- Login 100% React sin listeners manuales sobre HTML inyectado

### 8.3 Empleados

Archivo referencia:

- `docs/empleados.html`

Estado actual hecho:

- ruta React creada
- referencia visual embebida
- navegacion general funcionando

Pendiente por migrar:

- reconstruir tabla de empleados en JSX
- migrar buscador
- migrar filtros
- migrar paginacion
- migrar estado sin resultados
- migrar modal `Nuevo empleado`
- migrar alta mock de empleado
- migrar calculo automatico de CUIL
- migrar toggle de jornada parcial
- migrar validacion de horas cuando corresponda
- migrar toast de confirmacion
- conectar links al detalle del empleado en rutas React reales

Resultado esperado al cerrar la seccion:

- gestion de empleados funcionando de punta a punta en React con mocks

### 8.4 Detalle de empleado

Archivo referencia:

- `docs/empleado-juan-perez.html`

Estado actual hecho:

- ruta React creada
- referencia visual embebida
- resaltado de menu en Empleados preservado
- navegacion general funcionando

Pendiente por migrar:

- convertir cabecera de perfil y resumen a JSX
- migrar barra de acciones
- migrar configuracion de horario activo
- migrar grilla semanal
- migrar tabla de ultimas fichadas
- migrar tabla de novedades recientes
- migrar modal de edicion de empleado
- migrar modal de asignacion de horario/ciclo
- migrar modal de carga de novedad
- migrar modal de fichada manual
- migrar calculo de CUIL
- migrar campos condicionales de novedad segun tipo
- migrar toasts y feedbacks

Resultado esperado al cerrar la seccion:

- detalle de empleado operable enteramente en React

### 8.5 Fichadas

Archivo referencia:

- `docs/fichadas.html`

Estado actual hecho:

- ruta React creada
- referencia visual embebida
- navegacion general funcionando

Pendiente por migrar:

- reconstruir tabla principal en JSX
- migrar filtros y buscador
- migrar paginacion
- migrar reloj en vivo con React
- migrar modal de detalle
- migrar modal de nueva fichada manual
- migrar modal de correccion
- migrar bloque de trazabilidad condicional
- migrar accion mock de reprocesar
- migrar toasts
- conectar acceso al detalle de empleado con ruta React

Resultado esperado al cerrar la seccion:

- operacion de fichadas simulada totalmente dentro de React

### 8.6 Horarios

Archivo referencia:

- `docs/horarios.html`

Estado actual hecho:

- ruta React creada
- implementacion JSX nativa en curso
- tabs, buscador, filtros, tablas, paneles de detalle y modales base recreados en React
- navegacion operativa dentro de la app React

Pendiente por migrar:

- ajustar paridad visual fina contra `docs/horarios.html`
- completar comportamiento mock de modales y acciones segun referencia
- conservar contratos de datos ya definidos para no romper la futura integracion API

Resultado esperado al cerrar la seccion:

- horarios como modulo React real, sin interacciones inline

### 8.7 Novedades

Archivo referencia:

- `docs/novedades.html`

Estado actual hecho:

- ruta React creada
- referencia visual embebida
- navegacion general funcionando

Pendiente por migrar:

- reconstruir listado y detalle en JSX
- migrar filtros
- migrar buscador
- migrar paginacion
- migrar seleccion de novedad
- migrar modal de alta
- migrar modal de rechazo
- migrar fecha automatica de creacion
- migrar campos condicionales por tipo de novedad
- migrar accion aprobar
- migrar accion rechazar
- mantener sincronizado listado y detalle
- migrar toast

Resultado esperado al cerrar la seccion:

- gestion de novedades completa en React con estado local consistente

### 8.8 Cierre mensual

Archivo referencia:

- `docs/cierre.html`

Estado actual hecho:

- ruta React creada
- referencia visual embebida
- navegacion general funcionando

Pendiente por migrar:

- reconstruir resumen del periodo en JSX
- migrar metricas
- migrar tarjetas de periodos
- migrar tabla de desglose por empleado
- migrar seleccion de fila
- migrar panel lateral de desglose individual
- migrar checklist de cierre
- conectar links a Novedades dentro de la app React
- dejar preparado estado de boton de cierre aunque siga mockeado

Resultado esperado al cerrar la seccion:

- cierre mensual navegable y consistente dentro del flujo React

### 8.9 Exportaciones

Archivo referencia:

- `docs/exportaciones.html`

Estado actual hecho:

- ruta React creada
- referencia visual embebida
- navegacion general funcionando

Pendiente por migrar:

- reconstruir cards de exportacion en JSX
- migrar selects y parametros por reporte
- migrar accion mock de exportar
- migrar historial de exportaciones
- migrar accion de re-descarga mock
- migrar toast

Resultado esperado al cerrar la seccion:

- exportaciones con comportamiento mock nativo en React

## 9. Pendientes transversales

Estos puntos no pertenecen solo a una pantalla y deben resolverse en paralelo o por etapas.

### 9.1 Router y rutas

Hecho:

- rutas base creadas

Pendiente:

- mover definicion de rutas a `src/lib/routes.js` o `src/app/router.jsx`
- normalizar nombres de rutas
- preparar breadcrumbs donde haga falta

### 9.2 Layout compartido

Hecho:

- no existe layout React compartido aun

Pendiente:

- crear `AppShell`
- crear `Sidebar`
- crear `Topbar`
- mover la navegacion recurrente a React real

### 9.3 Formularios

Hecho:

- solo login parcialmente resuelto

Pendiente:

- unificar estilos de inputs, selects y labels
- unificar validaciones basicas
- definir estrategia simple para formularios mock

### 9.4 Modales

Hecho:

- no existen modales React compartidos aun

Pendiente:

- crear un `Modal` base reutilizable
- migrar todos los modales de cada pagina a ese patron

### 9.5 Toasts y feedback

Hecho:

- no existe sistema centralizado

Pendiente:

- crear `Toast` y `useToast`
- unificar mensajes de exito y error

### 9.6 Datos mock

Hecho:

- los datos hoy siguen anclados a los HTML de referencia

Pendiente:

- mover datos mock a `src/data/`
- separar datos por dominio
- mantener nombres legibles y faciles de editar

### 9.7 Tablas y listados

Hecho:

- no hay tablas React reales aun

Pendiente:

- crear patron simple para tablas
- definir render de filas, estado vacio y acciones
- reutilizar paginacion sin sobreabstraer

## 10. Orden recomendado de migracion

Orden propuesto para minimizar riesgo:

1. crear estructura definitiva de carpetas por pagina
2. crear layout compartido React
3. crear componentes UI minimos compartidos
4. migrar Login a React nativo
5. migrar Dashboard a React nativo
6. migrar Empleados
7. migrar Detalle de empleado
8. migrar Novedades
9. migrar Fichadas
10. migrar Horarios
11. migrar Cierre mensual
12. migrar Exportaciones

## 11. Definicion de terminado por pantalla

Una seccion se considera migrada cuando cumple todo esto:

- ya no depende de HTML inyectado desde `docs/`
- todo su markup vive en JSX propio
- la navegacion interna usa React Router
- la logica de interaccion vive en React
- los modales son React reales
- filtros, formularios y tablas funcionan
- mantiene paridad visual con la referencia HTML
- compila sin errores

## 12. Definicion de terminado global

La migracion frontend se considerara terminada cuando:

- todas las pantallas esten en JSX real
- no quede dependencia activa de `ReferencePage`
- `docs/` quede solo como referencia historica
- la navegacion completa funcione dentro de React
- todos los comportamientos mock actuales existan en React
- la estructura final de carpetas este consolidada
- exista un set minimo de compartidos reutilizados correctamente

## 13. Estado resumido por modulo

| Modulo | Ruta React | Visual base | Logica React | Estado |
|---|---|---:|---:|---|
| Dashboard | Si | Si | Parcial minima | En migracion |
| Login | Si | Si | Parcial | En migracion |
| Empleados | Si | Si | No | Pendiente |
| Detalle empleado | Si | Si | No | Pendiente |
| Fichadas | Si | Si | No | Pendiente |
| Horarios | Si | Si | No | Pendiente |
| Novedades | Si | Si | No | Pendiente |
| Cierre mensual | Si | Si | No | Pendiente |
| Exportaciones | Si | Si | No | Pendiente |

## 14. Entregables de la siguiente iteracion

La siguiente iteracion deberia dejar como minimo:

1. estructura de carpetas por pagina creada
2. layout compartido base creado
3. componentes compartidos minimos creados
4. Login y Dashboard migrados a JSX nativo
5. una estrategia clara para tablas, modales y toasts

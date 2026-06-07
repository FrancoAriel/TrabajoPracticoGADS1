# PRD - Alcance Completo del Trabajo Practico

Fuente base: `/home/maxi/Downloads/GADS---Especificacion-Requisitos-Trabajo-Practico_1 (1).pdf`

Este documento define el alcance funcional completo que debe cubrir el sistema, independientemente de si cada punto ya esta implementado, parcialmente implementado o pendiente. Debe usarse como referencia maestra para planificar, validar y cerrar el trabajo practico.

## 1. Producto

El producto es un sistema de gestion de novedades laborales y control horario para pymes. Su objetivo es centralizar informacion laboral, interpretar fichadas contra horarios esperados, generar novedades estructuradas y consolidar un resumen de preliquidacion para el contador.

El sistema no liquida sueldos. Su responsabilidad termina en preparar informacion ordenada, validada, trazable y exportable para que el contador pueda liquidar correctamente.

## 2. Problema A Resolver

Las pymes suelen operar con planillas, papel, WhatsApp, relojes biometricos aislados y archivos dispersos. Esto genera errores, discusiones con empleados, falta de trazabilidad y cierres mensuales lentos.

El administrador necesita saber que paso durante el periodo laboral sin reconstruir informacion manualmente. El contador necesita recibir datos consistentes, claros y exportables, sin interpretar mensajes ambiguos o planillas incompletas.

## 3. Objetivos Funcionales

1. Ordenar la informacion laboral en una unica base de datos.
2. Calcular automaticamente novedades a partir de fichadas, horarios y reglas configuradas.
3. Consolidar la informacion por empleado y por periodo.
4. Exportar un resumen de preliquidacion para el contador.

## 4. Alcance Incluido

El sistema debe incluir:

- Gestion de empleados: alta, baja logica, modificacion y datos laborales basicos.
- Definicion y asignacion de horarios, turnos fijos, turnos rotativos, jornadas flexibles y jornadas parciales.
- Registro de fichadas por multiples medios: biometrico, QR, PIN, manual y API.
- Separacion estricta entre fichada cruda e interpretacion de negocio.
- Motor de reglas para detectar tardanzas, ausencias, horas extra, salida anticipada, doble fichada y descanso no tomado o excedido.
- Gestion de novedades automaticas y manuales.
- Aprobacion y rechazo de novedades.
- Cierre mensual con snapshot inmutable.
- Exportacion del resumen al contador en formato consistente.
- Roles y permisos para administrador, empleado y contador.
- Trazabilidad de acciones relevantes.

## 5. Fuera De Alcance

Queda fuera del alcance de esta version:

- Liquidacion completa de sueldos.
- Calculo de remuneracion neta.
- Soporte integral para todos los convenios colectivos.
- Modulo completo de recursos humanos.
- Gestion de nomina o pagos bancarios.
- Integraciones con AFIP, SUSS o Ministerio de Trabajo.
- Portal completo de autoservicio del empleado en version inicial.
- Multiempresa o multisucursal en version inicial.

## 6. Usuarios Y Roles

### Administrador

Responsabilidades:

- Cargar y mantener empleados.
- Definir horarios, turnos y ciclos.
- Registrar o corregir fichadas manuales.
- Revisar inconsistencias.
- Aprobar o rechazar novedades.
- Ejecutar el cierre mensual.
- Exportar informacion para el contador.

Permisos esperados:

- Acceso completo a empleados, horarios, fichadas, novedades, cierre y exportaciones.
- Capacidad de ejecutar reprocesos de reglas.
- Capacidad de cambiar estados laborales.

### Empleado

Responsabilidades:

- Registrar entrada y salida.
- Consultar sus propias asistencias y novedades.
- Solicitar justificativos o licencias en una version extendida.

Permisos esperados:

- Acceso solo a informacion propia.
- Sin acceso a datos de otros empleados.
- Sin permiso para aprobar novedades ni cerrar periodos.

### Contador Externo

Responsabilidades:

- Recibir el resumen exportado.
- Validar que la informacion sea suficiente para liquidar.
- Definir junto con la empresa el formato de exportacion.

Permisos esperados:

- Acceso opcional de solo lectura.
- Sin operacion diaria del sistema.
- Sin permiso para modificar fichadas, novedades o empleados.

## 7. Modulo 1 - Gestion De Empleados

### Objetivo

Mantener datos laborales correctos y vigentes para que el sistema pueda interpretar horarios, fichadas y novedades.

### Formas De Carga

- Alta manual por formulario web.
- Importacion masiva desde Excel o CSV con formato predefinido.
- API REST para sincronizacion con sistemas externos de RRHH.

### Datos Minimos

Identificacion:

- Legajo.
- Nombre completo.
- DNI.
- CUIL.
- Fecha de ingreso.

Datos laborales:

- Categoria laboral.
- Convenio aplicable, si corresponde.
- Tipo de jornada: completa o parcial.
- Horario, turno o ciclo asignado.
- Dias de descanso.
- Modalidad de fichada habilitada.

Estado:

- Activo.
- Inactivo.
- Suspendido.

### Reglas

- La baja debe ser logica.
- No se deben borrar registros historicos.
- El legajo debe identificar al empleado en fichadas, novedades y cierres.
- Los cambios de horario o ciclo deben preservar historial de vigencia.

### Funcionalidades Requeridas

- Crear empleado.
- Editar empleado.
- Cambiar estado laboral.
- Consultar detalle de empleado.
- Ver historial reciente de fichadas.
- Ver historial reciente de novedades.
- Asignar horario.
- Asignar ciclo rotativo.
- Importar empleados.
- Validar campos obligatorios y formatos.

## 8. Modulo 2 - Gestion De Horarios Y Turnos

### Objetivo

Definir cuando se espera que trabaje cada empleado para comparar las fichadas reales contra la planificacion laboral.

### Tipos Soportados

- Turno fijo: mismo horario todos los dias configurados.
- Turno rotativo: alternancia entre turnos segun planificacion semanal, bisemanal u otra duracion.
- Horario flexible con banda horaria: cumplimiento de una cantidad de horas dentro de una ventana.
- Jornada reducida o parcial.

### Parametros Configurables

- Dias laborables.
- Hora esperada de entrada.
- Hora esperada de salida.
- Tolerancia de entrada.
- Tolerancia de salida.
- Tiempo minimo de descanso.
- Umbral minimo para computar horas extra.
- Dias de descanso semanal.
- Estado del horario o ciclo.

### Funcionalidades Requeridas

- Crear horario.
- Editar horario.
- Activar o inactivar horario.
- Crear ciclo rotativo.
- Editar ciclo rotativo.
- Asignar horario a empleado.
- Asignar ciclo a empleado.
- Definir vigencia desde y hasta.
- Evitar solapamientos invalidos entre horarios y ciclos.
- Consultar empleados sin asignacion.

## 9. Modulo 3 - Registro De Fichadas

### Objetivo

Registrar eventos crudos de entrada y salida de empleados, preservando su integridad y trazabilidad.

### Modalidades Soportadas

- Huella digital o dispositivo biometrico.
- Codigo QR o codigo de barras.
- Teclado o PIN.
- Carga manual por administrador.
- API externa para dispositivos o aplicaciones de terceros.

### Datos Minimos

- Empleado o legajo.
- Fecha y hora exacta.
- Tipo de evento: entrada o salida.
- Origen: biometrico, manual, API, QR o PIN.
- Usuario que registro la fichada si fue manual.
- Motivo si fue carga manual.
- Referencia a fichada original si es correccion.

### Reglas

- Una fichada representa un dato crudo.
- Una fichada no debe ser modificada destructivamente.
- Si existe un error, se debe agregar una correccion trazable.
- La interpretacion puede recalcularse sin alterar la fichada original.

### Funcionalidades Requeridas

- Registrar fichada.
- Cargar fichada manual.
- Registrar motivo de carga manual.
- Identificar origen.
- Listar fichadas.
- Filtrar por empleado, fecha, tipo, origen y estado.
- Registrar correcciones con trazabilidad.
- Detectar duplicados o fichadas sospechosas.

## 10. Modulo 4 - Motor De Reglas

### Objetivo

Interpretar fichadas contra horarios asignados y generar novedades automaticas parametrizables.

### Principios

- La regla no debe hardcodearse si corresponde a configuracion de empresa u horario.
- El motor debe poder reprocesar periodos cuando cambian horarios, reglas o fichadas historicas.
- La ejecucion debe dejar trazabilidad suficiente para auditar resultados.

### Eventos Detectables

Tardanza:

- Entrada posterior al horario esperado mas tolerancia.
- Debe registrar minutos de diferencia.

Ausencia:

- Dia laborable sin fichada de entrada.
- Puede derivar en ausencia justificada o injustificada segun novedades manuales asociadas.

Salida anticipada:

- Salida anterior al horario esperado menos tolerancia.
- Puede requerir justificacion.

Horas extra:

- Salida posterior al horario esperado mas umbral configurado.
- Deben clasificarse como 50% en dias habiles y 100% en domingos o feriados.

Doble fichada:

- Dos fichadas del mismo tipo en un periodo corto.
- Debe marcar el dia para revision manual.

Descanso no tomado o excedido:

- Si se registran cortes de descanso, el sistema debe comparar la pausa real contra el minimo o tiempo esperado.
- Debe generar aviso si no se cumple la regla.

### Funcionalidades Requeridas

- Ejecutar motor por empleado y fecha.
- Ejecutar motor por rango.
- Ejecutar motor por todos los empleados activos.
- Ejecutar en modo simulacion.
- Regenerar novedades automaticas previas.
- Mantener novedades manuales.
- Informar totales por regla.
- Informar errores, omitidos y casos correctos.
- Evitar duplicacion de novedades automaticas.

## 11. Modulo 5 - Gestion De Novedades

### Objetivo

Gestionar todos los eventos que afectan la preliquidacion del periodo.

### Novedades Automaticas

- Tardanza.
- Ausencia.
- Salida anticipada.
- Horas extra 50%.
- Horas extra 100%.
- Doble fichada.
- Descanso no tomado o excedido.

### Novedades Manuales

- Justificacion de ausencia.
- Licencia por enfermedad.
- Licencia por examen.
- Vacaciones parciales.
- Suspension disciplinaria.
- Permiso especial.
- Otras licencias definidas por la empresa.

### Datos Minimos

- Empleado.
- Tipo.
- Fecha desde.
- Fecha hasta, si aplica.
- Cantidad.
- Unidad: minutos, horas o dias.
- Estado: pendiente, aprobada o rechazada.
- Origen: automatica o manual.
- Observacion.
- Usuario de creacion.
- Referencia al contador o cierre si corresponde.

### Funcionalidades Requeridas

- Crear novedad manual.
- Listar novedades.
- Filtrar por tipo, estado, empleado, periodo y origen.
- Aprobar novedad.
- Rechazar novedad.
- Ver detalle.
- Identificar novedades automaticas.
- Mantener trazabilidad de cambios.
- Incluir solo novedades aprobadas en cierre.

## 12. Cierre Mensual

### Objetivo

Consolidar la informacion validada del periodo y preparar el paquete de preliquidacion para el contador.

### Flujo Requerido

1. Revisar fichadas del periodo.
2. Revisar novedades pendientes.
3. Aprobar o rechazar novedades.
4. Generar resumen por empleado.
5. Validar totales.
6. Ejecutar cierre.
7. Generar exportacion para contador.

### Resumen Por Empleado

Debe incluir:

- Dias trabajados.
- Ausencias justificadas.
- Ausencias injustificadas.
- Horas extra al 50%.
- Horas extra al 100%.
- Tardanzas acumuladas.
- Salidas anticipadas.
- Licencias.
- Suspensiones.
- Detalle de novedades aprobadas del periodo.

### Reglas

- El cierre debe quedar registrado.
- El cierre cerrado debe ser inmutable.
- Una modificacion retroactiva debe dejar trazabilidad.
- No se debe cerrar si existen novedades pendientes, salvo decision explicita y trazable.
- El cierre debe generar snapshot de las novedades aprobadas incluidas.

### Funcionalidades Requeridas

- Ver periodo actual.
- Ver periodos anteriores.
- Ver checklist de cierre.
- Ver resumen por empleado.
- Ver detalle individual.
- Reprocesar periodo antes del cierre.
- Crear cierre.
- Ejecutar cierre.
- Consultar historial de cierres.
- Exportar cierre.

## 13. Exportaciones Para Contador

### Objetivo

Entregar al contador un archivo claro, consistente y listo para importar o revisar.

### Formatos

- CSV.
- Excel.
- PDF, si se requiere presentacion formal.

### Exportaciones Minimas

- Resumen de cierre mensual.
- Novedades aprobadas del periodo.
- Horas extra discriminadas.
- Ausencias justificadas e injustificadas.
- Tardanzas.
- Fichadas del periodo, si se requiere auditoria.
- Empleados.
- Asignaciones de horarios.

### Reglas

- El formato debe ser estable.
- Las columnas deben ser consistentes entre periodos.
- Debe quedar referencia al archivo generado.
- La exportacion debe asociarse al cierre cuando corresponda.

## 14. Seguridad, Roles Y Trazabilidad

### Autenticacion

- Login de usuarios.
- Sesion segura.
- JWT o mecanismo equivalente.

### Autorizacion

- Rol administrador.
- Rol empleado.
- Rol contador.
- Restriccion de vistas y acciones por rol.

### Trazabilidad

Debe registrarse:

- Usuario que crea fichadas manuales.
- Usuario que corrige fichadas.
- Usuario que crea, aprueba o rechaza novedades.
- Usuario que ejecuta cierre.
- Fecha y hora de acciones relevantes.
- Motivo de acciones manuales o correcciones.

## 15. Modelo De Datos Requerido

### Empleado

- Legajo.
- Nombre.
- Apellido.
- DNI.
- CUIL.
- Fecha de ingreso.
- Categoria laboral.
- Convenio.
- Tipo de jornada.
- Estado.

Relaciones:

- Tiene fichadas.
- Tiene novedades.
- Tiene asignaciones de horario.
- Puede tener asignaciones de ciclo.

### Horario

- Nombre.
- Tipo.
- Dias de semana.
- Hora entrada esperada.
- Hora salida esperada.
- Tolerancia entrada.
- Tolerancia salida.
- Minutos minimos de descanso.
- Umbral de horas extra.
- Estado.

### Ciclo Rotativo

- Nombre.
- Duracion en dias.
- Secuencia de horarios por dia.
- Estado.

### Asignacion De Horario

- Empleado.
- Horario.
- Fecha desde.
- Fecha hasta.

### Asignacion De Ciclo

- Empleado.
- Ciclo.
- Fecha inicio.
- Fecha fin.

### Fichada

- Empleado.
- Fecha y hora.
- Tipo: entrada o salida.
- Origen.
- Usuario registrador.
- Motivo.
- Referencia a correccion.

### Novedad

- Empleado.
- Tipo.
- Fecha desde.
- Fecha hasta.
- Cantidad.
- Unidad.
- Estado.
- Origen.
- Observacion.
- Usuario de creacion.

### Cierre Mensual

- Periodo.
- Fecha de cierre.
- Usuario que cerro.
- Estado: borrador o cerrado.
- Archivo exportado.

### Detalle De Cierre

- Cierre.
- Novedad incluida.
- Empleado.
- Tipo de novedad.
- Fechas.
- Cantidad.
- Unidad.
- Snapshot de datos relevantes.

## 16. Pantallas Requeridas

### Login

- Ingreso al sistema.
- Manejo de errores.
- Redireccion segun rol, si aplica.

### Dashboard

- Indicadores operativos.
- Novedades pendientes.
- Fichadas recientes.
- Alertas de inconsistencias.
- Horas extra acumuladas.
- Ausencias.
- Dobles fichadas o casos a revisar.

### Empleados

- Listado.
- Busqueda y filtros.
- Alta manual.
- Importacion.
- Estado laboral.
- Acceso a detalle.

### Detalle De Empleado

- Datos identificatorios.
- Datos laborales.
- Estado.
- Horario o ciclo activo.
- Ultimas fichadas.
- Novedades recientes.
- Acciones manuales: asignar horario, asignar ciclo, cargar novedad y cargar fichada.

### Horarios Y Ciclos

- Listado de horarios.
- Listado de ciclos.
- Creacion y edicion.
- Asignaciones.
- Empleados sin asignacion.

### Fichadas

- Listado de fichadas.
- Filtros.
- Carga manual.
- Correcciones.
- Visualizacion de origen.

### Novedades

- Listado.
- Filtros.
- Alta manual.
- Aprobacion.
- Rechazo.
- Estados.
- Tipos automaticos y manuales.

### Cierre Mensual

- Periodo actual.
- Resumen del periodo.
- Checklist.
- Desglose por empleado.
- Detalle individual.
- Reprocesar periodo.
- Ejecutar cierre.
- Historial.

### Exportaciones

- Seleccion de reporte.
- Seleccion de periodo.
- Generacion de archivo.
- Descarga.
- Historial de exportaciones.

## 17. APIs Requeridas

### Empleados

- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PATCH /api/employees/:id`
- `POST /api/employees/import`
- `POST /api/employees/:id/assignments`
- `POST /api/employees/:id/news`
- `POST /api/employees/:id/manual-punches`

### Horarios Y Ciclos

- `GET /api/catalogs`
- `GET /api/schedules/overview`
- `POST /api/schedules`
- `PATCH /api/schedules/:id`
- `POST /api/schedules/cycles`
- `PATCH /api/schedules/cycles/:id`
- `POST /api/schedules/assignments`
- `PATCH /api/schedules/assignments/:id`

### Fichadas

- `GET /api/punches`
- `POST /api/punches`
- `POST /api/punches/:id/corrections`

### Novedades

- `GET /api/news`
- `POST /api/news`
- `PATCH /api/news/:id/approve`
- `PATCH /api/news/:id/reject`

### Motor De Reglas

- `POST /api/reasoning/reprocess-range`
- Endpoint o servicio equivalente para evaluar un empleado y fecha.

### Cierre

- `GET /api/closures/current`
- `POST /api/closures`
- `POST /api/closures/:id/run`
- `GET /api/closures/:id`
- `DELETE /api/closures/:id`, solo si se conserva para administracion tecnica y no contradice inmutabilidad funcional.

### Exportaciones

- `GET /api/exports/options`
- `POST /api/exports`
- `GET /api/exports/:id/download`

## 18. Reglas De Calidad Funcional

- Ninguna pantalla en modo API debe mostrar datos mock como si fueran reales.
- Toda carga debe mostrar loader o estado vacio.
- Toda mutacion debe refrescar datos desde backend al finalizar.
- Los errores deben mostrarse en pantalla de forma entendible.
- Las acciones destructivas deben requerir confirmacion.
- Los formularios deben validar campos obligatorios.
- Los formularios deben evitar pedir IDs internos cuando pueda mostrarse un catalogo por nombre.
- Las tablas deben tener estados vacios y filtros claros.
- Los datos historicos no deben perderse.

## 19. Criterios De Aceptacion Global

El trabajo puede considerarse completo cuando:

- Se puede crear o importar empleados.
- Se pueden crear horarios y ciclos.
- Se pueden asignar horarios y ciclos a empleados con vigencia.
- Se pueden registrar fichadas por API o manualmente.
- Se pueden corregir fichadas sin modificar destructivamente el dato original.
- El motor genera las novedades automaticas requeridas.
- El administrador puede crear novedades manuales.
- El administrador puede aprobar y rechazar novedades.
- El cierre mensual consolida un periodo.
- El cierre genera snapshot inmutable.
- El contador puede recibir una exportacion consistente.
- Los roles principales estan definidos y, si aplica, restringidos.
- La prueba manual completa puede ejecutarse de punta a punta.

## 20. Checklist De Alcance Completo

### Empleados

- [ ] Alta manual.
- [ ] Edicion.
- [ ] Baja logica o cambio a inactivo.
- [ ] Estado suspendido.
- [ ] Importacion masiva.
- [ ] API de sincronizacion.
- [ ] Detalle de empleado.
- [ ] Historial asociado.

### Horarios Y Ciclos

- [ ] Turno fijo.
- [ ] Turno rotativo.
- [ ] Horario flexible.
- [ ] Jornada parcial.
- [ ] Tolerancia de entrada.
- [ ] Tolerancia de salida.
- [ ] Descanso minimo.
- [ ] Umbral de horas extra.
- [ ] Dias de descanso.
- [ ] Vigencia de asignaciones.
- [ ] Prevencion de solapamientos.

### Fichadas

- [ ] Fichada biometrica o importada.
- [ ] Fichada QR.
- [ ] Fichada PIN.
- [ ] Fichada manual.
- [ ] Fichada via API.
- [ ] Motivo en carga manual.
- [ ] Correccion trazable.
- [ ] Inmutabilidad del dato original.

### Motor De Reglas

- [ ] Tardanza.
- [ ] Ausencia.
- [ ] Salida anticipada.
- [ ] Horas extra 50%.
- [ ] Horas extra 100%.
- [ ] Doble fichada.
- [ ] Descanso no tomado o excedido.
- [ ] Reproceso por rango.
- [ ] Simulacion sin impacto.
- [ ] Parametrizacion por horario o empresa.

### Novedades

- [ ] Novedades automaticas.
- [ ] Novedades manuales.
- [ ] Aprobacion.
- [ ] Rechazo.
- [ ] Filtros.
- [ ] Estados.
- [ ] Observaciones.
- [ ] Trazabilidad.

### Cierre

- [ ] Checklist de cierre.
- [ ] Resumen por empleado.
- [ ] Validacion de pendientes.
- [ ] Snapshot de novedades aprobadas.
- [ ] Inmutabilidad.
- [ ] Historial.
- [ ] Reapertura o ajuste con trazabilidad, si se decide permitirlo.

### Exportaciones

- [ ] CSV.
- [ ] Excel.
- [ ] PDF.
- [ ] Resumen para contador.
- [ ] Novedades aprobadas.
- [ ] Horas extra discriminadas.
- [ ] Ausencias.
- [ ] Tardanzas.
- [ ] Historial de archivos.

### Seguridad

- [ ] Login.
- [ ] Sesion segura.
- [ ] Rol administrador.
- [ ] Rol empleado.
- [ ] Rol contador.
- [ ] Permisos por rol.
- [ ] Auditoria de acciones.

## 21. Supuestos Para La Implementacion Actual

Aunque el PDF propone React con TypeScript y backend .NET, el repositorio actual trabaja con React, JavaScript, Tailwind, Vite, Node/Express y Supabase. Para este trabajo se considera valido mantener el stack existente si cumple el comportamiento funcional solicitado.

Las diferencias de stack deben documentarse como decision tecnica, no como reduccion de alcance funcional.


# html-parity-auditor

## Proposito

Esta skill local valida que una pantalla React migrada cumpla 1 a 1 con su HTML original en `docs/`, y que la documentacion asociada siga siendo correcta para frontend y backend.

Debe usarse despues de cualquier migracion de pantalla, refactor visual, cambio de layout compartido o cambio en contratos de datos.

## Objetivos de la revision

1. Verificar paridad visual y estructural entre `docs/*.html` y `src/pages/**`.
2. Verificar paridad funcional de interacciones ya migradas.
3. Verificar que rutas, CTAs, tablas, modales, badges y estados sigan alineados.
4. Verificar que la documentacion del proyecto siga describiendo correctamente el estado real.
5. Verificar que el PRD de integracion backend siga siendo suficiente para no tocar frontend al conectar API real.

## Entradas esperadas

- pagina o modulo a revisar
- html de referencia en `docs/`
- pagina React correspondiente en `src/pages/`
- documentacion aplicable:
  - `README.md`
  - `PRD.md`
  - `AGENTS.md`
  - `TODO/frontend-migracion-prd.md`
  - `TODO/migration-guide.md`
  - `TODO/api-integration-prd.md`

## Salida esperada

La revision debe devolver siempre:

1. hallazgos de paridad HTML -> React
2. hallazgos de logica o comportamiento
3. hallazgos de documentacion desactualizada
4. hallazgos de contrato backend faltante o inconsistente
5. lista concreta de archivos que requieren actualizacion

Si no hay diferencias relevantes, debe decirlo explicitamente.

## Criterios de validacion 1 a 1

### 1. Estructura visual

Validar:

- misma jerarquia general de bloques
- misma disposicion sidebar/topbar/main
- mismos headers de pagina
- mismas cards, tablas y paneles laterales
- mismos titulos y subtitulos visibles
- mismas acciones principales

### 2. Detalle visual

Validar:

- mismos textos visibles
- mismas tipografias aparentes
- mismos colores semanticos
- mismos badges y etiquetas de estado
- mismas separaciones generales
- mismo orden de informacion
- mismos iconos o equivalentes exactos

### 3. Navegacion

Validar:

- mismos links principales
- mismo destino funcional de CTAs
- mismo item activo en sidebar
- breadcrumbs y accesos secundarios equivalentes

### 4. Tablas y listados

Validar:

- mismas columnas
- mismo orden de columnas
- mismos valores mock equivalentes
- mismos estados vacios si aplican
- misma paginacion visible si ya fue migrada

### 5. Formularios y modales

Validar:

- mismos campos
- mismos labels
- mismos placeholders
- mismas opciones de selects
- mismas acciones de guardar/cancelar
- mismos estados condicionales

### 6. Comportamiento

Validar:

- filtros
- busqueda
- paginacion
- toggles condicionales
- apertura y cierre de modales
- altas mock
- aprobacion/rechazo mock
- cambios de estado visibles

## Reglas de revision de documentacion

Despues de revisar la pantalla, comprobar si la documentacion sigue siendo cierta.

### Archivos a revisar siempre

- `README.md`
- `PRD.md`
- `AGENTS.md`
- `TODO/frontend-migracion-prd.md`
- `TODO/migration-guide.md`
- `TODO/api-integration-prd.md`

### Que validar en la documentacion

1. que el estado de migracion declarado coincida con el real
2. que las pantallas ya migradas esten marcadas como tales
3. que los compartidos creados esten reflejados
4. que la estrategia de estructura de carpetas siga siendo correcta
5. que el contrato backend cubra todos los datos visibles y acciones de la pantalla

## Reglas de validacion backend

Si durante la revision aparece algun dato, accion o estado que no puede resolverse con el PRD actual de backend, documentar inmediatamente:

1. endpoint faltante
2. campo faltante
3. query param faltante
4. respuesta incompleta
5. accion de mutacion faltante

## Checklist backend por pantalla

Para cada pantalla revisada, validar:

- datos de cards
- datos de tablas
- datos de detalle lateral
- datos de modales
- datos de selects/catalogos
- acciones `create/update/approve/reject/export/reprocess`
- identificadores estables para navegacion

## Procedimiento sugerido

1. abrir HTML de referencia en `docs/`
2. abrir pagina React equivalente
3. comparar seccion por seccion en orden visual
4. anotar diferencias de estructura
5. anotar diferencias de contenido
6. anotar diferencias de comportamiento
7. revisar documentacion asociada
8. revisar PRD backend
9. actualizar documentacion si hace falta
10. dejar resumen final con hallazgos o conformidad

## Politica de severidad

### Alta

- falta una seccion visible completa
- una accion principal desaparecio
- una tabla tiene columnas distintas
- backend PRD no permite renderizar la pantalla sin cambios frontend

### Media

- orden de informacion distinto
- estilos de estado inconsistentes
- modal incompleto
- documentacion desactualizada en flujo importante

### Baja

- textos menores distintos
- spacing menor
- naming interno distinto sin impacto visible

## Definition of done de la auditoria

La auditoria se considera completa cuando:

- se comparo HTML vs React
- se reviso navegacion
- se revisaron interacciones migradas
- se reviso documentacion aplicable
- se reviso suficiencia del contrato backend
- se actualizaron los documentos necesarios o se dejo explicitado que no hacia falta

## Plantilla de salida recomendada

```text
Pantalla auditada:
Referencia HTML:
Pagina React:

Hallazgos visuales:
- ...

Hallazgos funcionales:
- ...

Hallazgos de documentacion:
- ...

Hallazgos de contrato backend:
- ...

Archivos a actualizar:
- ...

Resultado final:
- Conforme / Requiere ajustes
```

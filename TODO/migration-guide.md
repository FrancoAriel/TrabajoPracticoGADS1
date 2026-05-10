# Guia de migracion de pantallas a React

## Objetivo

Esta guia define como migrar cada pantalla restante desde `docs/*.html` a JSX nativo manteniendo la apariencia actual y evitando refactors grandes antes de tiempo.

## Regla base

Cada pantalla debe pasar por estas etapas antes de darse por migrada:

1. copiar la estructura visual principal a JSX
2. mover datos mock a constantes locales de pagina
3. reemplazar links HTML por `Link` o `NavLink`
4. migrar formularios y modales a estado React
5. migrar filtros, tablas y paginacion a estado local
6. validar que siga viendose igual a `docs/`

## Estructura recomendada por pagina

```text
src/pages/<pagina>/
  <Pagina>Page.jsx
```

Si una pagina empieza a crecer demasiado, recien ahi separar:

```text
src/pages/<pagina>/
  <Pagina>Page.jsx
  <pagina>.constants.js
  <pagina>.helpers.js
```

## Compartidos permitidos en esta etapa

Solo crear compartidos cuando realmente se repiten.

- `AppShell`
- `Sidebar`
- `Topbar`
- `PageHeader`
- `SectionCard`
- `StatCard`
- `Badge`
- `Modal`

## Criterios de paridad visual

1. misma jerarquia de bloques
2. mismos textos visibles
3. mismas acciones principales
4. mismos colores y tipografias
5. mismas separaciones generales
6. mismos estados visibles de badges, tablas y botones

## Migracion de tablas

Para todas las pantallas con listado:

1. crear array mock local
2. derivar `filteredItems`
3. derivar `paginatedItems`
4. mostrar estado vacio si no hay resultados
5. mantener encabezados y acciones como en HTML original

## Migracion de modales

Para todos los modales:

1. controlar apertura con `useState`
2. cerrar con overlay, boton cancelar o accion exitosa
3. resetear formulario al cerrar si corresponde
4. mantener textos y jerarquia visual de la referencia

## Migracion de formularios

1. usar estado local simple
2. validar solo lo que ya validaba el HTML original
3. no introducir reglas nuevas en esta etapa
4. usar feedback visual directo en la misma pantalla

## Orden sugerido de trabajo

1. layout compartido
2. login
3. dashboard
4. empleados
5. detalle empleado
6. novedades
7. fichadas
8. horarios
9. cierre
10. exportaciones

## Definition of done por pantalla

Una pantalla queda migrada cuando:

- no usa `ReferencePage`
- no usa `dangerouslySetInnerHTML`
- su JSX es propio
- sus acciones principales funcionan con estado React
- la navegacion esta conectada a rutas internas
- conserva la apariencia de `docs/`

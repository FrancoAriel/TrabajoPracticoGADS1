# Instrucciones para agentes

Este repositorio contiene la migracion de Labor Pulse / Executive Architect desde HTML estatico a React.

Antes de modificar codigo, leer `PRD.md`.

## Stack permitido

Trabajar con:

- React
- JavaScript
- Tailwind CSS
- Vite

No introducir dependencias adicionales salvo que resuelvan una necesidad concreta de esta migracion.

## Regla central de esta etapa

`docs/` se conserva como referencia visual de las pantallas originales.

La app productiva se construye en `src/` replicando esas pantallas en React, una por una, sin refactorizacion grande todavia.

## Estructura esperada

```text
docs/
  *.html

src/
  lib/
  pages/
  App.jsx
  main.jsx
  index.css
```

## Reglas de trabajo

1. Mantener la implementacion simple.
2. Crear una pagina React por cada pantalla existente.
3. No extraer componentes de negocio o layout salvo soporte tecnico minimo.
4. Mantener la navegacion funcional entre secciones.
5. Mantener la apariencia visual alineada con `docs/`.
6. No rehacer el diseno ni reinterpretar la UI en esta iteracion.
7. No borrar las referencias HTML de `docs/`.

## Verificacion minima

Al terminar una tarea, revisar:

- que la app compile
- que las rutas principales funcionen
- que los cambios no rompan la referencia en `docs/`
- que no haya diferencias visuales fuertes respecto a las pantallas originales

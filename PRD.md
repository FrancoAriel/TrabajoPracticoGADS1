# PRD - Labor Pulse / Executive Architect

## 1. Proposito

Labor Pulse / Executive Architect es un sistema web de gestion laboral para administrar empleados, horarios, fichadas, novedades, cierre mensual y exportaciones.

La etapa actual del proyecto consiste en migrar el frontend existente hacia React, manteniendo el look and feel actual y sin introducir complejidad innecesaria.

## 2. Alcance actual

El prototipo visual existente vive en `docs/` y se conserva como referencia de migracion.

Pantallas existentes:

- Dashboard
- Login
- Empleados
- Detalle de empleado
- Fichadas
- Horarios y ciclos rotativos
- Novedades
- Cierre mensual
- Exportaciones

En esta iteracion cada una de esas pantallas debe existir tambien en React con equivalencia visual y navegacion funcional.

## 3. Stack tecnologico objetivo

El stack aprobado para esta etapa es:

- React
- JavaScript
- Tailwind CSS
- Vite

Permitido:

- React Router para navegacion interna
- CSS global minimo cuando sirva para complementar Tailwind
- Utilidades pequenas de soporte tecnico para facilitar la migracion

Evitar por defecto:

- TypeScript
- Librerias de estado global
- Librerias de componentes UI
- Backend real
- Refactors grandes de arquitectura

## 4. Objetivo de la migracion

1. Mantener `docs/` como referencia viva del HTML actual.
2. Crear una aplicacion React simple, sin sobreingenieria.
3. Replicar las pantallas 1 a 1 antes de extraer componentes compartidos.
4. Mantener navegacion funcional entre las secciones migradas.
5. Evitar diferencias visuales respecto a las pantallas HTML de referencia.

## 5. Estructura objetivo de carpetas

La estructura debe mantenerse simple porque el proyecto no crecera demasiado en esta etapa.

```text
docs/
  *.html

src/
  main.jsx
  App.jsx
  index.css
  components/
    layout/
    ui/
  data/
  lib/
    routes.js
    apiClient.js
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

## 6. Reglas de arquitectura

1. Cada pantalla debe tener su propio archivo de pagina en `src/pages/`.
2. No separar componentes visuales de negocio en esta iteracion salvo necesidad tecnica puntual.
3. Mantener la logica de pagina lo mas cerca posible de la propia pagina.
4. Conservar `docs/` sin convertirlo en fuente editable principal.
5. La navegacion entre pantallas debe seguir funcionando despues de la migracion.
6. Priorizar cambios pequenos y verificables.
7. No introducir capas extra de abstraccion si no resuelven un problema actual.

## 7. Directrices de UI

La UI debe conservar exactamente el lenguaje visual actual:

- misma jerarquia visual
- mismos textos
- mismos colores
- mismas tipografias
- mismas distribuciones generales
- misma sensacion administrativa y operativa

Si hay decisiones entre mejorar y conservar, en esta etapa prevalece conservar.

## 8. Datos y comportamiento

Mientras no exista backend:

- se permiten datos mock
- se permite comportamiento de interfaz local
- no hace falta persistencia real

La prioridad es reproducir la experiencia actual, no redisenarla.

## 9. Criterios de calidad

Antes de considerar completa una tarea:

- la app debe compilar
- la navegacion entre pantallas debe funcionar
- `docs/` debe seguir disponible como referencia
- no deben aparecer diferencias visuales importantes respecto al HTML original
- no deben agregarse dependencias innecesarias

## 10. Estrategia de trabajo

La migracion se realiza pantalla por pantalla:

1. conservar HTML de referencia en `docs/`
2. crear pagina equivalente en React
3. conectar navegacion interna
4. verificar apariencia y rutas
5. dejar la componentizacion para una iteracion posterior

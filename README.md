# TrabajoPracticoGADS1

Sistema de gestion laboral `Executive Architect / Labor Pulse`.

## Direccion actual

El proyecto inicia una migracion controlada desde HTML estatico hacia una aplicacion en React.

- `docs/` queda como referencia visual y funcional de las pantallas originales.
- La app activa se desarrolla en React + Tailwind CSS + JavaScript.
- En esta iteracion se replica cada pantalla 1 a 1, sin separar componentes de negocio todavia.

## Stack aprobado

- React
- JavaScript
- Tailwind CSS
- Vite

## Estructura simple del proyecto

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

index.html
package.json
tailwind.config.js
postcss.config.js
vite.config.js
```

## Criterio de migracion

1. Mantener las pantallas HTML existentes dentro de `docs/` como fuente de referencia.
2. Replicar cada pantalla en React respetando estructura visual, textos, estilos y links.
3. Mantener la navegacion funcional entre secciones dentro de la app React.
4. Evitar en esta etapa la extraccion de componentes compartidos salvo soporte tecnico minimo.
5. Dejar la refactorizacion de componentes, estado y datos para la siguiente iteracion.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Levantar entorno local:

```bash
npm run dev
```

Generar build:

```bash
npm run build
```

Vista previa de produccion:

```bash
npm run preview
```

## Documentacion de flujos

- `docs/flujos-admin-contador.md`: flujos requeridos para administrador y contador segun la especificacion del trabajo practico.

## Rutas React previstas

- `/` Dashboard
- `/login`
- `/empleados`
- `/empleados/juan-perez`
- `/fichadas`
- `/horarios`
- `/novedades`
- `/cierre`
- `/exportaciones`

Se usa `HashRouter` para mantener navegacion estatica simple y compatible con despliegues sin configuracion adicional.

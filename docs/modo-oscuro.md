# Modo claro / oscuro (dark mode)

## Objetivo

Permitir que la aplicación se vea en tema claro u oscuro, con un botón para
alternar, sin reescribir los estilos de cada pantalla. El cambio de tema se
resuelve en un solo lugar (variables CSS), así que agregar dark mode no obligó
a tocar el color de los 15 componentes uno por uno.

## Cómo lo usa una persona

1. En la barra superior (arriba a la derecha) aparece un botón con ícono de
   sol/luna.
2. Al tocarlo, la app cambia entre claro y oscuro al instante.
3. La elección queda guardada: la próxima vez que entre, abre en el tema que
   eligió.
4. Si nunca eligió, la app respeta la preferencia del sistema operativo.
5. No hay parpadeo al cargar: el tema se aplica antes de que la pantalla se
   dibuje.

## Cómo funciona por dentro

1. El tema es simplemente una clase `dark` en la etiqueta `<html>`.
2. Todos los colores están definidos como variables CSS en
   [`src/index.css`](../src/index.css):
   - el esquema **claro** vive en `:root` (los valores originales del diseño);
   - el esquema **oscuro** vive en `html.dark` (paleta oscura + escala de grises
     invertida).
3. [`tailwind.config.js`](../tailwind.config.js) apunta cada color de Tailwind a
   esas variables. Por eso, al poner o sacar la clase `dark`, casi todos los
   colores cambian solos sin tocar los componentes.
4. La lógica de prender/apagar el tema está en
   [`src/lib/theme.js`](../src/lib/theme.js) y el botón en
   [`src/components/ui/ThemeToggle.jsx`](../src/components/ui/ThemeToggle.jsx).
5. El antiparpadeo es un script chico en [`index.html`](../index.html) que corre
   antes que React.

## Decisiones de diseño

1. Se invierten los **neutros** (fondos, textos, bordes) y los **tonos de
   marca** (azul primario, etc.). Eso da el 90% del modo oscuro de forma
   centralizada.
2. Los **chips de estado** chicos (verde "Aprobado", rojo "Rechazado", avatares)
   se dejan como pastillas claras legibles también sobre fondo oscuro. Es un
   patrón aceptado y evita ensuciar todo el código.
3. Las superficies que deben ser **oscuras siempre** (toasts, fondo de los
   modales, botones de acción fuertes) se fijaron para no invertirse por error.
4. Las pocas combinaciones que quedaban con poco contraste en oscuro se
   corrigieron de forma puntual con variantes `dark:` (ver más abajo).

## Cómo agregar/ajustar colores en el futuro

1. Si se usa un token existente (`bg-surface`, `text-on-surface`, `bg-primary`,
   `text-slate-600`, etc.), **no hay que hacer nada**: ya funciona en ambos
   temas.
2. Para cambiar un color del tema oscuro, se edita su variable en el bloque
   `html.dark` de [`src/index.css`](../src/index.css).
3. Evitar usar un color de paleta fija (ej. `bg-slate-900`, `text-blue-900`)
   como fondo o texto de una superficie grande: en oscuro puede invertirse o
   perder contraste. Preferir los tokens (`surface-*`, `on-*`, `primary`).
4. Si una superficie debe ser oscura en ambos modos, usar `bg-black`/`bg-neutral-*`
   (no se invierten) o un token como `surface-container-highest`.

## Archivos involucrados

Núcleo del tema:

- [`tailwind.config.js`](../tailwind.config.js) — colores apuntando a variables CSS + `darkMode: 'class'`.
- [`src/index.css`](../src/index.css) — variables de color para claro (`:root`) y oscuro (`html.dark`).
- [`index.html`](../index.html) — script antiparpadeo.
- [`src/lib/theme.js`](../src/lib/theme.js) — leer/escribir/alternar el tema.
- [`src/components/ui/ThemeToggle.jsx`](../src/components/ui/ThemeToggle.jsx) — el botón sol/luna.

Ajustes puntuales de contraste (variantes `dark:` agregadas):

- `src/components/layout/Topbar.jsx` — montaje del botón, dropdown y hover.
- `src/components/layout/Sidebar.jsx` — ítem de menú activo.
- `src/components/ui/Modal.jsx` — fondo del modal y scrim.
- `src/components/ui/StatCard.jsx` — ícono decorativo.
- Pantallas: Dashboard, Cierre, Novedades, Empleados, Empleado detalle,
  Fichadas, Horarios, Exportaciones — botones de acción, toasts, avatares y la
  fila "Completado" del checklist de cierre.

## Verificación

1. `npm run build` compila sin errores.
2. Se revisó pantalla por pantalla buscando combinaciones de bajo contraste en
   oscuro (texto que se aclara sobre fondo que también se aclara) y se
   corrigieron todas las encontradas.
3. Para probar a mano: `npm run dev`, iniciar sesión y usar el botón de tema en
   cada pantalla.

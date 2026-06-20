/** @type {import('tailwindcss').Config} */

// Cada token apunta a una variable CSS definida en src/index.css.
// Las variables se declaran como tripletes "R G B" para que los
// modificadores de opacidad de Tailwind (ej: bg-primary/15) sigan
// funcionando via <alpha-value>. El esquema claro vive en :root y el
// oscuro en .dark, asi el cambio de tema no toca ningun componente.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

const semanticTokens = [
  'on-surface-variant',
  'inverse-on-surface',
  'on-tertiary-fixed-variant',
  'tertiary-container',
  'on-tertiary',
  'on-secondary-fixed-variant',
  'outline',
  'secondary',
  'on-secondary-fixed',
  'secondary-dim',
  'error-container',
  'primary',
  'primary-fixed',
  'on-secondary',
  'background',
  'on-primary-fixed',
  'surface-container-lowest',
  'secondary-fixed',
  'surface-container-high',
  'on-background',
  'on-error-container',
  'inverse-surface',
  'surface-container-highest',
  'secondary-container',
  'surface-container-low',
  'on-primary-fixed-variant',
  'tertiary-fixed',
  'on-secondary-container',
  'on-primary',
  'tertiary',
  'tertiary-dim',
  'surface-dim',
  'outline-variant',
  'on-error',
  'error-dim',
  'surface-variant',
  'secondary-fixed-dim',
  'surface-container',
  'surface-bright',
  'error',
  'primary-dim',
  'surface-tint',
  'surface',
  'on-primary-container',
  'primary-container',
  'primary-fixed-dim',
  'on-tertiary-fixed',
  'tertiary-fixed-dim',
  'inverse-primary',
  'on-surface',
  'on-tertiary-container',
]

const slateShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const colors = {}
for (const name of semanticTokens) colors[name] = token(name)
colors.slate = {}
for (const shade of slateShades) colors.slate[shade] = token(`slate-${shade}`)

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}', './docs/**/*.html'],
  theme: {
    extend: {
      colors,
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

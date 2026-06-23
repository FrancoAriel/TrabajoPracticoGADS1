// Manejo del tema claro/oscuro.
// El tema se materializa como la clase .dark en <html>. La eleccion del
// usuario se persiste en localStorage; si no hay eleccion previa se respeta
// la preferencia del sistema. El parpadeo inicial lo evita el script inline
// de index.html, que corre antes de que React monte.

const STORAGE_KEY = 'theme'

export function getActiveTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function setTheme(theme) {
  applyTheme(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage no disponible: el tema vale solo para esta sesion */
  }
}

export function toggleTheme() {
  const next = getActiveTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

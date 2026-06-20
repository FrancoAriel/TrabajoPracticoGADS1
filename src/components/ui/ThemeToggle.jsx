import { useState } from 'react'
import { getActiveTheme, toggleTheme } from '../../lib/theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getActiveTheme())
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface active:scale-95"
    >
      <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}

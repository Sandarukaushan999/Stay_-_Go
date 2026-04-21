import { useState, useEffect } from 'react'

const STORAGE_KEY = 'sg-admin-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    // Set data-theme for CSS variables
    root.setAttribute('data-theme', theme)
    // Set/remove 'dark' class for Tailwind dark: variants
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = (next) => setTheme(next)

  return { theme, toggleTheme }
}

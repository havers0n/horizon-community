import { useTheme as useNextTheme } from 'next-themes'

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return {
    theme: theme || 'light',
    setTheme,
    toggleTheme,
    systemTheme
  }
} 
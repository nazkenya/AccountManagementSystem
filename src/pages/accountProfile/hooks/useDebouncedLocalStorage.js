import React from 'react'

// Generic debounced localStorage persistence hook
// Returns [state, setState, lastSaved]
export function useDebouncedLocalStorage(key, initialValue, delay = 400) {
  const isArray = Array.isArray(initialValue)
  const [state, setState] = React.useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initialValue
      const parsed = JSON.parse(raw)
      // If expecting array:
      if (isArray) {
        if (Array.isArray(parsed)) return parsed
        // Attempt to salvage: if object with numeric keys -> convert to array
        if (parsed && typeof parsed === 'object') {
          const numericKeys = Object.keys(parsed).filter(k => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b))
          if (numericKeys.length) {
            return numericKeys.map(k => parsed[k])
          }
        }
        return initialValue
      }
      // For objects: shallow merge to preserve new keys
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...initialValue, ...parsed }
      }
      return initialValue
    } catch {
      return initialValue
    }
  })
  const [lastSaved, setLastSaved] = React.useState(null)

  React.useEffect(() => {
    const handle = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state))
        const now = new Date()
        setLastSaved(now)
      } catch {
        // ignore quota or serialization errors
      }
    }, delay)
    return () => clearTimeout(handle)
  }, [state, key, delay])

  return [state, setState, lastSaved]
}

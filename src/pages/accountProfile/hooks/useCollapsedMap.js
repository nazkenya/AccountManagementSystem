import React from 'react'

export function useCollapsedMap(storageKey) {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem(`${storageKey}:collapsed`)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  React.useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}:collapsed`, JSON.stringify(collapsed))
    } catch {
      // ignore persistence errors
    }
  }, [collapsed, storageKey])

  const expandAll = React.useCallback((ids) => {
    setCollapsed(Object.fromEntries(ids.map(id => [id, false])))
  }, [])

  const collapseAll = React.useCallback((ids) => {
    setCollapsed(Object.fromEntries(ids.map(id => [id, true])))
  }, [])

  return { collapsed, setCollapsed, expandAll, collapseAll }
}

import React from 'react'
import { createPortal } from 'react-dom'

export default function SidebarPortal({ children }) {
  const [mountNode, setMountNode] = React.useState(null)
  React.useEffect(() => setMountNode(document.body), [])
  if (!mountNode) return null
  return createPortal(children, mountNode)
}

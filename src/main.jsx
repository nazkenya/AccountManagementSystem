import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'
import { setAuthToken } from "./api"  

const saved = localStorage.getItem('auth.user')
if (saved) {
  let data = null
  try {
    data = JSON.parse(saved)
  } catch (e) {
    console.warn('[main] gagal parse saved auth.user:', e)
  }
  if (data && data.token) {
    setAuthToken(data.token)
  } else {
    console.debug('[main] no valid auth.user token found in localStorage')
  }
}

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

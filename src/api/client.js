// src/client.js
const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'
let authToken = null

export function setAuthToken(token) {
  authToken = token
}

export async function api(path, options = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' }

  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`
  }

  const finalOptions = {
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: options.credentials ?? 'include', 
    method: options.method || 'GET',
    ...options,
  }

  if (finalOptions.body != null && typeof finalOptions.body !== 'string') {
    if (!(finalOptions.body instanceof FormData)) {
      finalOptions.body = JSON.stringify(finalOptions.body)
    }
  }

  const res = await fetch(`${base}${path}`, finalOptions)

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const errorBody = await res.json().catch(() => ({}))
      if (errorBody.message) errorMessage = errorBody.message
      else if (errorBody.errors)
        errorMessage = Object.values(errorBody.errors).flat()[0] || errorMessage
    } else {
      errorMessage = await res.text().catch(() => `HTTP ${res.status}`)
    }

    const err = new Error(errorMessage)
    err.status = res.status
    throw err                                                           
  }

  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export default api

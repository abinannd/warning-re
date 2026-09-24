import { useEffect, useState } from 'react'
import { apiClient } from './api/client'
import type { HealthResponse } from './types/api'
import './index.css'

function App() {
  const [status, setStatus] = useState<string>('Checking...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    apiClient.get<HealthResponse>('/health')
      .then(res => setStatus(res.data.status))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Frontend initialized</h1>
      <p>Backend API: /api</p>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Health Check</h3>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <p>Status: <strong>{status}</strong></p>
        )}
      </div>
    </div>
  )
}

export default App

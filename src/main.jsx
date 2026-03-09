/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import AuthPage from './AuthPage.jsx'
import F1Dashboard from './F1Dashboard.jsx'

function Root() {
  const [user,     setUser]     = useState(null)
  const [checking, setChecking] = useState(true)
  const [toast,    setToast]    = useState(null) // { message, type }

  /* Restore session on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('f1_session')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
    setChecking(false)
  }, [])

  /* Show a toast for 3 seconds */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleLogin = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('f1_session', JSON.stringify(userData))
    const name = userData.isGuest ? 'Guest' : userData.name
    showToast(
      userData.isGuest
        ? '👤 Continuing as Guest'
        : `🏁 Welcome back, ${name}!`,
      'success'
    )
  }, [showToast])

  const handleLogout = useCallback(() => {
    const name = user?.name || 'Driver'
    setUser(null)
    localStorage.removeItem('f1_session')
    showToast(`👋 See you next race, ${name}`, 'info')
  }, [user, showToast])

  if (checking) return null

  return (
    <>
      {/* ─── Toast notification ─── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.type === 'success' ? 'rgba(52,211,153,.12)' : 'rgba(0,212,255,.1)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,.4)' : 'rgba(0,212,255,.35)'}`,
          borderRadius: 13, padding: '14px 20px',
          boxShadow: '0 16px 48px rgba(0,0,0,.55)',
          animation: 'toastIn .35s cubic-bezier(.34,1.56,.64,1)',
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: 320,
        }}>
          <span style={{ fontSize: 14, color: '#f0f0f6', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            {toast.message}
          </span>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(.93) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>

      {user
        ? <F1Dashboard user={user} onLogout={handleLogout} />
        : <AuthPage onLogin={handleLogin} />
      }
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)

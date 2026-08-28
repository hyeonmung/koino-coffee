import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { initStore } from './data/store.ts'

function AppRoot() {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    initStore()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('[KOINONIA] Failed to load site data:', err)
        setFailed(true)
      })
  }, [])

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 text-center">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-accent">KOINONIA</p>
        <h1 className="mt-3 text-[20px] font-bold text-navy">사이트를 불러오지 못했습니다.</h1>
        <p className="mt-2 max-w-[360px] text-[13px] text-navy/55">
          잠시 후 새로고침해주세요. 문제가 계속되면 인터넷 연결을 확인해주세요.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
        >
          새로고침
        </button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-white">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-accent">KOINONIA</p>
      </div>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <AppRoot />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)

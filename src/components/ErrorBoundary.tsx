import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Catches render-time errors anywhere in the tree so a bug shows a branded screen, not a blank page. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[KOINO COFFEE] Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 text-center">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-accent">KOINO COFFEE</p>
        <h1 className="mt-3 font-serif text-[24px] font-bold text-navy">일시적인 오류가 발생했습니다.</h1>
        <p className="mt-2 max-w-[360px] text-[13px] text-navy/55">
          페이지를 불러오는 중 문제가 생겼습니다. 새로고침하거나 홈으로 돌아가 다시 시도해주세요.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
          >
            새로고침
          </button>
          <a
            href="#/"
            className="border border-navy/25 px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-navy hover:border-navy"
          >
            홈으로 이동
          </a>
        </div>
      </div>
    )
  }
}

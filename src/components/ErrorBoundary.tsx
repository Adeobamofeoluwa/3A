import { Component, type ReactNode } from 'react'

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a1a1a', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#8B6F47', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

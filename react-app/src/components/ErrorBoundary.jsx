import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">אופס! משהו השתבש</h1>
              <p className="text-gray-600 mb-6">
                אירעה שגיאה בלתי צפויה. אנא רענן את הדף או נסה שוב מאוחר יותר.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <i className="fas fa-redo mr-2"></i>
                רענן דף
              </button>
              
              <a
                href="/"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <i className="fas fa-home mr-2"></i>
                חזרה לעמוד הבית
              </a>
              
              <a
                href="mailto:support@tshirt-designer.com"
                className="block text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                <i className="fas fa-envelope mr-1"></i>
                דווח על הבעיה
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

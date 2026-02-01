'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [showDetails, setShowDetails] = useState(process.env.NODE_ENV === 'development')

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Error caught by error boundary:', error)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="bg-destructive/10 p-6 rounded-full mb-6 text-destructive">
                <AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md mb-4">
                We encountered an error while loading this page. Our team has been notified.
            </p>

            {/* Error Details (shown in dev mode) */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showDetails ? 'Hide' : 'Show'} Error Details
            </button>

            {showDetails && (
                <div className="w-full max-w-2xl mb-6 text-left">
                    <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-4 overflow-auto max-h-64">
                        <p className="text-red-400 font-mono text-sm mb-2">
                            <strong>Error:</strong> {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-slate-400 font-mono text-xs mb-2">
                                <strong>Digest:</strong> {error.digest}
                            </p>
                        )}
                        {error.stack && (
                            <pre className="text-slate-400 font-mono text-xs whitespace-pre-wrap">
                                {error.stack}
                            </pre>
                        )}
                    </div>
                </div>
            )}

            <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all font-medium"
            >
                <RefreshCw className="w-4 h-4" />
                Try again
            </button>
        </div>
    )
}

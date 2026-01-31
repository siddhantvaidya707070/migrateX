'use client'

import * as React from 'react'

interface AuthContextType {
    user: { email: string } | null
    signOut: () => void
    signIn: () => void
}

const AuthContext = React.createContext<AuthContextType>({
    user: null,
    signOut: () => { },
    signIn: () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Mock user for demonstration
    const [user] = React.useState<{ email: string } | null>({
        email: 'demo@agent-system.ai'
    })

    const signOut = () => {
        // Mock sign out - in real app would redirect
        console.log('Mock sign out')
    }

    const signIn = () => {
        console.log('Mock sign in')
    }

    return (
        <AuthContext.Provider value={{ user, signOut, signIn }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return React.useContext(AuthContext)
}

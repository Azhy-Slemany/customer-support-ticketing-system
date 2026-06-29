'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/axios'

interface User {
    id: number
    name: string
    email: string
    roles: string[]
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    isAgent: () => boolean
    isCustomer: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // On mount, try to restore session from stored token
    useEffect(() => {
        const token = Cookies.get('token')
        if (token) {
            api.get('/me')
                .then((res) => setUser(res.data))
                .catch(() => Cookies.remove('token'))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        const { token, user } = res.data
        // Store token in cookie (httpOnly not possible client-side, but fine for this challenge)
        Cookies.set('token', token, { expires: 7 })
        setUser(user)
    }

    const logout = async () => {
        await api.delete('/auth/logout')
        Cookies.remove('token')
        setUser(null)
    }

    // Helper role checks used throughout the app
    const isAgent = () => user?.roles?.some(r => ['admin', 'support'].includes(r)) ?? false
    const isCustomer = () => user?.roles?.includes('customer') ?? false

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAgent, isCustomer }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
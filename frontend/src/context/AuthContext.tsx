'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/axios'
import { ROLES_ADMIN, ROLES_SUPPORT, ROLES_CUSTOMER } from '@/lib/constants'

interface AuthResponse {
    status: string
    message: string
    data: {
        token: string | undefined
        user: User
    }
    errors: Map<string, string> | null
}

interface User {
    id: number
    name: string
    email: string
    roles: string[]
    permissions: string[]
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
            api.get<AuthResponse>('/me')
                .then((res) => setUser(res.data.data.user))
                .catch(() => Cookies.remove('token'))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const res = await api.post<AuthResponse>('/auth/login', { email, password })
        const { data } = res.data

        // Store token in cookie
        try {
            if (!data.token) {
                throw new Error('Token is undefined')
            }
            Cookies.set('token', data.token, { expires: 7 })
        } catch (error) {
            console.error('Error setting token in cookies:', error)
        }
        setUser(data.user)
    }

    const logout = async () => {
        await api.delete('/auth/logout')
        Cookies.remove('token')
        setUser(null)
    }

    // Helpers
    const isAgent = () => user?.roles?.some(r => [ROLES_ADMIN, ROLES_SUPPORT].includes(r)) ?? false
    const isCustomer = () => user?.roles?.includes(ROLES_CUSTOMER) ?? false

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
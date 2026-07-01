import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Spin } from 'antd'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
    const { user, loading, isAgent } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (loading) return

        if (!user) {
            router.replace('/login')
        } else if (isAgent()) {
            router.replace('/agent/')
        } else {
            router.replace('/customer/')
        }
    }, [user, loading, isAgent, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Spin size="large" />
        </div>
    )
}
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Spin } from 'antd'

export default function CustomerIndexPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/customer/tickets')
    }, [router])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
        </div>
    )
}
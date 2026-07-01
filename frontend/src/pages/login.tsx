'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Form, Input, Button, Alert, Typography } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'

const { Title } = Typography

export default function LoginPage() {
    const { login, isAgent, user } = useAuth()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    if (user) {
        router.replace(isAgent() ? '/agent' : '/customer')
        return null
    }

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true)
        setError(null)
        try {
            await login(values.email, values.password)
            router.push(isAgent() ? '/agent/tickets' : '/customer/tickets')
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <Title level={3} className="text-center mb-6">Helpdesk Login</Title>

                {error && (
                    <Alert message={error} type="error" showIcon className="mb-4" />
                )}

                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Enter a valid email' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Password is required' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}
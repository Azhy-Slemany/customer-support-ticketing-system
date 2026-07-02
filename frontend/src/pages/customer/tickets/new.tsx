import { useState } from 'react'
import { useRouter } from 'next/router'
import {
    Form, Input, Select, Button, Typography, Alert, DatePicker, Space
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import AppLayout from '@/components/AppLayout'
import api from '@/lib/axios'
import type { ApiError, Ticket } from '@/types'
import axios from 'axios'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface CreateTicketForm {
    title: string
    description: string
    category: string
    priority: string
    booked_at?: string
    contact_preference?: string
}

export default function NewTicketPage() {
    const router = useRouter()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onFinish = async (values: CreateTicketForm) => {
        setLoading(true)
        setError(null)
        try {
            const payload = {
                ...values,
                // Send booked_at as ISO string if provided
                booked_at: values.booked_at ? values.booked_at : undefined,
            }
            const res = await api.post<{ data: Ticket, message: string }>('/tickets', payload)
            // Navigate to the new ticket's detail page on success
            router.push(`/customer/tickets/${res.data.data.id}`)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiError = err.response?.data as ApiError
                // Map Laravel field errors onto the form so they appear under the right inputs
                if (apiError.errors) {
                    form.setFields(
                        Object.entries(apiError.errors).map(([name, messages]) => ({ name, errors: messages }))
                    )
                } else {
                    setError(apiError.message ?? 'Failed to submit ticket.')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppLayout activeKey="/customer/tickets/new">
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    style={{ color: '#687382', marginBottom: 8, paddingLeft: 0 }}
                >
                    Back to My Tickets
                </Button>
                <Title level={4} style={{ margin: 0 }}>Create Ticket</Title>
                <Text style={{ color: '#687382' }}>Capture enough detail for support to triage quickly.</Text>
            </div>

            {error && (
                <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} closable onClose={() => setError(null)} />
            )}

            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #d9e0e8', padding: 24, maxWidth: 800 }}>
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>

                    {/* Title — full width */}
                    <Form.Item
                        name="title"
                        label={<span style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>TITLE</span>}
                        rules={[{ required: true, message: 'A title is required' }, { max: 255 }]}
                    >
                        <Input placeholder="e.g. VPN disconnects every hour" size="large" />
                    </Form.Item>

                    {/* Description — full width */}
                    <Form.Item
                        name="description"
                        label={<span style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>DESCRIPTION</span>}
                        rules={[{ required: true, message: 'A description is required' }, { max: 10000 }]}
                    >
                        <TextArea
                            placeholder="Describe the issue in as much detail as possible…"
                            rows={5}
                            showCount
                            maxLength={10000}
                        />
                    </Form.Item>

                    {/* Two-column row: Category + Priority */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-two-col">
                        <Form.Item
                            name="category"
                            label={<span style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>CATEGORY</span>}
                            rules={[{ required: true, message: 'Select a category' }]}
                        >
                            <Select placeholder="Select category" size="large">
                                <Option value="technical_issue">Technical Issue</Option>
                                <Option value="billing">Billing</Option>
                                <Option value="account_access">Account Access</Option>
                                <Option value="product_question">Product Question</Option>
                                <Option value="feature_request">Feature Request</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="priority"
                            label={<span style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>PRIORITY</span>}
                            rules={[{ required: true, message: 'Select a priority' }]}
                        >
                            <Select placeholder="Select priority" size="large">
                                <Option value="low">Low</Option>
                                <Option value="normal">Normal</Option>
                                <Option value="high">High</Option>
                                <Option value="urgent">Urgent</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Two-column row: Booking + Contact preference */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-two-col">
                        <Form.Item
                            name="booked_at"
                            label={<span style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>BOOK SUPPORT DATE & TIME <span style={{ fontWeight: 400 }}>(optional)</span></span>}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                size="large"
                                onChange={(_, dateStr) => {
                                    form.setFieldValue('booked_at', typeof dateStr === 'string' ? dayjs(dateStr) : undefined)
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="contact_preference"
                            label={<span style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>CONTACT PREFERENCE</span>}
                        >
                            <Select placeholder="email" size="large" allowClear>
                                <Option value="email">Email</Option>
                                <Option value="phone">Phone call</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            style={{ background: '#0f766e', borderColor: '#0f766e' }}
                        >
                            Submit Ticket
                        </Button>
                        <Button size="large" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </div>

            <style>{`
        @media (max-width: 640px) {
          .form-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </AppLayout>
    )
}
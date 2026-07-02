import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Typography, Spin, Alert, Button, Form, Input,
    Select, Avatar, Divider, Space, Popconfirm, message
} from 'antd'
import { ArrowLeftOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import AppLayout from '@/components/AppLayout'
import { StatusBadge, PriorityBadge } from '@/components/Badges'
import api from '@/lib/axios'
import type { Ticket, TicketComment, TicketStatus, ApiError } from '@/types'
import axios from 'axios'
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

export default function AgentTicketDetailPage() {
    const router = useRouter()
    const { id } = router.query

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Reply + status update form
    const [replyForm] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [replyError, setReplyError] = useState<string | null>(null)

    // Inline status update (separate from the reply form)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    useEffect(() => {
        if (id) fetchTicket()
    }, [id])

    const fetchTicket = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get<{ data: Ticket }>(`/tickets/${id}`)
            setTicket(res.data.data)
        } catch {
            setError('Ticket not found or you do not have access.')
        } finally {
            setLoading(false)
        }
    }

    // Post a reply and optionally change status in one action
    const submitReply = async (values: { description: string; status?: TicketStatus }) => {
        setSubmitting(true)
        setReplyError(null)
        try {
            // Post the comment first
            await api.post(`/tickets/${id}/comments`, { description: values.description })

            // If the agent also changed the status, patch the ticket
            if (values.status && values.status !== ticket?.status) {
                await api.patch(`/tickets/${id}`, { status: values.status })
            }

            replyForm.resetFields()
            message.success('Reply posted.')
            await fetchTicket()
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiError = err.response?.data as ApiError
                setReplyError(apiError.message ?? 'Failed to post reply.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    // Quick status change without a reply — e.g. closing a ticket directly
    const updateStatus = async (newStatus: TicketStatus) => {
        setUpdatingStatus(true)
        try {
            await api.patch(`/tickets/${id}`, { status: newStatus })
            message.success(`Ticket marked as ${newStatus}.`)
            await fetchTicket()
        } catch {
            message.error('Failed to update status.')
        } finally {
            setUpdatingStatus(false)
        }
    }

    if (loading) {
        return (
            <AppLayout activeKey="/agent/tickets">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <Spin size="large" />
                </div>
            </AppLayout>
        )
    }

    if (error || !ticket) {
        return (
            <AppLayout activeKey="/agent/tickets">
                <Alert message={error ?? 'Ticket not found.'} type="error" showIcon />
            </AppLayout>
        )
    }

    const isClosed = ticket.status === 'Closed'

    return (
        <AppLayout activeKey="/agent/tickets">
            {/* Back link */}
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/agent/tickets')}
                style={{ color: '#687382', marginBottom: 12, paddingLeft: 0 }}
            >
                Back to Queue
            </Button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        #{ticket.ticket_number}: {ticket.title}
                    </Title>
                    <Text style={{ color: '#687382' }}>
                        {ticket.category} · submitted by {ticket.customer?.name ?? '—'} · {dayjs(ticket.created_at).fromNow()}
                    </Text>
                </div>
                <Space wrap>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    {/* Quick-close button, guarded by a confirm to prevent accidents */}
                    {!isClosed && (
                        <Popconfirm
                            title="Close this ticket?"
                            description="The customer will no longer be able to add comments."
                            onConfirm={() => updateStatus('Closed')}
                            okText="Close ticket"
                            okButtonProps={{ danger: true }}
                        >
                            <Button size="small" danger loading={updatingStatus}>
                                Close Ticket
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18 }} className="detail-grid">

                {/* Left: thread + reply form */}
                <div style={{ display: 'grid', gap: 12 }}>
                    {/* Original ticket description — pinned as the first item in the thread */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid #d9e0e8',
                        borderRadius: 8,
                        padding: 16,
                        borderLeft: '3px solid #0f766e', // teal accent differentiates it from replies
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                style={{ background: '#687382' }}
                            />
                            <Text strong style={{ fontSize: 14 }}>Original Request</Text>
                            <Text style={{ fontSize: 12, color: '#687382' }}>
                                · {dayjs(ticket.created_at).format('MMM D, YYYY HH:mm')}
                            </Text>
                        </div>
                        <Paragraph
                            style={{ margin: 0, fontSize: 14, color: '#374151', whiteSpace: 'pre-line' }}
                        >
                            {ticket.description}
                        </Paragraph>
                    </div>

                    {/* Comments */}
                    {ticket.comments && ticket.comments.length > 0 ? (
                        ticket.comments.map((comment) => (
                            <CommentCard key={comment.id} comment={comment} />
                        ))
                    ) : (
                        <div style={{ background: '#fff', border: '1px solid #d9e0e8', borderRadius: 8, paddingTop: 40, color: '#687382', textAlign: 'center' }}>
                            No messages yet on this ticket.
                        </div>
                    )}

                    {/* Agent reply form — hidden when ticket is closed */}
                    {!isClosed && (
                        <div style={{ background: '#fff', border: '1px solid #d9e0e8', borderRadius: 8, padding: 16 }}>
                            <Text strong style={{ fontSize: 13 }}>Post Update</Text>
                            {replyError && (
                                <Alert message={replyError} type="error" showIcon style={{ marginTop: 10, marginBottom: 4 }} />
                            )}
                            <Form
                                form={replyForm}
                                onFinish={submitReply}
                                initialValues={{ status: ticket.status }}
                                style={{ marginTop: 10 }}
                            >
                                <Form.Item
                                    name="description"
                                    rules={[{ required: true, message: 'Reply cannot be empty' }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <TextArea rows={4} placeholder="Write your reply to the customer…" />
                                </Form.Item>

                                {/* Status can be updated alongside the reply */}
                                <Form.Item
                                    name="status"
                                    label={<Text style={{ fontSize: 12, fontWeight: 700, color: '#687382' }}>UPDATE STATUS</Text>}
                                    style={{ marginBottom: 12 }}
                                >
                                    <Select style={{ width: 200 }}>
                                        <Option value="Open">Open</Option>
                                        <Option value="In Progress">In Progress</Option>
                                        <Option value="Resolved">Resolved</Option>
                                        <Option value="Closed">Closed</Option>
                                    </Select>
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    style={{ background: '#0f766e', borderColor: '#0f766e' }}
                                >
                                    Post Update
                                </Button>
                            </Form>
                        </div>
                    )}

                    {isClosed && (
                        <div style={{ background: '#f4f7fa', border: '1px solid #d9e0e8', borderRadius: 8, padding: 14, color: '#687382', fontSize: 13 }}>
                            This ticket is closed. Reopen it by updating its status if needed.
                            <Button
                                size="small"
                                style={{ marginLeft: 10 }}
                                loading={updatingStatus}
                                onClick={() => updateStatus('Open')}
                            >
                                Reopen
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: metadata panel */}
                <aside>
                    <div style={{ background: '#fff', border: '1px solid #d9e0e8', borderRadius: 8, padding: 16 }}>
                        <Text strong>Ticket Details</Text>
                        <Divider style={{ margin: '12px 0' }} />
                        <MetaRow label="Ticket number" value={ticket.ticket_number} />
                        <MetaRow label="Customer" value={ticket.customer?.name ?? '—'} />
                        <MetaRow label="Status" value={<StatusBadge status={ticket.status} />} />
                        <MetaRow label="Priority" value={<PriorityBadge priority={ticket.priority} />} />
                        <MetaRow label="Category" value={ticket.category} />
                        <MetaRow label="Created" value={dayjs(ticket.created_at).format('MMM D, YYYY HH:mm')} />
                        <MetaRow label="Last updated" value={dayjs(ticket.updated_at).fromNow()} />
                        {ticket.booked_at && (
                            <MetaRow label="Booked support time" value={dayjs(ticket.booked_at).format('MMM D, YYYY HH:mm')} />
                        )}
                        {ticket.contact_preference && (
                            <MetaRow label="Contact preference" value={ticket.contact_preference} />
                        )}
                    </div>
                </aside>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </AppLayout>
    )
}

function CommentCard({ comment }: { comment: TicketComment }) {
    const isAgent = comment.user?.roles?.some((r) => ['admin', 'support'].includes(typeof r === 'string' ? r : r.name))
    return (
        <div style={{
            background: isAgent ? '#f4faf9' : '#fff',
            border: `1px solid ${isAgent ? '#a7d8d3' : '#d9e0e8'}`,
            borderRadius: 8,
            padding: 14,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Avatar
                    size="small"
                    icon={isAgent ? <CustomerServiceOutlined /> : <UserOutlined />}
                    style={{ background: isAgent ? '#0f766e' : '#687382' }}
                />
                <Text strong style={{ fontSize: 14 }}>{comment.user?.name ?? 'Unknown'}</Text>
                <Text style={{ fontSize: 12, color: '#687382' }}>
                    {isAgent ? 'Agent reply' : 'Customer'} · {dayjs(comment.created_at).format('MMM D, YYYY HH:mm')}
                </Text>
            </div>
            <Paragraph style={{ margin: 0, fontSize: 14 }}>{comment.description}</Paragraph>
        </div>
    )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#687382', display: 'block', marginBottom: 2 }}>{label}</Text>
            <div style={{ fontSize: 14 }}>{value}</div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Typography, Spin, Alert, Button, Form, Input, Avatar, Divider, Space, Tag
} from 'antd'
import { ArrowLeftOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import AppLayout from '@/components/AppLayout'
import { StatusBadge, PriorityBadge } from '@/components/Badges'
import api from '@/lib/axios'
import type { Ticket, TicketComment, ApiError } from '@/types'
import axios from 'axios'
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function CustomerTicketDetailPage() {
    const router = useRouter()
    const { id } = router.query

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [commentForm] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [commentError, setCommentError] = useState<string | null>(null)

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

    const submitComment = async (values: { description: string }) => {
        setSubmitting(true)
        setCommentError(null)
        try {
            await api.post(`/tickets/${id}/comments`, values)
            commentForm.resetFields()
            // Refresh the ticket to show the new comment in the thread
            await fetchTicket()
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiError = err.response?.data as ApiError
                setCommentError(apiError.message ?? 'Failed to post comment.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <AppLayout activeKey="/customer/tickets">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <Spin size="large" />
                </div>
            </AppLayout>
        )
    }

    if (error || !ticket) {
        return (
            <AppLayout activeKey="/customer/tickets">
                <Alert message={error ?? 'Ticket not found.'} type="error" showIcon />
            </AppLayout>
        )
    }

    return (
        <AppLayout activeKey="/customer/tickets">
            {/* Page header */}
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/customer/tickets')}
                style={{ color: '#687382', marginBottom: 12, paddingLeft: 0 }}
            >
                Back to My Tickets
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        #{ticket.ticket_number}: {ticket.title}
                    </Title>
                    <Text style={{ color: '#687382' }}>
                        {ticket.category} · submitted {dayjs(ticket.created_at).fromNow()}
                    </Text>
                </div>
                <Space>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                </Space>
            </div>

            {/* Two-column layout: thread + metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 18 }} className="detail-grid">

                {/* Left: conversation thread */}
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
                            No replies yet. A support agent will respond shortly.
                        </div>
                    )}

                    {/* Add comment form — only visible when ticket isn't closed */}
                    {ticket.status !== 'closed' && (
                        <div style={{ background: '#fff', border: '1px solid #d9e0e8', borderRadius: 8, padding: 16 }}>
                            <Text strong style={{ fontSize: 13 }}>Add a comment</Text>
                            {commentError && (
                                <Alert message={commentError} type="error" showIcon style={{ marginTop: 10, marginBottom: 4 }} />
                            )}
                            <Form form={commentForm} onFinish={submitComment} style={{ marginTop: 10 }}>
                                <Form.Item
                                    name="description"
                                    rules={[{ required: true, message: 'Comment cannot be empty' }]}
                                    style={{ marginBottom: 10 }}
                                >
                                    <TextArea rows={3} placeholder="Type your message…" />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    style={{ background: '#0f766e', borderColor: '#0f766e' }}
                                >
                                    Post Comment
                                </Button>
                            </Form>
                        </div>
                    )}

                    {ticket.status === 'closed' && (
                        <div style={{ background: '#f4f7fa', border: '1px solid #d9e0e8', borderRadius: 8, padding: 14, color: '#687382', fontSize: 13 }}>
                            This ticket is closed. Open a new ticket if you need further help.
                        </div>
                    )}
                </div>

                {/* Right: metadata panel */}
                <aside>
                    <div style={{ background: '#fff', border: '1px solid #d9e0e8', borderRadius: 8, padding: 16 }}>
                        <Text strong>Ticket Details</Text>
                        <Divider style={{ margin: '12px 0' }} />
                        <MetaRow label="Ticket number" value={ticket.ticket_number} />
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

// Single comment bubble in the thread
function CommentCard({ comment }: { comment: TicketComment }) {
    const isAgent = comment.user?.roles?.some((r) => ['admin', 'support'].includes(typeof r === 'string' ? r : r.name))
    return (
        <div style={{ background: '#fff', border: '1px solid #d9e0e8', borderRadius: 8, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Avatar
                    size="small"
                    icon={isAgent ? <CustomerServiceOutlined /> : <UserOutlined />}
                    style={{ background: isAgent ? '#0f766e' : '#687382' }}
                />
                <Text strong style={{ fontSize: 14 }}>{comment.user?.name ?? 'Unknown'}</Text>
                <Text style={{ fontSize: 12, color: '#687382' }}>
                    {isAgent ? 'Support reply' : 'Your comment'} · {dayjs(comment.created_at).format('MMM D, YYYY HH:mm')}
                </Text>
            </div>
            <Paragraph style={{ margin: 0, fontSize: 14 }}>{comment.description}</Paragraph>
        </div>
    )
}

// Label + value row used in the metadata panel
function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#687382', display: 'block', marginBottom: 2 }}>{label}</Text>
            <div style={{ fontSize: 14 }}>{value}</div>
        </div>
    )
}
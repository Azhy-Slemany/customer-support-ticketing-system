import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Table, Input, Select, Button, Typography, Space, DatePicker, Empty, Spin
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import AppLayout from '@/components/AppLayout'
import { StatusBadge, PriorityBadge } from '@/components/Badges'
import api from '@/lib/axios'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '@/types'
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime);

const { Title, Text } = Typography
const { Option } = Select

export default function CustomerTicketsPage() {
    const router = useRouter()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter state — all optional, empty string means "show all"
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
    const [categoryFilter, setCategoryFilter] = useState<TicketCategory | ''>('')
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('')
    const [bookedDate, setBookedDate] = useState<string>('')

    const fetchTickets = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get<{ data: Ticket[] }>('/tickets', {
                params: {
                    search: search || undefined,
                    status: statusFilter || undefined,
                    category: categoryFilter || undefined,
                    priority: priorityFilter || undefined,
                    booked_date: bookedDate || undefined,
                },
            })
            setTickets(res.data.data)
        } catch {
            setError('Failed to load tickets. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [search, statusFilter, categoryFilter, priorityFilter, bookedDate])

    const columns: ColumnsType<Ticket> = [
        {
            title: 'Ticket',
            dataIndex: 'ticket_number',
            key: 'ticket',
            render: (num: string, record: Ticket) => (
                <div>
                    <Text strong style={{ color: '#0f766e' }}>#{num}</Text>
                    <br />
                    <Text style={{ fontSize: 13 }}>{record.title}</Text>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat: string) => <Text style={{ fontSize: 13, color: '#687382' }}>{cat}</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: TicketStatus) => <StatusBadge status={status} />,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: TicketPriority) => <PriorityBadge priority={priority} />,
        },
        {
            title: 'Booked Time',
            dataIndex: 'booked_at',
            key: 'booked_at',
            render: (val: string | null) =>
                val ? (
                    <Text style={{ fontSize: 13 }}>{dayjs(val).format('MMM D, YYYY HH:mm')}</Text>
                ) : (
                    <Text style={{ fontSize: 13, color: '#687382' }}>Not booked</Text>
                ),
        },
        {
            title: 'Updated',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (val: string) => (
                <Text style={{ fontSize: 13, color: '#687382' }}>{dayjs(val).fromNow()}</Text>
            ),
        },
    ]

    return (
        <AppLayout activeKey="/customer/tickets">
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>My Tickets</Title>
                    <Text style={{ color: '#687382' }}>Track requests, appointments, status changes, and replies.</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.push('/customer/tickets/new')}
                    style={{ background: '#0f766e', borderColor: '#0f766e' }}
                >
                    New Ticket
                </Button>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}
                className="filter-bar"
            >
                <Input
                    prefix={<SearchOutlined style={{ color: '#687382' }} />}
                    placeholder="Search tickets…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
                <Select value={statusFilter || undefined} placeholder="All statuses" onChange={(v) => setStatusFilter(v ?? '')} allowClear>
                    <Option value="open">Open</Option>
                    <Option value="in_progress">In Progress</Option>
                    <Option value="resolved">Resolved</Option>
                    <Option value="closed">Closed</Option>
                </Select>
                <Select value={categoryFilter || undefined} placeholder="All categories" onChange={(v) => setCategoryFilter(v ?? '')} allowClear>
                    <Option value="technical_issue">Technical Issue</Option>
                    <Option value="billing">Billing</Option>
                    <Option value="account_access">Account Access</Option>
                    <Option value="product_question">Product Question</Option>
                    <Option value="feature_request">Feature Request</Option>
                    <Option value="other">Other</Option>
                </Select>
                <Select value={priorityFilter || undefined} placeholder="All priorities" onChange={(v) => setPriorityFilter(v ?? '')} allowClear>
                    <Option value="low">Low</Option>
                    <Option value="normal">Normal</Option>
                    <Option value="high">High</Option>
                    <Option value="urgent">Urgent</Option>
                </Select>
                <DatePicker
                    placeholder="Booked date"
                    onChange={(_, dateStr) => setBookedDate(typeof dateStr === 'string' ? dateStr : '')}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Ticket table */}
            {error ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#b91c1c' }}>{error}</div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={tickets}
                    rowKey="id"
                    loading={loading}
                    locale={{
                        emptyText: loading ? <Spin /> : (
                            <Empty description="No tickets found. Create your first one!" />
                        ),
                    }}
                    onRow={(record) => ({
                        onClick: () => router.push(`/customer/tickets/${record.id}`),
                        style: { cursor: 'pointer' },
                    })}
                    style={{ background: '#fff', borderRadius: 8, border: '1px solid #d9e0e8' }}
                    pagination={{ pageSize: 15, showTotal: (total) => `${total} tickets` }}
                />
            )}

            {/* Responsive filter bar: stack on mobile */}
            <style>{`
        @media (max-width: 768px) {
          .filter-bar { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .filter-bar { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </AppLayout>
    )
}
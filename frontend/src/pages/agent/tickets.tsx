import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Table, Input, Select, Typography, DatePicker, Empty, Spin, Space
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import AppLayout from '@/components/AppLayout'
import { StatusBadge, PriorityBadge } from '@/components/Badges'
import api from '@/lib/axios'
import type { Ticket, TicketStatus, TicketPriority, TicketCategory, PaginatedData } from '@/types'
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime);

const { Title, Text } = Typography
const { Option } = Select

export default function AgentQueuePage() {
    const router = useRouter()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
        last_page: 1,
    })
    const [error, setError] = useState<string | null>(null)

    // Filter state
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('open') // default: open
    const [categoryFilter, setCategoryFilter] = useState<TicketCategory | ''>('')
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('')
    const [bookedDate, setBookedDate] = useState<string>('')

    const fetchTickets = async (page = 1, pageSize = 20) => {
        setLoading(true)
        setError(null)
        try {
            // "open" is a convenience filter the backend maps to Open
            const res = await api.get<PaginatedData<Ticket>>('/tickets', {
                params: {
                    page,
                    per_page: pageSize,
                    search: search || undefined,
                    status: statusFilter || undefined,
                    category: categoryFilter || undefined,
                    priority: priorityFilter || undefined,
                    booked_date: bookedDate || undefined,
                },
            })
            setTickets(res.data.data)
            setPagination((prev) => ({ ...prev, total: res.data.total, last_page: res.data.last_page }))
        } catch {
            setError('Failed to load the queue. Please refresh.')
        } finally {
            setLoading(false)
        }
    }

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current ?? prev.current,
            pageSize: newPagination.pageSize ?? prev.pageSize,
        }));

        fetchTickets(newPagination.current ?? 1, newPagination.pageSize ?? 20)
    }

    useEffect(() => {
        setPagination((prev) => ({ ...prev, current: 1 })) // Reset to first page on filter change
        fetchTickets(1, pagination.pageSize)
    }, [search, statusFilter, categoryFilter, priorityFilter, bookedDate])

    const columns: ColumnsType<Ticket> = [
        {
            title: 'Ticket',
            key: 'ticket',
            render: (_, record: Ticket) => (
                <div>
                    <Text strong style={{ color: '#0f766e' }}>#{record.ticket_number}</Text>
                    <br />
                    <Text style={{ fontSize: 13 }}>{record.title}</Text>
                </div>
            ),
            sorter: (a, b) => a.ticket_number - b.ticket_number,
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (_, record: Ticket) => (
                <Text style={{ fontSize: 13 }}>{record.customer?.name ?? '—'}</Text>
            ),
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
            // Sort so Urgent always floats to the top by default
            render: (priority: TicketPriority) => <PriorityBadge priority={priority} />,
            defaultSortOrder: 'ascend',
            sorter: (a, b) => {
                const order = { urgent: 0, high: 1, normal: 2, low: 3 }
                return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
            },
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
            sorter: (a, b) => {
                if (!a.booked_at) return 1
                if (!b.booked_at) return -1
                return dayjs(a.booked_at).unix() - dayjs(b.booked_at).unix()
            },
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
        <AppLayout activeKey="/agent/tickets">
            <div style={{ marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>Ticket Queue</Title>
                <Text style={{ color: '#687382' }}>Prioritize urgent tickets and upcoming appointments.</Text>
            </div>

            {/* Filter bar */}
            <div
                style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, minmax(110px, 1fr))', gap: 10, marginBottom: 16 }}
                className="filter-bar"
            >
                <Input
                    prefix={<SearchOutlined style={{ color: '#687382' }} />}
                    placeholder="Search by ticket number, customer, or title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
                <Select
                    value={statusFilter || undefined}
                    placeholder="Status"
                    onChange={(v) => setStatusFilter(v ?? '')}
                    allowClear
                >
                    <Option value="open">Open</Option>
                    <Option value="in_progress">In Progress</Option>
                    <Option value="resolved">Resolved</Option>
                    <Option value="closed">Closed</Option>
                </Select>
                <Select
                    value={categoryFilter || undefined}
                    placeholder="All categories"
                    onChange={(v) => setCategoryFilter(v ?? '')}
                    allowClear
                >
                    <Option value="technical_issue">Technical Issue</Option>
                    <Option value="billing">Billing</Option>
                    <Option value="account_access">Account Access</Option>
                    <Option value="product_question">Product Question</Option>
                    <Option value="feature_request">Feature Request</Option>
                    <Option value="other">Other</Option>
                </Select>
                <Select
                    value={priorityFilter || undefined}
                    placeholder="All priorities"
                    onChange={(v) => setPriorityFilter(v ?? '')}
                    allowClear
                >
                    <Option value="urgent">Urgent</Option>
                    <Option value="high">High</Option>
                    <Option value="normal">Normal</Option>
                    <Option value="low">Low</Option>
                </Select>
                <DatePicker
                    placeholder="Appointment date"
                    onChange={(_, dateStr) => setBookedDate(typeof dateStr === 'string' ? dateStr : '')}
                    style={{ width: '100%' }}
                />
            </div>

            {error ? (
                <div style={{ color: '#b91c1c', padding: '40px 0', textAlign: 'center' }}>{error}</div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={tickets}
                    onChange={handleTableChange}
                    rowKey="id"
                    loading={loading}
                    locale={{
                        emptyText: loading ? <Spin /> : (
                            <Empty description="No tickets match the current filters." />
                        ),
                    }}
                    onRow={(record) => ({
                        onClick: () => router.push(`/agent/tickets/${record.id}`),
                        style: { cursor: 'pointer' },
                    })}
                    style={{ background: '#fff', borderRadius: 8, border: '1px solid #d9e0e8' }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) => `${range[0]}–${range[1]} of ${total} tickets`,
                    }}
                />
            )}

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
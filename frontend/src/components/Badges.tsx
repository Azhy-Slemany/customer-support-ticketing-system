import { Tag } from 'antd'
import type { TicketStatus, TicketPriority } from '@/types'

// Color tokens mirror the design reference exactly
const STATUS_COLORS: Record<TicketStatus, { color: string; bg: string }> = {
    'open': { color: '#2563eb', bg: '#dbeafe' },
    'in_progress': { color: '#b45309', bg: '#fef3c7' },
    'resolved': { color: '#15803d', bg: '#dcfce7' },
    'closed': { color: '#687382', bg: '#f4f7fa' },
}

const PRIORITY_COLORS: Record<TicketPriority, { color: string; bg: string }> = {
    'urgent': { color: '#b91c1c', bg: '#fee2e2' },
    'high': { color: '#b45309', bg: '#fef3c7' },
    'normal': { color: '#687382', bg: '#f4f7fa' },
    'low': { color: '#687382', bg: '#f4f7fa' },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
    const { color, bg } = STATUS_COLORS[status] ?? STATUS_COLORS['open']
    return (
        <Tag
            style={{
                color,
                background: bg,
                border: 'none',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 12,
                padding: '2px 10px',
            }}
        >
            {status}
        </Tag>
    )
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
    const { color, bg } = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS['normal']
    return (
        <Tag
            style={{
                color,
                background: bg,
                border: 'none',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 12,
                padding: '2px 10px',
            }}
        >
            {priority}
        </Tag>
    )
}
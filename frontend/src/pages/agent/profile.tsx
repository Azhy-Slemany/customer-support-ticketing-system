import { useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/AppLayout'
import { Avatar, Typography, Divider, Tag } from 'antd'
import { UserOutlined, MailOutlined, TagOutlined, SafetyOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

// Maps role names to a display label + color for the badge
const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: '#7c3aed', bg: '#ede9fe' },
    support: { label: 'Support Agent', color: '#0f766e', bg: '#ccfbf1' },
}

export default function AgentProfilePage() {
    const { user } = useAuth()

    // An agent may have multiple roles (e.g. admin + support), show all of them
    const roles = user?.roles ?? []

    return (
        <AppLayout activeKey="/agent/profile">
            <div style={{ maxWidth: 480 }}>
                <Title level={4} style={{ margin: '0 0 4px' }}>My Profile</Title>
                <Text style={{ color: '#687382' }}>Your account details.</Text>

                <div style={{
                    background: '#fff',
                    border: '1px solid #d9e0e8',
                    borderRadius: 8,
                    padding: 24,
                    marginTop: 20,
                }}>
                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <Avatar
                            size={64}
                            icon={<UserOutlined />}
                            style={{ background: '#0f766e', fontSize: 28, flexShrink: 0 }}
                        />
                        <div>
                            <Text strong style={{ fontSize: 18, display: 'block' }}>{user?.name}</Text>
                            {/* Show a badge for each role the agent holds */}
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                {roles.map((role) => {
                                    const meta = ROLE_META[role] ?? { label: role, color: '#687382', bg: '#f4f7fa' }
                                    return (
                                        <Tag
                                            key={role}
                                            style={{
                                                color: meta.color,
                                                background: meta.bg,
                                                border: 'none',
                                                borderRadius: 999,
                                                fontWeight: 700,
                                                fontSize: 12,
                                                padding: '2px 10px',
                                                margin: 0,
                                            }}
                                        >
                                            {meta.label}
                                        </Tag>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <Divider style={{ margin: '0 0 20px' }} />

                    <MetaRow icon={<MailOutlined />} label="Email" value={user?.email} />
                    <MetaRow
                        icon={<SafetyOutlined />}
                        label="Permissions"
                        value={roles.includes('admin') ? 'Full access — manage tickets, users, roles' : 'View, reply, and resolve tickets'}
                    />
                    <MetaRow icon={<TagOutlined />} label="Account type" value="Staff" />
                </div>
            </div>
        </AppLayout>
    )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div style={{ color: '#687382', width: 18, display: 'grid', placeItems: 'center', paddingTop: 2 }}>
                {icon}
            </div>
            <div>
                <Text style={{ fontSize: 12, color: '#687382', display: 'block' }}>{label}</Text>
                <Text style={{ fontSize: 14 }}>{value ?? '—'}</Text>
            </div>
        </div>
    )
}
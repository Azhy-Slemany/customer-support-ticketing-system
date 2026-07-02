import { useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/AppLayout'
import { Avatar, Typography, Divider } from 'antd'
import { UserOutlined, MailOutlined, TagOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function CustomerProfilePage() {
    const { user } = useAuth()

    return (
        <AppLayout activeKey="/customer/profile">
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
                            <Text style={{ color: '#687382', fontSize: 13 }}>Customer</Text>
                        </div>
                    </div>

                    <Divider style={{ margin: '0 0 20px' }} />

                    <MetaRow icon={<MailOutlined />} label="Email" value={user?.email} />
                    <MetaRow icon={<TagOutlined />} label="Role" value="Customer" />
                </div>
            </div>
        </AppLayout>
    )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ color: '#687382', width: 18, display: 'grid', placeItems: 'center' }}>
                {icon}
            </div>
            <div>
                <Text style={{ fontSize: 12, color: '#687382', display: 'block' }}>{label}</Text>
                <Text style={{ fontSize: 14 }}>{value ?? '—'}</Text>
            </div>
        </div>
    )
}
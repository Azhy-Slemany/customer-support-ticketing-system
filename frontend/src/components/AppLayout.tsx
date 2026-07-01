import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Layout, Menu, Avatar, Dropdown, Typography, Space } from 'antd'
import {
    PlusCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    UnorderedListOutlined,
    HomeOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'

const { Sider, Header, Content } = Layout
const { Text } = Typography

interface AppLayoutProps {
    children: ReactNode
    // The key of the currently active menu item, used to highlight the right link
    activeKey: string
}

// Sidebar links differ by role — customers see their portal, agents see the queue
function useMenuItems(isAgent: boolean) {
    if (isAgent) {
        return [
            { key: '/agent/tickets', icon: <UnorderedListOutlined />, label: <Link href="/agent/tickets">Queue</Link> },
            { key: '/agent/profile', icon: <UserOutlined />, label: <Link href="/agent/profile">Profile</Link> },
        ]
    }
    return [
        { key: '/customer/tickets', icon: <HomeOutlined />, label: <Link href="/customer/tickets">My Tickets</Link> },
        { key: '/customer/tickets/new', icon: <PlusCircleOutlined />, label: <Link href="/customer/tickets/new">Create Ticket</Link> },
        { key: '/customer/profile', icon: <UserOutlined />, label: <Link href="/customer/profile">Profile</Link> },
    ]
}

export default function AppLayout({ children, activeKey }: AppLayoutProps) {
    const { user, logout, isAgent } = useAuth()
    const router = useRouter()
    const menuItems = useMenuItems(isAgent())

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sign out',
            onClick: handleLogout,
            danger: true,
        },
    ]

    return (
        <Layout style={{ minHeight: '100vh', background: '#eef3f7' }}>
            {/* Sticky sidebar */}
            <Sider
                width={220}
                style={{
                    background: '#f8fafc',
                    borderRight: '1px solid #d9e0e8',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflow: 'auto',
                }}
                breakpoint="md"
                collapsedWidth={0}
            >
                {/* Brand mark */}
                <div style={{ padding: '20px 18px 8px', fontWeight: 800, fontSize: 15, color: '#17202a' }}>
                    <Space>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: '#0f766e', color: '#fff',
                            display: 'grid', placeItems: 'center',
                            fontWeight: 800, fontSize: 13,
                        }}>
                            HD
                        </div>
                        {isAgent() ? 'Agent Console' : 'Customer Portal'}
                    </Space>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[activeKey]}
                    items={menuItems}
                    style={{ background: 'transparent', border: 0, marginTop: 8 }}
                />
            </Sider>

            <Layout style={{ background: 'transparent' }}>
                {/* Top header bar */}
                <Header style={{
                    background: '#fff',
                    borderBottom: '1px solid #d9e0e8',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    height: 56,
                }}>
                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar size="small" icon={<UserOutlined />} style={{ background: '#0f766e' }} />
                            <Text style={{ fontSize: 14 }}>{user?.name}</Text>
                        </Space>
                    </Dropdown>
                </Header>

                {/* Main content area */}
                <Content style={{ padding: '28px 24px 60px', minWidth: 0 }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}
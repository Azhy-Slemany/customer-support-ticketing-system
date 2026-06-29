import type { AppProps } from 'next/app'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AuthProvider } from '@/context/AuthContext'
import '@/app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AntdRegistry>
            <AuthProvider>
                <Component {...pageProps} />
            </AuthProvider>
        </AntdRegistry>
    )
}
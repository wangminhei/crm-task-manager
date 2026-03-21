import './globals.css'
import { AuthProvider } from './context/AuthContext'

export const metadata = {
  title: 'CRM Task Manager',
  description: 'Hệ thống quản lý công việc nội bộ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

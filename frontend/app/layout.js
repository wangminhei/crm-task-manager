import './globals.css'

export const metadata = {
  title: 'FixPro Manager',
  description: 'Quản lý công việc kỹ thuật'
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  )
}

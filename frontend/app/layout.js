import './globals.css'

export const metadata = {
  title: 'FixPro Manager',
  description: 'Quản lý công việc kỹ thuật'
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  )
}

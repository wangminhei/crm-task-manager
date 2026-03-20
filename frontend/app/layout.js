import './globals.css'

export const metadata = {
  title: "CRM Dashboard",
  description: "Task Manager"
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{
        margin: 0,
        fontFamily: "Arial, sans-serif",
        background: "#f5f6fa"
      }}>
        {children}
      </body>
    </html>
  )
}

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-6">FixPro Manager</h2>

      <div className="space-y-3">
        <p className="bg-blue-500 px-3 py-2 rounded">📄 Công việc</p>
        <p className="px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">👤 Nhân viên</p>
        <p className="px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">👥 Khách hàng</p>
        <p className="px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">⚙️ Cài đặt</p>
      </div>
    </div>
  )
}

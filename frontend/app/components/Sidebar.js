export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-6">FixPro Manager</h2>

      <div className="space-y-3">
        <div className="bg-blue-500 px-3 py-2 rounded cursor-pointer">
          📄 Công việc
        </div>

        <div className="px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">
          👤 Nhân viên
        </div>

        <div className="px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">
          👥 Khách hàng
        </div>

        <div className="px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">
          ⚙️ Cài đặt
        </div>
      </div>
    </div>
  )
}

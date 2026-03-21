# 📘 CRM Task Manager — API Documentation

Base URL (production): `https://crm-task-manager-production-2cd3.up.railway.app`  
Base URL (local): `http://localhost:3001`

---

## 📋 Mục lục

- [Health Check](#health-check)
- [Tasks](#tasks)
- [Employees](#employees)
- [Customers](#customers)
- [Stats](#stats)
- [Error Codes](#error-codes)

---

## Health Check

### `GET /`
Kiểm tra server có đang chạy không.

**Response `200`**
```json
{
  "status": "ok",
  "message": "🚀 CRM API đang chạy"
}
```

---

### `GET /health`
Kiểm tra kết nối database.

**Response `200`**
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Response `500`**
```json
{
  "status": "error",
  "database": "disconnected"
}
```

---

## Tasks

### `GET /api/tasks`
Lấy danh sách tất cả tasks. Hỗ trợ filter qua query params.

**Query params**

| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `todo` `in_progress` `pending` `done` |
| `priority` | string | `low` `medium` `high` |
| `employee_id` | number | ID nhân viên |
| `customer_id` | number | ID khách hàng |

**Ví dụ**
```
GET /api/tasks?status=todo&priority=high
GET /api/tasks?employee_id=1
```

**Response `200`**
```json
[
  {
    "id": 1,
    "title": "Fix bug đăng nhập",
    "description": "Lỗi với email có ký tự đặc biệt",
    "status": "todo",
    "priority": "high",
    "due_date": "2026-03-25T00:00:00.000Z",
    "created_at": "2026-03-21T10:00:00.000Z",
    "updated_at": "2026-03-21T10:00:00.000Z",
    "employee_id": 1,
    "employee_name": "Nguyễn Văn An",
    "employee_role": "Developer",
    "customer_id": null,
    "customer_name": null,
    "customer_company": null
  }
]
```

---

### `GET /api/tasks/:id`
Lấy chi tiết 1 task.

**Params**

| Param | Kiểu | Mô tả |
|---|---|---|
| `id` | number | ID của task |

**Response `200`**
```json
{
  "id": 1,
  "title": "Fix bug đăng nhập",
  "description": "Lỗi với email có ký tự đặc biệt",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-03-25T00:00:00.000Z",
  "created_at": "2026-03-21T10:00:00.000Z",
  "updated_at": "2026-03-21T10:00:00.000Z",
  "employee_id": 1,
  "employee_name": "Nguyễn Văn An",
  "employee_role": "Developer",
  "employee_email": "an.nguyen@company.com",
  "customer_id": 1,
  "customer_name": "Công ty ABC",
  "customer_company": "ABC Corporation",
  "customer_email": "contact@abc.vn",
  "customer_phone": "028 1111 2222"
}
```

**Response `404`**
```json
{
  "error": "Không tìm thấy task"
}
```

---

### `POST /api/tasks`
Tạo task mới.

**Request body**

| Field | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| `title` | string | ✅ | — | Tiêu đề task |
| `description` | string | ❌ | null | Mô tả chi tiết |
| `status` | string | ❌ | `todo` | `todo` `in_progress` `pending` `done` |
| `priority` | string | ❌ | `medium` | `low` `medium` `high` |
| `due_date` | string | ❌ | null | Định dạng `YYYY-MM-DD` |
| `employee_id` | number | ❌ | null | ID nhân viên phụ trách |
| `customer_id` | number | ❌ | null | ID khách hàng liên quan |

**Ví dụ request**
```json
{
  "title": "Thiết kế giao diện mới",
  "description": "Theo brand guideline v2",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-04-01",
  "employee_id": 2,
  "customer_id": 1
}
```

**Response `201`**
```json
{
  "id": 21,
  "title": "Thiết kế giao diện mới",
  "description": "Theo brand guideline v2",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-04-01T00:00:00.000Z",
  "employee_id": 2,
  "customer_id": 1,
  "created_at": "2026-03-21T10:00:00.000Z",
  "updated_at": "2026-03-21T10:00:00.000Z"
}
```

**Response `400`**
```json
{
  "error": "Tiêu đề task là bắt buộc"
}
```

---

### `PUT /api/tasks/:id`
Cập nhật task. Chỉ cần truyền các field muốn thay đổi.

**Request body** — tất cả đều optional
```json
{
  "status": "done"
}
```
```json
{
  "title": "Tên mới",
  "priority": "low",
  "employee_id": 3
}
```

**Response `200`**
```json
{
  "id": 1,
  "title": "Tên mới",
  "status": "done",
  "priority": "low",
  "updated_at": "2026-03-21T11:00:00.000Z"
}
```

**Response `404`**
```json
{
  "error": "Không tìm thấy task"
}
```

---

### `DELETE /api/tasks/:id`
Xóa task.

**Response `200`**
```json
{
  "message": "Xóa task thành công",
  "task": {
    "id": 1,
    "title": "Fix bug đăng nhập"
  }
}
```

**Response `404`**
```json
{
  "error": "Không tìm thấy task"
}
```

---

## Employees

### `GET /api/employees`
Lấy danh sách nhân viên. Kèm thống kê số task của mỗi người.

**Query params**

| Param | Kiểu | Mô tả |
|---|---|---|
| `department` | string | Lọc theo phòng ban (ILIKE) |
| `role` | string | Lọc theo vai trò (ILIKE) |

**Ví dụ**
```
GET /api/employees?department=Kỹ thuật
GET /api/employees?role=Developer
```

**Response `200`**
```json
[
  {
    "id": 1,
    "name": "Nguyễn Văn An",
    "email": "an.nguyen@company.com",
    "role": "Developer",
    "department": "Kỹ thuật",
    "created_at": "2026-03-21T10:00:00.000Z",
    "updated_at": "2026-03-21T10:00:00.000Z",
    "total_tasks": "5",
    "tasks_todo": "2",
    "tasks_in_progress": "1",
    "tasks_pending": "0",
    "tasks_done": "2"
  }
]
```

---

### `GET /api/employees/:id`
Lấy chi tiết nhân viên kèm 10 tasks gần nhất.

**Response `200`**
```json
{
  "id": 1,
  "name": "Nguyễn Văn An",
  "email": "an.nguyen@company.com",
  "role": "Developer",
  "department": "Kỹ thuật",
  "total_tasks": "5",
  "tasks_todo": "2",
  "tasks_in_progress": "1",
  "tasks_pending": "0",
  "tasks_done": "2",
  "recent_tasks": [
    {
      "id": 1,
      "title": "Fix bug đăng nhập",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-03-25T00:00:00.000Z",
      "customer_name": null
    }
  ]
}
```

---

### `POST /api/employees`
Tạo nhân viên mới.

**Request body**

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Họ tên |
| `email` | string | ✅ | Email (unique) |
| `role` | string | ❌ | Vai trò |
| `department` | string | ❌ | Phòng ban |

**Ví dụ request**
```json
{
  "name": "Trần Văn Bình",
  "email": "binh.tran@company.com",
  "role": "Developer",
  "department": "Kỹ thuật"
}
```

**Response `201`**
```json
{
  "id": 11,
  "name": "Trần Văn Bình",
  "email": "binh.tran@company.com",
  "role": "Developer",
  "department": "Kỹ thuật",
  "created_at": "2026-03-21T10:00:00.000Z",
  "updated_at": "2026-03-21T10:00:00.000Z"
}
```

**Response `400`**
```json
{
  "error": "Email nhân viên đã tồn tại"
}
```

---

### `PUT /api/employees/:id`
Cập nhật nhân viên.

**Response `200`** — trả về object nhân viên đã cập nhật

**Response `400`**
```json
{
  "error": "Email nhân viên đã tồn tại"
}
```

---

### `DELETE /api/employees/:id`
Xóa nhân viên. Sẽ bị chặn nếu còn task chưa hoàn thành.

**Response `200`**
```json
{
  "message": "Xóa nhân viên thành công",
  "employee": { "id": 1, "name": "Nguyễn Văn An" }
}
```

**Response `400`**
```json
{
  "error": "Nhân viên này còn task chưa hoàn thành. Hãy chuyển task trước khi xóa."
}
```

---

## Customers

### `GET /api/customers`
Lấy danh sách khách hàng kèm thống kê tasks.

**Query params**

| Param | Kiểu | Mô tả |
|---|---|---|
| `search` | string | Tìm theo tên, email, công ty, phone (ILIKE) |
| `company` | string | Lọc theo tên công ty (ILIKE) |

**Ví dụ**
```
GET /api/customers?search=ABC
GET /api/customers?company=Corporation
```

**Response `200`**
```json
[
  {
    "id": 1,
    "name": "Công ty TNHH ABC",
    "email": "contact@abc.vn",
    "phone": "028 1111 2222",
    "company": "ABC Corporation",
    "created_at": "2026-03-21T10:00:00.000Z",
    "updated_at": "2026-03-21T10:00:00.000Z",
    "total_tasks": "3",
    "tasks_todo": "1",
    "tasks_in_progress": "1",
    "tasks_pending": "0",
    "tasks_done": "1"
  }
]
```

---

### `GET /api/customers/:id`
Lấy chi tiết khách hàng kèm 10 tasks gần nhất.

**Response `200`**
```json
{
  "id": 1,
  "name": "Công ty TNHH ABC",
  "email": "contact@abc.vn",
  "phone": "028 1111 2222",
  "company": "ABC Corporation",
  "total_tasks": "3",
  "tasks_done": "1",
  "recent_tasks": [
    {
      "id": 6,
      "title": "Thiết kế giao diện trang chủ mới",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2026-03-28T00:00:00.000Z",
      "employee_name": "Trần Thị Bình"
    }
  ]
}
```

---

### `POST /api/customers`
Tạo khách hàng mới.

**Request body**

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên khách hàng |
| `email` | string | ❌ | Email (unique nếu có) |
| `phone` | string | ❌ | Số điện thoại |
| `company` | string | ❌ | Tên công ty |

**Ví dụ request**
```json
{
  "name": "Nguyễn Văn Hùng",
  "email": "hung@example.com",
  "phone": "0901 234 567",
  "company": "Startup PQR"
}
```

**Response `201`**
```json
{
  "id": 11,
  "name": "Nguyễn Văn Hùng",
  "email": "hung@example.com",
  "phone": "0901 234 567",
  "company": "Startup PQR",
  "created_at": "2026-03-21T10:00:00.000Z",
  "updated_at": "2026-03-21T10:00:00.000Z"
}
```

---

### `PUT /api/customers/:id`
Cập nhật khách hàng.

**Response `200`** — trả về object khách hàng đã cập nhật

---

### `DELETE /api/customers/:id`
Xóa khách hàng. Sẽ bị chặn nếu còn task chưa hoàn thành.

**Response `200`**
```json
{
  "message": "Xóa khách hàng thành công",
  "customer": { "id": 1, "name": "Công ty TNHH ABC" }
}
```

**Response `400`**
```json
{
  "error": "Khách hàng này còn task chưa hoàn thành. Hãy xử lý task trước khi xóa."
}
```

---

## Stats

### `GET /api/stats`
Lấy toàn bộ dữ liệu thống kê cho dashboard.

**Response `200`**
```json
{
  "overview": {
    "total_tasks": "20",
    "tasks_todo": "5",
    "tasks_in_progress": "5",
    "tasks_pending": "5",
    "tasks_done": "5",
    "total_employees": "10",
    "total_customers": "10",
    "overdue_tasks": "2"
  },
  "by_status": [
    { "status": "todo",        "count": "5" },
    { "status": "in_progress", "count": "5" },
    { "status": "pending",     "count": "5" },
    { "status": "done",        "count": "5" }
  ],
  "by_priority": [
    { "priority": "high",   "count": "8" },
    { "priority": "medium", "count": "8" },
    { "priority": "low",    "count": "4" }
  ],
  "top_employees": [
    {
      "id": 1,
      "name": "Nguyễn Văn An",
      "role": "Developer",
      "total_tasks": "5",
      "tasks_done": "2",
      "tasks_open": "3"
    }
  ],
  "top_customers": [
    {
      "id": 1,
      "name": "Công ty TNHH ABC",
      "company": "ABC Corporation",
      "total_tasks": "3",
      "tasks_done": "1",
      "tasks_open": "2"
    }
  ],
  "overdue_tasks": [
    {
      "id": 2,
      "title": "Fix bug đăng nhập",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-03-19T00:00:00.000Z",
      "employee_name": "Nguyễn Văn An",
      "customer_name": null,
      "days_overdue": "2"
    }
  ],
  "recent_tasks": [
    {
      "id": 20,
      "title": "Sửa lỗi hiển thị sai ngày",
      "status": "done",
      "priority": "high",
      "created_at": "2026-03-21T10:00:00.000Z",
      "employee_name": "Bùi Thanh Tùng"
    }
  ]
}

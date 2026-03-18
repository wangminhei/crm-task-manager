# 📘 CRM API Documentation

Base URL:
http://localhost:3001

---

## 📦 RESPONSE FORMAT

Tất cả API trả về dạng:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

---

# 🧩 TASKS API

---

## 🔹 GET /tasks

### Mô tả

Lấy danh sách tất cả công việc

### Request

GET /tasks

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Lắp camera",
      "description": "Nhà khách A",
      "status": "pending",
      "user_name": "Nguyễn Văn A",
      "customer_name": "Khách A"
    }
  ]
}
```

---

## 🔹 POST /tasks

### Mô tả

Tạo công việc mới

### Request

POST /tasks

### Body

```json
{
  "title": "Lắp camera",
  "description": "Nhà B",
  "customer_id": 1,
  "assigned_to": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Lắp camera",
    "status": "pending"
  },
  "message": "Tạo task thành công"
}
```

---

## 🔹 PUT /tasks/:id

### Mô tả

Cập nhật trạng thái công việc

### Request

PUT /tasks/1

### Body

```json
{
  "status": "done"
}
```

### Response

```json
{
  "success": true,
  "message": "Cập nhật thành công"
}
```

---

## 🔹 DELETE /tasks/:id

### Mô tả

Xóa công việc

### Request

DELETE /tasks/1

### Response

```json
{
  "success": true,
  "message": "Đã xóa task"
}
```

---

## 🧩 STATUS VALUES

| Status    | Ý nghĩa    |
| --------- | ---------- |
| pending   | Chưa xử lý |
| done      | Hoàn thành |
| cancelled | Đã huỷ     |

---

## ⚠️ ERROR RESPONSE

```json
{
  "success": false,
  "message": "Lỗi server"
}
```

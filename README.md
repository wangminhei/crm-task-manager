# 🚀 CRM Task Manager

Hệ thống quản lý công việc (Task Management / CRM mini) dành cho đội kỹ thuật.

---

## 🧱 Tech Stack

* 🎨 Frontend: Next.js
* ⚙️ Backend: Node.js (Express)
* 🗄️ Database: PostgreSQL
* 🐳 Docker: Docker Compose

---

## 📦 Features

* Quản lý công việc (Tasks)
* Gán nhân viên
* Gắn khách hàng
* API RESTful
* UI dashboard đơn giản

---

## 📁 Project Structure

```
crm-task-manager/
├── backend/
├── frontend/
├── database/
├── docs/
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup (Local – không dùng Docker)

### 1. Clone project

```bash
git clone https://github.com/wangminhei/crm-task-manager.git
cd crm-task-manager
```

---

### 2. Setup Database

```bash
psql -U postgres
CREATE DATABASE crm;
\c crm
\i database/schema.sql
```

---

### 3. Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend chạy tại:

```
http://localhost:3001
```

---

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

## 🐳 Run bằng Docker (khuyên dùng)

Chạy toàn bộ hệ thống bằng 1 lệnh:

```bash
docker-compose up
```

---

## 🌐 URLs

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |
| Database | localhost:5432        |

---

## 📘 API Docs

Xem chi tiết tại:

```
docs/api.md
```

---

## ⚠️ Lưu ý

* Backend dùng PostgreSQL
* Khi chạy Docker, DB host là: `db`
* Không commit file `.env`

---

## 🔥 Future Improvements

* 🔐 Login / JWT Authentication
* 👑 Role-based access
* 📊 Dashboard nâng cao
* ⚡ Realtime (Socket.io)
* 📱 Mobile app

---

## 👨‍💻 Author

wangminhei 🚀

---

## ⭐ Gợi ý

Nếu bạn thấy project hữu ích:
👉 Star repo để lưu lại 😎

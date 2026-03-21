-- ============================================================
-- CRM Task Manager — Database Schema
-- PostgreSQL 15+
-- ============================================================

-- Xóa bảng cũ nếu tồn tại (theo thứ tự phụ thuộc)
DROP TABLE IF EXISTS tasks      CASCADE;
DROP TABLE IF EXISTS employees  CASCADE;
DROP TABLE IF EXISTS customers  CASCADE;

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE employees (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  role        VARCHAR(100),
  department  VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE,
  phone       VARCHAR(20),
  company     VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  status       VARCHAR(50)  NOT NULL DEFAULT 'todo'
                 CHECK (status IN ('todo', 'in_progress', 'pending', 'done')),
  priority     VARCHAR(20)  NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high')),
  due_date     DATE,
  employee_id  INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  customer_id  INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES (tăng tốc query)
-- ============================================================
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_priority    ON tasks(priority);
CREATE INDEX idx_tasks_employee_id ON tasks(employee_id);
CREATE INDEX idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX idx_tasks_due_date    ON tasks(due_date);
CREATE INDEX idx_employees_email   ON employees(email);
CREATE INDEX idx_customers_email   ON customers(email);

-- ============================================================
-- AUTO UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA (dữ liệu mẫu để test)
-- ============================================================

INSERT INTO employees (name, email, role, department) VALUES
  ('Nguyễn Văn An',   'an.nguyen@company.com',   'Developer',      'Kỹ thuật'),
  ('Trần Thị Bình',   'binh.tran@company.com',   'Designer',       'Sáng tạo'),
  ('Lê Hoàng Nam',    'nam.le@company.com',       'Project Manager','Quản lý'),
  ('Phạm Minh Tuấn',  'tuan.pham@company.com',   'Developer',      'Kỹ thuật'),
  ('Đỗ Thị Lan',      'lan.do@company.com',       'QA Tester',      'Kỹ thuật');

INSERT INTO customers (name, email, phone, company) VALUES
  ('Công ty ABC',       'contact@abc.vn',       '0901 111 222', 'ABC Corporation'),
  ('Nguyễn Thị Hoa',   'hoa.nguyen@gmail.com', '0912 333 444', NULL),
  ('Tập đoàn XYZ',     'info@xyz.com.vn',      '028 1234 5678','XYZ Group'),
  ('Startup DEF',       'hello@def.io',         '0933 555 666', 'DEF Tech'),
  ('Trần Văn Đức',     'duc.tran@outlook.com', '0944 777 888', NULL);

INSERT INTO tasks (title, description, status, priority, due_date, employee_id, customer_id) VALUES
  (
    'Thiết kế giao diện trang chủ',
    'Thiết kế UI/UX cho trang chủ theo brand guideline mới',
    'in_progress', 'high',
    CURRENT_DATE + INTERVAL '7 days',
    2, 1
  ),
  (
    'Fix bug đăng nhập',
    'Người dùng không thể đăng nhập bằng email có ký tự đặc biệt',
    'todo', 'high',
    CURRENT_DATE + INTERVAL '2 days',
    1, NULL
  ),
  (
    'Viết tài liệu API',
    'Viết document cho toàn bộ REST API endpoints theo chuẩn OpenAPI 3.0',
    'todo', 'medium',
    CURRENT_DATE + INTERVAL '14 days',
    4, NULL
  ),
  (
    'Kiểm thử tính năng thanh toán',
    'Test toàn bộ flow thanh toán trên môi trường staging',
    'pending', 'high',
    CURRENT_DATE + INTERVAL '5 days',
    5, 3
  ),
  (
    'Họp kickoff dự án DEF',
    'Họp xác nhận yêu cầu và lên kế hoạch triển khai với khách hàng DEF',
    'done', 'medium',
    CURRENT_DATE - INTERVAL '3 days',
    3, 4
  ),
  (
    'Tối ưu tốc độ tải trang',
    'Cải thiện Lighthouse score từ 65 lên trên 90',
    'todo', 'medium',
    CURRENT_DATE + INTERVAL '21 days',
    1, NULL
  ),
  (
    'Cập nhật nội dung landing page',
    'Cập nhật copy và hình ảnh theo yêu cầu của khách hàng ABC',
    'in_progress', 'low',
    CURRENT_DATE + INTERVAL '10 days',
    2, 1
  ),
  (
    'Setup CI/CD pipeline',
    'Cấu hình GitHub Actions để tự động deploy lên Railway và Vercel',
    'done', 'high',
    CURRENT_DATE - INTERVAL '7 days',
    4, NULL
  );

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'employees' AS table_name, COUNT(*) AS total FROM employees
UNION ALL
SELECT 'customers',                COUNT(*)            FROM customers
UNION ALL
SELECT 'tasks',                    COUNT(*)            FROM tasks;

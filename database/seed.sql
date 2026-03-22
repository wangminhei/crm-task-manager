-- ============================================================
-- Nhật Ký Công Việc — Seed Data
-- Chạy SAU khi đã chạy schema.sql
-- ============================================================

-- Xóa data cũ (giữ nguyên cấu trúc bảng)
TRUNCATE TABLE tasks      RESTART IDENTITY CASCADE;
TRUNCATE TABLE employees  RESTART IDENTITY CASCADE;
TRUNCATE TABLE customers  RESTART IDENTITY CASCADE;

-- ============================================================
-- EMPLOYEES (10 nhân viên)
-- ============================================================
INSERT INTO employees (name, email, role, department) VALUES
  ('Nguyễn Văn An',     'an.nguyen@company.com',     'Developer',       'Kỹ thuật'),
  ('Trần Thị Bình',     'binh.tran@company.com',     'UI/UX Designer',  'Sáng tạo'),
  ('Lê Hoàng Nam',      'nam.le@company.com',         'Project Manager', 'Quản lý'),
  ('Phạm Minh Tuấn',    'tuan.pham@company.com',     'Developer',       'Kỹ thuật'),
  ('Đỗ Thị Lan',        'lan.do@company.com',         'QA Tester',       'Kỹ thuật'),
  ('Vũ Quốc Hùng',      'hung.vu@company.com',       'DevOps',          'Kỹ thuật'),
  ('Hoàng Thị Mai',     'mai.hoang@company.com',     'Business Analyst','Kinh doanh'),
  ('Bùi Thanh Tùng',    'tung.bui@company.com',      'Developer',       'Kỹ thuật'),
  ('Ngô Thị Hương',     'huong.ngo@company.com',     'Marketing',       'Marketing'),
  ('Đinh Văn Khoa',     'khoa.dinh@company.com',     'Sales',           'Kinh doanh');

-- ============================================================
-- CUSTOMERS (10 khách hàng)
-- ============================================================
INSERT INTO customers (name, email, phone, company) VALUES
  ('Công ty TNHH ABC',      'contact@abc.vn',         '028 1111 2222', 'ABC Corporation'),
  ('Nguyễn Thị Hoa',        'hoa.nguyen@gmail.com',   '0912 333 444',  NULL),
  ('Tập đoàn XYZ',          'info@xyz.com.vn',        '028 1234 5678', 'XYZ Group'),
  ('Startup DEF Tech',       'hello@def.io',           '0933 555 666',  'DEF Technology'),
  ('Trần Văn Đức',          'duc.tran@outlook.com',   '0944 777 888',  NULL),
  ('Công ty Cổ phần GHI',   'ghi@ghi.com.vn',         '024 9999 0000', 'GHI JSC'),
  ('Lê Thị Ngọc',           'ngoc.le@yahoo.com',      '0955 111 222',  NULL),
  ('Tổng công ty JKL',       'contact@jkl.vn',         '028 8888 7777', 'JKL Corp'),
  ('Phạm Hoàng Long',       'long.pham@gmail.com',    '0966 333 444',  NULL),
  ('Công ty MNO Solutions', 'info@mno.com.vn',        '024 5555 6666', 'MNO Solutions');

-- ============================================================
-- TASKS (20 tasks — đủ mọi status và priority)
-- ============================================================
INSERT INTO tasks (title, description, status, priority, due_date, employee_id, customer_id) VALUES

  -- TODO
  (
    'Fix bug đăng nhập email ký tự đặc biệt',
    'Người dùng không thể đăng nhập khi email chứa dấu + hoặc ký tự đặc biệt. Cần fix ở phần validate phía backend.',
    'todo', 'high',
    CURRENT_DATE + INTERVAL '2 days',
    1, NULL
  ),
  (
    'Viết unit test cho module thanh toán',
    'Viết test coverage tối thiểu 80% cho toàn bộ payment service.',
    'todo', 'high',
    CURRENT_DATE + INTERVAL '5 days',
    4, NULL
  ),
  (
    'Tối ưu tốc độ tải trang chủ',
    'Cải thiện Lighthouse performance score từ 65 lên trên 90. Tập trung vào lazy loading và image optimization.',
    'todo', 'medium',
    CURRENT_DATE + INTERVAL '14 days',
    1, 1
  ),
  (
    'Viết tài liệu API theo chuẩn OpenAPI 3.0',
    'Document toàn bộ REST API endpoints. Dùng Swagger UI để hiển thị.',
    'todo', 'medium',
    CURRENT_DATE + INTERVAL '21 days',
    4, NULL
  ),
  (
    'Nghiên cứu tích hợp Zalo OA',
    'Khảo sát khả năng gửi thông báo qua Zalo OA cho khách hàng.',
    'todo', 'low',
    CURRENT_DATE + INTERVAL '30 days',
    7, 3
  ),

  -- IN PROGRESS
  (
    'Thiết kế giao diện trang chủ mới',
    'Thiết kế UI/UX theo brand guideline mới. Cần hoàn thành mockup Figma trước khi code.',
    'in_progress', 'high',
    CURRENT_DATE + INTERVAL '7 days',
    2, 1
  ),
  (
    'Cập nhật landing page cho khách hàng XYZ',
    'Cập nhật copy, hình ảnh và CTA theo yêu cầu từ brief của khách.',
    'in_progress', 'medium',
    CURRENT_DATE + INTERVAL '10 days',
    2, 3
  ),
  (
    'Setup CI/CD pipeline cho dự án mới',
    'Cấu hình GitHub Actions: test → build → deploy tự động lên Railway và Vercel.',
    'in_progress', 'high',
    CURRENT_DATE + INTERVAL '3 days',
    6, NULL
  ),
  (
    'Phân tích yêu cầu hệ thống Nhật Ký Công Việc cho GHI',
    'Thu thập và phân tích yêu cầu nghiệp vụ. Viết BRD và use case diagram.',
    'in_progress', 'medium',
    CURRENT_DATE + INTERVAL '14 days',
    7, 6
  ),
  (
    'Chạy chiến dịch email marketing tháng 4',
    'Thiết kế template, viết nội dung và lên lịch gửi cho 500 khách hàng tiềm năng.',
    'in_progress', 'medium',
    CURRENT_DATE + INTERVAL '8 days',
    9, NULL
  ),

  -- PENDING
  (
    'Kiểm thử tính năng thanh toán VNPay',
    'Test toàn bộ flow thanh toán trên staging. Bao gồm thành công, thất bại và hoàn tiền.',
    'pending', 'high',
    CURRENT_DATE + INTERVAL '5 days',
    5, 3
  ),
  (
    'Review code PR #47 — module báo cáo',
    'Review và approve pull request thêm tính năng xuất báo cáo Excel.',
    'pending', 'medium',
    CURRENT_DATE + INTERVAL '1 days',
    3, NULL
  ),
  (
    'Duyệt ngân sách marketing Q2',
    'Trình bày và xin duyệt ngân sách 50 triệu cho các hoạt động marketing quý 2.',
    'pending', 'high',
    CURRENT_DATE + INTERVAL '3 days',
    9, NULL
  ),
  (
    'Confirm yêu cầu thiết kế với khách hàng DEF',
    'Gửi mockup và chờ khách hàng DEF xác nhận trước khi bắt đầu code.',
    'pending', 'medium',
    CURRENT_DATE + INTERVAL '2 days',
    2, 4
  ),
  (
    'Báo giá dự án cho MNO Solutions',
    'Chuẩn bị và gửi bản báo giá chi tiết cho gói phần mềm quản lý kho.',
    'pending', 'low',
    CURRENT_DATE + INTERVAL '6 days',
    10, 10
  ),

  -- DONE
  (
    'Họp kickoff dự án DEF Tech',
    'Họp xác nhận yêu cầu và lên kế hoạch triển khai 3 tháng với team khách hàng.',
    'done', 'medium',
    CURRENT_DATE - INTERVAL '3 days',
    3, 4
  ),
  (
    'Deploy phiên bản v1.2.0 lên production',
    'Deploy thành công. Không có lỗi phát sinh sau 24h theo dõi.',
    'done', 'high',
    CURRENT_DATE - INTERVAL '7 days',
    6, NULL
  ),
  (
    'Onboarding nhân viên mới — Đinh Văn Khoa',
    'Hoàn thành quy trình onboarding, cấp tài khoản và hướng dẫn công cụ nội bộ.',
    'done', 'low',
    CURRENT_DATE - INTERVAL '5 days',
    3, NULL
  ),
  (
    'Gửi báo cáo tháng 3 cho khách hàng ABC',
    'Đã gửi báo cáo hiệu quả chiến dịch tháng 3, khách hàng xác nhận hài lòng.',
    'done', 'medium',
    CURRENT_DATE - INTERVAL '10 days',
    9, 1
  ),
  (
    'Sửa lỗi hiển thị sai ngày trên mobile',
    'Đã fix timezone bug khiến ngày hiển thị lệch 1 ngày trên thiết bị iOS.',
    'done', 'high',
    CURRENT_DATE - INTERVAL '2 days',
    8, NULL
  );

-- ============================================================
-- VERIFY
-- ============================================================
SELECT
  'employees' AS "Bảng",
  COUNT(*)    AS "Số bản ghi"
FROM employees

UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'tasks',     COUNT(*) FROM tasks

UNION ALL
SELECT
  'tasks theo status' AS "Bảng",
  NULL
FROM (SELECT 1) x

UNION ALL
SELECT status, COUNT(*)
FROM tasks
GROUP BY status
ORDER BY 1;

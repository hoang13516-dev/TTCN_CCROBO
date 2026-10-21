# ADR-0002: 3 vai trò (manager / analyst / admin) và phạm vi dữ liệu theo chi nhánh

- **Trạng thái:** Đã chấp nhận (chờ GVHD xác nhận — câu 5 trong `docs/phan-tich/cau-hoi-gvhd.md`)
- **Ngày:** 21/10/2026
- **Thay thế:** [ADR-0001](0001-ba-vai-tro-nguoi-dung.md)
- **Liên quan:** `ke-hoach.md` §2, §5.2, S2.3; `docs/phan-tich/03-dac-ta-yeu-cau.md` BR-15; `05-tac-nhan-va-use-case.md` §5.4

## Bối cảnh

Đề bài yêu cầu "đăng nhập & phân quyền xem báo cáo" và "bộ lọc theo chi nhánh". Doanh nghiệp mục tiêu có nhiều chi nhánh; mỗi quản lý chi nhánh chỉ nên thấy kết quả của chi nhánh mình (số liệu kinh doanh là thông tin nhạy cảm giữa các đơn vị).

## Quyết định

1. Ba vai trò có thứ bậc `manager < analyst < admin`; `users.role CHECK (role IN ('admin','analyst','manager'))`; middleware `requireRole(min)` so sánh theo thứ bậc.
2. **Phạm vi dữ liệu** tách khỏi vai trò: `users.branch_key` bắt buộc với `manager`, rỗng với vai trò khác (`CHECK ((role = 'manager') = (branch_key IS NOT NULL))`).
3. Middleware `applyBranchScope` chạy sau `requireAuth`: nếu là manager thì **ghi đè** tham số `branch` của request bằng chi nhánh của user, không báo lỗi. Áp dụng cho mọi API phân tích, cảnh báo, xuất báo cáo.
4. Vai trò và chi nhánh luôn đọc lại từ CSDL ở mỗi request (không tin giá trị trong JWT).

## Hệ quả

- **Tích cực:** đáp ứng đúng "phân quyền xem báo cáo"; một chỗ duy nhất áp phạm vi nên không sót endpoint; link chia sẻ từ giám đốc vẫn mở được ở tài khoản quản lý (thấy số của chi nhánh mình).
- **Tiêu cực:** mọi truy vấn phân tích phải nhận bộ lọc chi nhánh; cần test phân quyền cho từng endpoint 🔒 (bảng §5.4.2).
- **Phương án đã loại:**
  - _2 vai admin/viewer:_ đơn giản nhưng không thể hiện phân quyền theo đơn vị.
  - _Trả 403 khi manager hỏi chi nhánh khác:_ an toàn nhưng làm hỏng link chia sẻ.
  - _Row-Level Security của PostgreSQL:_ mạnh hơn (chặn cả ở tầng CSDL) nhưng cần đặt biến phiên cho mỗi kết nối trong pool; để hướng phát triển.
  - _Phân quyền theo từng quyền (permission-based):_ quá mức cần thiết; nâng cấp được sau mà không đổi API vì middleware đã tách riêng.

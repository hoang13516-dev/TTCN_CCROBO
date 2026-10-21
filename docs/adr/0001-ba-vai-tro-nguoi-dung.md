# ADR-0001: Dùng 3 vai trò người dùng (admin / analyst / viewer)

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-10-21
- **Liên quan:** `ke-hoach.md` §1.2, §5, B2.2; `docs/phan-tich/05-tac-nhan-va-use-case.md` §5.4

## Bối cảnh

`ke-hoach.md` ban đầu có 2 vai trò `admin` / `viewer`. Khi phân tích nghiệp vụ cửa hàng nhỏ có nhân viên, xuất hiện 3 nhóm người dùng có nhu cầu và mức tin cậy khác nhau:

1. **Chủ cửa hàng**: cấu hình nguồn dữ liệu (chứa mật khẩu CSDL/API key), quản lý tài khoản.
2. **Nhân viên văn phòng/kế toán**: nhập dữ liệu hằng ngày, sửa khi nhập nhầm, xuất số liệu.
3. **Quản lý ca/đối tác**: chỉ xem.

Với 2 vai trò, nhân viên nhập liệu buộc phải là `admin`, tức là cũng xem/sửa được thông tin đăng nhập CSDL và cấp quyền cho người khác. Điều này vi phạm nguyên tắc **đặc quyền tối thiểu** (least privilege).

## Quyết định

Dùng 3 vai trò có thứ bậc `viewer < analyst < admin` (vai trò cao hơn làm được mọi việc của vai trò thấp hơn), cột `users.role CHECK (role IN ('admin','analyst','viewer'))`, middleware `requireRole(min)` so sánh theo thứ bậc. Các ngoại lệ không theo thứ bậc (analyst chỉ hủy lần nhập của mình; không được còn 0 admin) được kiểm tra trong service.

## Hệ quả

- **Tích cực:** nhân viên nhập liệu không tiếp cận được bí mật nguồn dữ liệu; người xem không xuất được dữ liệu; phân quyền khớp với tổ chức thật của cửa hàng.
- **Tiêu cực:** thêm khoảng 0,5 h (B2.2) cho phần auth và 5 h (B4.8) cho giao diện quản lý người dùng; thêm test phân quyền theo ma trận.
- **Phương án đã loại:**
  - _Giữ 2 vai trò:_ đơn giản nhưng sai nguyên tắc đặc quyền tối thiểu.
  - _Phân quyền theo từng quyền (permission-based RBAC):_ linh hoạt nhưng quá mức cần thiết cho cửa hàng 1–4 người dùng. Có thể nâng cấp sau mà không đổi API, vì middleware đã tách biệt.

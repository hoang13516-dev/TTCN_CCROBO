# ADR-0001: Dùng 3 vai trò người dùng (admin / analyst / viewer)

- **Trạng thái:** ~~Đã chấp nhận~~ → **Đã thay thế** bởi [ADR-0002](0002-vai-tro-va-pham-vi-chi-nhanh.md) (21/10/2026)
- **Ngày:** 21/10/2026

## Tóm tắt (giữ lại để truy vết)

Bản phân tích v1 dùng 3 vai trò có thứ bậc `viewer < analyst < admin`, trong đó `viewer` xem toàn bộ dữ liệu. Lý do chọn 3 vai thay vì 2: tách người thao tác dữ liệu khỏi người cấu hình hệ thống (nguyên tắc đặc quyền tối thiểu).

## Vì sao bị thay thế

Khi đối chiếu đề bài ("phân quyền xem báo cáo", "bộ lọc theo chi nhánh"), vai trò `viewer` xem toàn chuỗi không thể hiện được việc **giới hạn báo cáo theo đơn vị**. ADR-0002 giữ nguyên ý tưởng 3 vai có thứ bậc, nhưng đổi vai thấp nhất thành `manager` gắn với một chi nhánh.

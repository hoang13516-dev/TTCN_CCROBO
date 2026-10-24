# ADR-0004: Phạm vi cơ bản nhưng mở rộng được (ETL trong request, không MV, không cron)

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 21/10/2026
- **Liên quan:** `docs/phan-tich/03-dac-ta-yeu-cau.md` §3.1.7; `docs/phan-tich/08-kien-truc-va-dinh-huong.md` §8.2.2, §8.6

## Bối cảnh

Kế hoạch đầu cần 131 giờ cho 1 sinh viên, gồm nhiều cơ chế hạ tầng (xử lý nhập nền + polling, mã hoá AES cấu hình nguồn, cron + advisory lock, hủy lần nhập, lưu mẫu ánh xạ, materialized view) nhưng lại thiếu các chức năng đề bài yêu cầu. Mục tiêu mới: **hoàn thành ở mức cơ bản, hiểu nghiệp vụ, mở rộng được sau**, khoảng 92 giờ.

## Quyết định

| Cơ chế bản đầu           | Hiện tại                                  |
| ------------------------ | ----------------------------------------- |
| Nhập nền (202 + polling) | Xử lý trong request, giới hạn 10.000 dòng |
| Bảng `staging_rows`      | Kiểm tra trong bộ nhớ (≤ 10.000 dòng)     |
| Materialized view        | Truy vấn trực tiếp fact + index           |
| Đồng bộ theo lịch (cron) | Đồng bộ bằng nút bấm                      |
| Kết nối CSDL ngoài       | Không làm (đề cho chọn CSDL **hoặc** API) |
| Mã hoá API key           | Lưu thường, không bao giờ trả ra API/log  |
| Hủy lần nhập, mẫu ánh xạ | Không làm; nhập lại file đúng để ghi đè   |
| PDF tạo ở server         | Trang in A4 + `window.print()`            |

Cách mở rộng từng mục khi cần: `docs/phan-tich/03-dac-ta-yeu-cau.md` §3.1.7 (nguồn duy nhất); lộ trình theo giai đoạn: `docs/phan-tich/08-kien-truc-va-dinh-huong.md` §8.6.

## Hệ quả

- **Tích cực:** dồn thời gian vào đúng yêu cầu của đề (ETL, star schema, KPI, drill-down, cảnh báo, xuất báo cáo); ít thành phần chạy nền nên dễ debug và dễ deploy free tier.
- **Tiêu cực:** file > 10.000 dòng phải chia nhỏ; request nhập giữ kết nối tới khi xong (≤ 15 s); dữ liệu online chỉ mới khi có người bấm đồng bộ. Các hạn chế này ghi vào báo cáo tổng kết.

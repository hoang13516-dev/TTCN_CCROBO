# Câu hỏi gửi GVHD — CN-019

> Soạn để gửi GVHD ThS. Dương Văn Đeo (GV001). Mỗi câu có sẵn phương án đề xuất để GVHD chỉ cần chọn A hoặc B. Kết quả ghi lại ở mục 4 của [07-truy-vet-va-tu-kiem-tra.md](07-truy-vet-va-tu-kiem-tra.md#4-vấn-đề-còn-mở--cần-bạn-tự-xử-lý).

## Câu 1 — Nguồn dữ liệu (O-02)

Đề ghi "kết nối CSDL hoặc đồng bộ qua API". Em hiểu đây là **chọn một trong hai**, còn upload file CSV/Excel là bắt buộc. Thầy/cô xác nhận giúp em:

- **A.** Đúng: file là bắt buộc; CSDL hoặc API chọn một (em làm API đồng bộ, kiểm tra gia tăng).
- **B.** Không: cả CSDL và API đều bắt buộc.

## Câu 2 — Kỳ so sánh (O-05)

Khi xem "tháng này", so sánh với kỳ nào?

- **A.** Cùng số ngày liền trước (01–21/10 so với 10–30/09). Đây là cách hệ thống đang làm.
- **B.** Cùng kỳ tháng trước (01–21/10 so với 01–21/09).

## Câu 3 — Lợi nhuận (O-10)

Đề yêu cầu KPI lợi nhuận, nhưng dữ liệu bán hàng thường không có giá vốn.

- **A.** Ghi lợi nhuận vào phạm vi ngoài, nêu rõ là hướng phát triển.
- **B.** Thêm cột giá vốn nhập tay (không bắt buộc). Lợi nhuận gộp chỉ tính khi có giá vốn.

## Câu 4 — Vùng miền và chi nhánh (O-11)

- **A.** Thêm trường vùng/tỉnh vào đơn hàng, lấy từ file nếu có. Nếu file không có thì bỏ.
- **B.** Bỏ phân tích theo vùng miền, ghi vào phạm vi ngoài.

Thầy/cô cho em hỏi thêm: "chi nhánh" trong bộ lọc là **kênh bán** (Shopee, TikTok, cửa hàng), hay **cửa hàng thật** (nhiều điểm bán)?

## Câu 5 — Mô hình dữ liệu (O-12)

Đề nhắc "Star Schema / OLAP". Thiết kế hiện tại là schema chuẩn hoá, kèm bảng tổng hợp (materialized view) để truy vấn nhanh.

- **A.** Giữ schema chuẩn hoá và giải thích bảng tổng hợp là dạng star. Thêm drill-down (tháng → ngày, danh mục → sản phẩm).
- **B.** Thiết kế lại thành bảng sự kiện và bảng chiều đầy đủ. Tốn thêm khoảng 6–8 giờ.

## Câu 6 — Cảnh báo chỉ số bất thường (O-13)

- **A.** Thêm cảnh báo khi một KPI lệch quá ngưỡng cố định so với kỳ trước (không dùng học máy).
- **B.** Không làm, ghi vào phạm vi ngoài.

## Câu 7 — Định dạng xuất báo cáo (O-14)

Đề ghi xuất PDF/Excel.

- **A.** Xuất CSV (mở được bằng Excel). PDF để làm sau nếu còn thời gian.
- **B.** Làm PDF ngay trong phạm vi chính.

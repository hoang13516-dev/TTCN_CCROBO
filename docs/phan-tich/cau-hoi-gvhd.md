# Câu hỏi gửi GVHD — CN-019

> Gửi GVHD ThS. Dương Văn Đeo (GV001). Em đã chốt sẵn phương án cho từng điểm (cột **A**) để làm ở mức cơ bản nhưng đủ "Kết quả cần đạt" của đề; thầy/cô chỉ cần xác nhận A hoặc chọn B. Kết quả ghi vào [07 §5, O-15](07-truy-vet-va-tu-kiem-tra.md#5-vấn-đề-còn-mở--cần-bạn-tự-xử-lý).

## Câu 1 — Nguồn dữ liệu

Đề ghi "upload CSV/Excel, kết nối CSDL **hoặc** đồng bộ qua API".

- **A.** Upload CSV/Excel + đồng bộ **REST API** (đồng bộ tăng dần, bấm nút). Kết nối CSDL ngoài để hướng phát triển.
- **B.** Làm cả CSDL và API.

## Câu 2 — Lợi nhuận

Dữ liệu bán hàng thường không có giá vốn.

- **A.** File/API có cột **giá vốn** cho từng dòng bán (giá vốn tại thời điểm bán). Lợi nhuận gộp = doanh thu − giá vốn.
- **B.** Giá vốn khai báo trên danh mục sản phẩm (đơn giản hơn nhưng sai khi giá vốn thay đổi theo thời gian).

## Câu 3 — Chi nhánh và vùng miền

- **A.** "Chi nhánh" là **cửa hàng thật**; mỗi chi nhánh thuộc một tỉnh, một vùng (Bắc/Trung/Nam). "Sản phẩm bán chạy theo vùng miền" = theo vùng của chi nhánh bán. Kênh bán (tại quầy, website, sàn) là một chiều riêng.
- **B.** "Chi nhánh" là kênh bán; vùng miền lấy theo địa chỉ khách.

## Câu 4 — Mô hình OLAP

- **A.** Kho dữ liệu **hình sao** thật: `fact_sales` (hạt = 1 sản phẩm trong 1 đơn) và 5 bảng chiều ngày, chi nhánh, sản phẩm, khách hàng, kênh.
- **B.** Schema chuẩn hoá kèm bảng tổng hợp.

## Câu 5 — Phân quyền xem báo cáo

- **A.** 3 vai trò: **quản trị** (toàn quyền), **nhân viên phân tích** (nhập dữ liệu, xem toàn chuỗi), **quản lý chi nhánh** (chỉ xem và xuất báo cáo của chi nhánh mình).
- **B.** 2 vai trò quản trị / người xem, không giới hạn theo chi nhánh.

## Câu 6 — Cảnh báo chỉ số bất thường

- **A.** Quy tắc cấu hình được: chỉ số giảm quá X % so với kỳ trước, biên lợi nhuận thấp hơn ngưỡng, ngày có doanh thu lệch quá 2 độ lệch chuẩn so với 28 ngày trước. Không dùng học máy.
- **B.** Cần dùng mô hình học máy.

## Câu 7 — Kỳ so sánh

Khi xem "tháng này" (01–21/10), so với kỳ nào?

- **A.** Cùng số ngày liền trước (10–30/09).
- **B.** Cùng kỳ tháng trước (01–21/09).

## Câu 8 — Xuất báo cáo

- **A.** Excel tạo ở server (5 sheet). PDF là trang báo cáo bố cục A4, người dùng chọn "Lưu thành PDF" của trình duyệt (giữ được biểu đồ).
- **B.** PDF phải tạo ở server (file tải về trực tiếp).

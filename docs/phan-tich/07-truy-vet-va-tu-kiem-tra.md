# Chương 7. MA TRẬN TRUY VẾT & TỰ KIỂM TRA

## 1. Đề bài → use case (độ phủ "Kết quả cần đạt")

| Đề bài yêu cầu                                   | Đáp ứng bằng                                                           | Use case   | Kiểm chứng                         |
| ------------------------------------------------ | ---------------------------------------------------------------------- | ---------- | ---------------------------------- |
| Thu thập từ nhiều nguồn: upload CSV/Excel        | FR-08…FR-14                                                            | UC06–UC09  | AC-06.x, AC-07.x, AC-09.x          |
| … kết nối CSDL **hoặc** đồng bộ API              | Chọn **REST API** (FR-15…FR-18)                                        | UC10, UC11 | AC-10.x, AC-11.x                   |
| KPI doanh thu, lợi nhuận, giá trị đơn trung bình | FR-19, BR-01…BR-03                                                     | UC12       | AC-12.1                            |
| KPI tỷ lệ giữ chân khách hàng                    | FR-19, BR-04                                                           | UC12       | AC-12.3                            |
| Sản phẩm bán chạy theo vùng miền / thời gian     | FR-21 (theo vùng), FR-24 (lọc thời gian), FR-26                        | UC12–UC14  | AC-13.3, AC-14.1                   |
| ETL (trích xuất – làm sạch/chuẩn hoá – nạp)      | FR-08…FR-11, FR-17, pipeline chung                                     | UC06, UC11 | AC-06.1…AC-06.7, AC-11.1           |
| Mô hình OLAP / Star Schema                       | `fact_sales` + 5 bảng chiều (ADR-0003)                                 | —          | DoD S1.3                           |
| Tối ưu truy vấn tổng hợp trên dữ liệu lớn        | NFR-01, EXPLAIN trước/sau (S2.1, S6.3)                                 | —          | `docs/sql/explain.md`              |
| Biểu đồ tương tác drill-down, cross-filtering    | FR-25, FR-26, FR-27                                                    | UC13, UC14 | AC-13.3, AC-14.1, AC-14.3          |
| Đăng nhập & phân quyền xem báo cáo               | FR-01…FR-06, BR-15                                                     | UC01–UC04  | AC-01.x, AC-04.x, AC-13.4, AC-17.2 |
| Quản lý nguồn dữ liệu & import/ETL               | FR-15, FR-08…FR-13                                                     | UC06–UC10  | AC-10.x                            |
| Bộ lọc đa chiều thời gian / chi nhánh / danh mục | FR-24, `dim_branch`                                                    | UC13       | AC-13.2                            |
| Cảnh báo chỉ số bất thường                       | FR-29…FR-31, BR-20                                                     | UC15, UC16 | AC-15.x, AC-16.x                   |
| Xuất báo cáo PDF/Excel                           | FR-32, FR-33                                                           | UC17       | AC-17.x                            |
| Báo cáo phân tích thiết kế                       | `docs/phan-tich/`, `docs/adr/`, `docs/erd.md`, báo cáo tổng kết (S7.4) | —          | —                                  |

**Kết quả:** 15/15 yêu cầu của đề có use case hoặc sản phẩm tương ứng.

## 2. Vấn đề → giải pháp

| Vấn đề                             | Mục tiêu | Yêu cầu giải quyết         | Use case         | Quy tắc             |
| ---------------------------------- | -------- | -------------------------- | ---------------- | ------------------- |
| P1 Dữ liệu phân tán                | G6       | FR-08, FR-15, FR-17        | UC06, UC10, UC11 | BR-06, BR-16        |
| P2 Chuẩn hoá tay                   | G1       | FR-09, FR-10, FR-13, FR-14 | UC06–UC09        | BR-09, BR-10        |
| P3 Đơn hủy/trùng bị cộng           | G2       | FR-10, FR-11               | UC06             | BR-01, BR-06, BR-08 |
| P4 Không thấy lợi nhuận            | G4       | FR-19, FR-20, FR-22        | UC12             | BR-02               |
| P5 Không so được chi nhánh/vùng/SP | G3       | FR-21…FR-27                | UC12–UC14        | BR-19               |
| P6 Biết sụt giảm quá muộn          | G5       | FR-29…FR-31                | UC15, UC16       | BR-20               |
| P7 Không biết khách quay lại       | G4       | FR-19                      | UC12             | BR-04               |
| P8 Lộ số liệu giữa chi nhánh       | —        | FR-01…FR-06                | UC01–UC04        | BR-15, BR-17        |

**Kết quả:** 8/8 vấn đề có giải pháp; 6/6 mục tiêu có yêu cầu đo được.

## 3. Yêu cầu chức năng → use case → bước kế hoạch → kiểm chứng

Một bước chỉ được tick khi mọi AC của các FR thuộc bước đó đã pass.

| FR    | Ưu tiên | UC     | Bước KH          | Kiểm chứng bằng                                  |
| ----- | ------- | ------ | ---------------- | ------------------------------------------------ |
| FR-01 | Must    | UC01   | S2.3, S2.4       | AC-01.1…AC-01.4                                  |
| FR-02 | Must    | UC02   | S2.3, S2.4       | AC-02.1                                          |
| FR-03 | Must    | UC01   | S2.4             | AC-01.5…AC-01.7                                  |
| FR-04 | Should  | UC03   | S6.1             | AC-03.1, AC-03.2                                 |
| FR-05 | Should  | UC04   | S6.1             | AC-04.1…AC-04.4                                  |
| FR-06 | Must    | tất cả | S2.3 (+ mọi API) | AC-06.10, AC-13.4, AC-15.4, AC-17.2, bảng §5.4.2 |
| FR-07 | Should  | UC05   | S6.1             | AC-05.1, AC-05.2                                 |
| FR-08 | Must    | UC06   | S3.1             | AC-06.8                                          |
| FR-09 | Must    | UC07   | S2.2, S3.1, S3.3 | AC-07.1, AC-07.2                                 |
| FR-10 | Must    | UC06   | S2.2, S3.2       | AC-06.3…AC-06.6                                  |
| FR-11 | Must    | UC06   | S3.2             | AC-06.1, AC-06.2, AC-06.7                        |
| FR-12 | Must    | UC06   | S3.2, S3.3       | AC-06.1, AC-06.5                                 |
| FR-13 | Must    | UC09   | S3.3             | AC-09.1, AC-09.2                                 |
| FR-14 | Should  | UC08   | S3.3             | AC-08.1                                          |
| FR-15 | Must    | UC10   | S5.3             | AC-10.1, AC-10.2                                 |
| FR-16 | Should  | UC10   | S5.3             | AC-10.3                                          |
| FR-17 | Must    | UC11   | S5.3             | AC-11.1…AC-11.3                                  |
| FR-18 | Must    | UC11   | S5.3             | AC-11.4                                          |
| FR-19 | Must    | UC12   | S4.1, S4.2       | AC-12.1…AC-12.4, AC-12.6                         |
| FR-20 | Must    | UC12   | S4.1, S4.3       | AC-14.1                                          |
| FR-21 | Must    | UC12   | S4.1, S4.3       | AC-13.3                                          |
| FR-22 | Must    | UC12   | S4.1, S4.3       | AC-13.3                                          |
| FR-23 | Must    | UC12   | S4.1, S4.3       | AC-14.3                                          |
| FR-24 | Must    | UC13   | S4.1, S4.2       | AC-13.1, AC-13.2                                 |
| FR-25 | Must    | UC13   | S4.3             | AC-13.3                                          |
| FR-26 | Must    | UC14   | S4.1, S4.3       | AC-14.1, AC-14.2                                 |
| FR-27 | Must    | UC14   | S4.1, S4.3       | AC-14.3                                          |
| FR-28 | Must    | UC12   | S4.3             | AC-12.2, AC-12.5                                 |
| FR-29 | Must    | UC15   | S5.1             | AC-15.1…AC-15.4                                  |
| FR-30 | Should  | UC15   | S5.1             | test đơn vị z-score (S5.1)                       |
| FR-31 | Should  | UC16   | S6.2             | AC-16.1, AC-16.2                                 |
| FR-32 | Must    | UC17   | S5.2             | AC-17.1, AC-17.2, AC-17.4                        |
| FR-33 | Must    | UC17   | S5.2             | AC-17.3                                          |
| FR-34 | Must    | —      | S1.2             | DoD S1.2                                         |
| FR-35 | Must    | —      | S1.4             | DoD S1.4                                         |

**Yêu cầu phi chức năng:** cột "Bước KH" và "Cách đo" ở bảng [3.2](03-dac-ta-yeu-cau.md#32-yêu-cầu-phi-chức-năng-non-functional-requirements) là ma trận truy vết cho NFR-01…NFR-14.

**Kết quả kiểm tra tự động** (script đối chiếu chéo các chương, chạy ngày 21/10/2026, xem §6):

| Kiểm tra                                                       | Kết quả  |
| -------------------------------------------------------------- | -------- |
| Mỗi FR có ≥ 1 UC (trừ tác vụ hệ thống FR-34, FR-35)            | ✅ 33/33 |
| Quan hệ FR ↔ UC khai báo **hai chiều** khớp nhau (ch.3 ↔ ch.5) | ✅       |
| Mỗi UC có ≥ 1 FR và có mặt trong sơ đồ tổng quát H9            | ✅ 17/17 |
| Mọi mã FR/NFR/BR/UC/AC được tham chiếu đều đã định nghĩa       | ✅       |
| Mỗi FR có ≥ 1 cách kiểm chứng                                  | ✅ 35/35 |
| Mỗi AC được ít nhất một FR hoặc một bước kế hoạch trỏ tới      | ✅ 61/61 |
| Tổng giờ từng ngày trong lịch = giờ của bước = 13 giờ/sprint   | ✅       |

## 4. Các xung đột đã giải quyết khi chuyển từ v1 sang v2 (21/10/2026)

Bản v1 (lịch sử git) mâu thuẫn với đề bài ở 7 điểm và có 9 chỗ không nhất quán nội bộ. Bảng dưới ghi lại cách giải quyết để trả lời khi GVHD hỏi "vì sao đổi".

### 4.1 Mâu thuẫn với đề bài

| Mã v1 | Mâu thuẫn                                                             | Quyết định v2                                                         | Ở đâu                  |
| ----- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| O-02  | Đề "CSDL **hoặc** API" nhưng v1 làm cả 3 loại nguồn                   | File + **REST API**; CSDL ngoài là hướng phát triển                   | §3.1.3, §3.1.7         |
| O-10  | Đề yêu cầu KPI **lợi nhuận**, v1 xếp Won't                            | Cột **giá vốn** trong mỗi dòng bán; KPI lợi nhuận gộp, biên lợi nhuận | BR-02, §3.5.1          |
| —     | Đề yêu cầu **tỷ lệ giữ chân khách**, v1 để Could                      | Thành KPI Must                                                        | BR-04, FR-19           |
| O-11  | Không có **vùng miền**, "chi nhánh" bị hiểu là kênh                   | Chi nhánh = cửa hàng thật, có tỉnh và vùng; kênh là chiều riêng       | `dim_branch`, BR-11    |
| O-12  | Đề yêu cầu **Star Schema**, drill-down; v1 dùng schema chuẩn hoá + MV | Kho hình sao thật; drill-down thời gian, vùng, danh mục               | ADR-0003, FR-26, FR-27 |
| O-13  | Đề yêu cầu **cảnh báo bất thường**, v1 không có                       | Quy tắc cảnh báo cấu hình được                                        | FR-29…FR-31, BR-20     |
| O-14  | Đề yêu cầu xuất **PDF/Excel**, v1 chỉ có CSV                          | Excel ở server; PDF qua trang in                                      | FR-32, FR-33           |

### 4.2 Không nhất quán nội bộ của v1

| #   | Không nhất quán                                                                                        | Cách giải quyết                                                    |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 1   | BR-06 ghi "đơn xác định bởi `external_code`" trong khi O-03 đã chốt `UNIQUE(source_id, external_code)` | BR-06 v2: đơn xác định bởi `(source_id, order_code)`               |
| 2   | Ch.1 ghi "ke-hoach.md có 2 vai trò" dù kế hoạch đã chuyển 3 vai                                        | Viết lại ch.1; vai trò mới ở ADR-0002                              |
| 3   | Ch.3 ghi "ke-hoach §5 chưa nói rõ bẫy MV" dù §2 đã nói                                                 | Bỏ MV; bẫy chỉ số không cộng được ghi ở §3.3.1                     |
| 4   | Rủi ro §8 tính tới "bắt buộc 3 loại nguồn" dù O-09 đã xác định đề chỉ cần một trong hai                | Viết lại §8                                                        |
| 5   | Định nghĩa xong S1.1 chỉ nhắc O-01…O-09, bỏ sót O-10…O-14 (hạn "trước S1.3")                           | Mọi O-xx đã có quyết định (bảng 4.1)                               |
| 6   | Code ghi mã bước cũ (B2.7, B3.3, B4.1, B5.2) và sai sprint so với kế hoạch                             | Sửa chú thích theo mã bước v2                                      |
| 7   | `.env.example` có `JWT_SECRET`, `ENCRYPTION_KEY` nhưng `env.ts` không kiểm tra                         | Bỏ `ENCRYPTION_KEY` (không mã hoá); `env.ts` kiểm tra `JWT_SECRET` |
| 8   | Hai bảng markdown vỡ do ký tự `\|` trong mã (ch.2 bước b3, ch.7 §3.3)                                  | Viết lại bảng                                                      |
| 9   | Báo cáo `docs/bao-cao/*.docx, *.pdf` là bản v1                                                         | Xoá; xuất lại từ tài liệu v2 khi nộp (S7.4)                        |

## 5. Vấn đề còn mở — cần bạn tự xử lý

| Mã   | Vấn đề                                                                          | Vì sao AI không tự giải quyết được | Việc cần làm                                                                               | Hạn          |
| ---- | ------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------ |
| O-15 | GVHD chưa xác nhận các quyết định phạm vi ở §4.1                                | Cần người hướng dẫn quyết định     | Gửi [`cau-hoi-gvhd.md`](cau-hoi-gvhd.md); ghi câu trả lời vào đây                          | S1.1 (22/10) |
| O-16 | Hiện trạng (§1.3) và tên cột thật của file POS là **giả định**                  | Không có file và người dùng thật   | (Tuỳ chọn) phỏng vấn theo [`phieu-khao-sat.md`](phieu-khao-sat.md); bổ sung từ điển §3.5.3 | Trước S3.1   |
| O-17 | "Kỳ trước" là _cùng số ngày liền trước_; có người kỳ vọng _cùng kỳ tháng trước_ | Lựa chọn trình bày                 | Hỏi GVHD (câu 7). Nếu đổi: chỉ sửa 1 hàm `previousRange()` + AC liên quan                  | Trước S4.1   |
| O-18 | Báo cáo nộp theo mẫu Word của trường                                            | Không có mẫu                       | Xuất từ markdown bằng pandoc; ảnh PNG sẵn trong `so-do/out/`                               | S7.4         |

## 6. Tự kiểm tra

### 6.1 Đối chiếu tiêu chí của bản phân tích

| Tiêu chí                   | Đáp ứng ở            | Bằng chứng                                                                                         | Đánh giá                                  |
| -------------------------- | -------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Đúng đề                    | §1 chương này        | 15/15 yêu cầu của đề có use case/sản phẩm                                                          | ✅                                        |
| Phân tích đề tài           | Ch.1                 | Bài toán, 6 mục tiêu đo được, stakeholder, 8 vấn đề có nguyên nhân gốc, so sánh giải pháp, phạm vi | ✅                                        |
| Xác định yêu cầu           | Ch.3                 | 35 FR · 14 NFR có cách đo · 21 BR · từ điển 14 trường có ví dụ đúng/sai                            | ✅                                        |
| Quy trình nghiệp vụ        | Ch.2                 | AS-IS + 4 quy trình TO-BE + máy trạng thái lần nhập                                                | ✅                                        |
| Chức năng & BFD            | Ch.4, H8             | 29 chức năng lá, MVP, phụ thuộc                                                                    | ✅                                        |
| Use case                   | Ch.5–6               | 4 tác nhân, 17 UC, phân rã 3 nhóm, ma trận quyền theo UC **và** theo API, 61 AC                    | ✅                                        |
| Mô hình dữ liệu            | `ke-hoach.md` §5, H6 | Star schema có grain, khoá, ràng buộc, index                                                       | ✅                                        |
| Mức "cơ bản, mở rộng được" | §3.1.7, ADR-0004     | Mỗi tính năng cắt bỏ có cách mở rộng không phá kiến trúc                                           | ✅                                        |
| Sát thực tế                | Ch.1–3               | Tiền dạng chữ, ngày serial Excel, đơn hủy, đơn trùng giữa nguồn, giá vốn, khách lẻ                 | ⚠️ cần O-16 để xác nhận bằng dữ liệu thật |

### 6.2 Mức độ sẵn sàng triển khai

| Hạng mục                            | Mức sẵn sàng | Còn thiếu gì                           | Làm ở đâu                    |
| ----------------------------------- | ------------ | -------------------------------------- | ---------------------------- |
| Phạm vi, chức năng, quyền           | ~100 %       | Chờ GVHD xác nhận (O-15)               | S1.1                         |
| Quy tắc nghiệp vụ & dữ liệu đầu vào | ~90 %        | Xác nhận bằng file thật (O-16)         | Trước S3.1                   |
| Thiết kế CSDL                       | ~90 %        | DDL chi tiết, ERD chính thức           | S1.3 (`docs/erd.md`)         |
| Đặc tả API                          | ~75 %        | Schema request/response đầy đủ, mã lỗi | S4.1 (`docs/api.md`)         |
| Thiết kế giao diện                  | ~50 %        | Mới có bố cục dashboard dạng ASCII     | S3.3, S4.2 (wireframe nhanh) |

> **Kết luận:** phần **phân tích** (làm _gì_, cho _ai_, theo _quy tắc nào_, _khi nào coi là xong_) đủ để bắt đầu code. Phần **thiết kế chi tiết** (DDL, API, giao diện) đã gắn vào bước tương ứng trong kế hoạch.

# Chương 7. MA TRẬN TRUY VẾT & TỰ KIỂM TRA

> Chương này chỉ truy vết **bên trong tài liệu phân tích** (đề bài → vấn đề → yêu cầu → use case → tiêu chí chấp nhận). Việc **bước nào trong kế hoạch phủ yêu cầu nào** nằm ở `ke-hoach.md`, để sửa kế hoạch không làm gãy tài liệu phân tích. Script `npm run check:docs` kiểm tra cả hai chiều.

## 1. Đề bài → use case (độ phủ "Kết quả cần đạt")

| Đề bài yêu cầu                                   | Đáp ứng bằng                                    | Use case   | Kiểm chứng                         |
| ------------------------------------------------ | ----------------------------------------------- | ---------- | ---------------------------------- |
| Thu thập từ nhiều nguồn: upload CSV/Excel        | FR-08…FR-14                                     | UC06-UC09  | AC-06.x, AC-07.x, AC-09.x          |
| … kết nối CSDL **hoặc** đồng bộ API              | Chọn **REST API** (FR-15…FR-18)                 | UC10, UC11 | AC-10.x, AC-11.x                   |
| KPI doanh thu, lợi nhuận, giá trị đơn trung bình | FR-19, BR-01…BR-03                              | UC12       | AC-12.1                            |
| KPI tỷ lệ giữ chân khách hàng                    | FR-19, BR-04                                    | UC12       | AC-12.3                            |
| Sản phẩm bán chạy theo vùng miền / thời gian     | FR-21 (theo vùng), FR-24 (lọc thời gian), FR-26 | UC12-UC14  | AC-13.3, AC-14.1                   |
| ETL (trích xuất - làm sạch/chuẩn hoá - nạp)      | FR-08…FR-11, FR-17; pipeline chung §8.2.2       | UC06, UC11 | AC-06.1…AC-06.7, AC-11.1           |
| Mô hình OLAP / Star Schema                       | `fact_sales` + 5 bảng chiều (§8.4, ADR-0003)    | -          | Migration tạo đúng §8.4            |
| Tối ưu truy vấn tổng hợp trên dữ liệu lớn        | NFR-01; đo `EXPLAIN` trước/sau                  | -          | Bảng so sánh trước/sau tối ưu      |
| Biểu đồ tương tác drill-down, cross-filtering    | FR-25, FR-26, FR-27                             | UC13, UC14 | AC-13.3, AC-14.1, AC-14.3          |
| Đăng nhập & phân quyền xem báo cáo               | FR-01…FR-06, BR-15                              | UC01-UC04  | AC-01.x, AC-04.x, AC-13.4, AC-17.2 |
| Quản lý nguồn dữ liệu & import/ETL               | FR-15, FR-08…FR-13                              | UC06-UC10  | AC-10.x                            |
| Bộ lọc đa chiều thời gian / chi nhánh / danh mục | FR-24, `dim_branch`                             | UC13       | AC-13.2                            |
| Cảnh báo chỉ số bất thường                       | FR-29…FR-31, BR-20                              | UC15, UC16 | AC-15.x, AC-16.x                   |
| Xuất báo cáo PDF/Excel                           | FR-32, FR-33                                    | UC17       | AC-17.x                            |
| Báo cáo phân tích thiết kế                       | Chương 1-8, `docs/adr/`, sơ đồ H1-H14           | -          | -                                  |

**Kết quả:** 15/15 yêu cầu của đề có use case hoặc sản phẩm tương ứng.

## 2. Vấn đề → giải pháp

| Vấn đề                             | Mục tiêu | Yêu cầu giải quyết         | Use case         | Quy tắc             |
| ---------------------------------- | -------- | -------------------------- | ---------------- | ------------------- |
| P1 Dữ liệu phân tán                | G6       | FR-08, FR-15, FR-17        | UC06, UC10, UC11 | BR-06, BR-16        |
| P2 Chuẩn hoá tay                   | G1       | FR-09, FR-10, FR-13, FR-14 | UC06-UC09        | BR-09, BR-10        |
| P3 Đơn hủy/trùng bị cộng           | G2       | FR-10, FR-11               | UC06             | BR-01, BR-06, BR-08 |
| P4 Không thấy lợi nhuận            | G4       | FR-19, FR-20, FR-22        | UC12             | BR-02               |
| P5 Không so được chi nhánh/vùng/SP | G3       | FR-21…FR-27                | UC12-UC14        | BR-19               |
| P6 Biết sụt giảm quá muộn          | G5       | FR-29…FR-31                | UC15, UC16       | BR-20               |
| P7 Không biết khách quay lại       | G4       | FR-19                      | UC12             | BR-04               |
| P8 Lộ số liệu giữa chi nhánh       | -        | FR-01…FR-06                | UC01-UC04        | BR-15, BR-17        |

**Kết quả:** 8/8 vấn đề có giải pháp; 6/6 mục tiêu có yêu cầu đo được.

## 3. Yêu cầu chức năng → use case → kiểm chứng

| FR    | Ưu tiên | UC     | Kiểm chứng bằng                                                    |
| ----- | ------- | ------ | ------------------------------------------------------------------ |
| FR-01 | Must    | UC01   | AC-01.1…AC-01.4                                                    |
| FR-02 | Must    | UC02   | AC-02.1                                                            |
| FR-03 | Must    | UC01   | AC-01.5…AC-01.7                                                    |
| FR-04 | Should  | UC03   | AC-03.1, AC-03.2                                                   |
| FR-05 | Should  | UC04   | AC-04.1…AC-04.4                                                    |
| FR-06 | Must    | tất cả | AC-06.10, AC-13.4, AC-15.4, AC-17.2, bảng §5.4.2                   |
| FR-07 | Should  | UC05   | AC-05.1, AC-05.2                                                   |
| FR-08 | Must    | UC06   | AC-06.8                                                            |
| FR-09 | Must    | UC07   | AC-07.1, AC-07.2                                                   |
| FR-10 | Must    | UC06   | AC-06.3…AC-06.6                                                    |
| FR-11 | Must    | UC06   | AC-06.1, AC-06.2, AC-06.7, AC-06.9 (hiệu năng NFR-02)              |
| FR-12 | Must    | UC06   | AC-06.1, AC-06.5                                                   |
| FR-13 | Must    | UC09   | AC-09.1, AC-09.2                                                   |
| FR-14 | Should  | UC08   | AC-08.1                                                            |
| FR-15 | Must    | UC10   | AC-10.1, AC-10.2                                                   |
| FR-16 | Should  | UC10   | AC-10.3                                                            |
| FR-17 | Must    | UC11   | AC-11.1…AC-11.3                                                    |
| FR-18 | Must    | UC11   | AC-11.4                                                            |
| FR-19 | Must    | UC12   | AC-12.1…AC-12.4, AC-12.6                                           |
| FR-20 | Must    | UC12   | AC-14.1                                                            |
| FR-21 | Must    | UC12   | AC-13.3                                                            |
| FR-22 | Must    | UC12   | AC-13.3                                                            |
| FR-23 | Must    | UC12   | AC-14.3                                                            |
| FR-24 | Must    | UC13   | AC-13.1, AC-13.2                                                   |
| FR-25 | Must    | UC13   | AC-13.3                                                            |
| FR-26 | Must    | UC14   | AC-14.1, AC-14.2                                                   |
| FR-27 | Must    | UC14   | AC-14.3                                                            |
| FR-28 | Must    | UC12   | AC-12.2, AC-12.5                                                   |
| FR-29 | Must    | UC15   | AC-15.1…AC-15.4                                                    |
| FR-30 | Should  | UC15   | AC-15.5                                                            |
| FR-31 | Should  | UC16   | AC-16.1, AC-16.2                                                   |
| FR-32 | Must    | UC17   | AC-17.1, AC-17.2, AC-17.4                                          |
| FR-33 | Must    | UC17   | AC-17.3                                                            |
| FR-34 | Must    | -      | Gọi `/api/health`: CSDL bật → 200 `db: ok`; tắt → 503 `db: down`   |
| FR-35 | Must    | -      | Chạy seed 2 lần: `count(*) fact_sales` ≈ 100.000 và giống hệt nhau |

**Yêu cầu phi chức năng:** cột "Cách đo / kiểm chứng" ở bảng [3.2](03-dac-ta-yeu-cau.md#32-yêu-cầu-phi-chức-năng-non-functional-requirements) là ma trận truy vết cho NFR-01…NFR-14.

## 4. Các xung đột đã giải quyết (21/10/2026)

Bản đầu (lịch sử git) mâu thuẫn với đề bài ở 7 điểm và có 9 chỗ không nhất quán nội bộ; lần rà soát thứ hai tìm thêm 9 chỗ lệch trong chính bản hiện tại. Bảng dưới ghi lại cách giải quyết, để trả lời khi GVHD hỏi "vì sao đổi".

### 4.1 Mâu thuẫn với đề bài

| Mã bản đầu | Mâu thuẫn                                                                  | Quyết định hiện tại                                                   | Ở đâu                  |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------- |
| O-02       | Đề "CSDL **hoặc** API" nhưng bản đầu làm cả 3 loại nguồn                   | File + **REST API**; CSDL ngoài là hướng phát triển                   | §3.1.3, §3.1.7         |
| O-10       | Đề yêu cầu KPI **lợi nhuận**, bản đầu xếp Won't                            | Cột **giá vốn** trong mỗi dòng bán; KPI lợi nhuận gộp, biên lợi nhuận | BR-02, §3.5.1          |
| -          | Đề yêu cầu **tỷ lệ giữ chân khách**, bản đầu để Could                      | Thành KPI Must                                                        | BR-04, FR-19           |
| O-11       | Không có **vùng miền**, "chi nhánh" bị hiểu là kênh                        | Chi nhánh = cửa hàng thật, có tỉnh và vùng; kênh là chiều riêng       | `dim_branch`, BR-11    |
| O-12       | Đề yêu cầu **Star Schema**, drill-down; bản đầu dùng schema chuẩn hoá + MV | Kho hình sao thật; drill-down thời gian, vùng, danh mục               | ADR-0003, FR-26, FR-27 |
| O-13       | Đề yêu cầu **cảnh báo bất thường**, bản đầu không có                       | Quy tắc cảnh báo cấu hình được                                        | FR-29…FR-31, BR-20     |
| O-14       | Đề yêu cầu xuất **PDF/Excel**, bản đầu chỉ có CSV                          | Excel ở server; PDF qua trang in                                      | FR-32, FR-33           |

### 4.2 Không nhất quán nội bộ của bản đầu

| #   | Không nhất quán                                                                                        | Cách giải quyết                                            |
| --- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1   | BR-06 ghi "đơn xác định bởi `external_code`" trong khi O-03 đã chốt `UNIQUE(source_id, external_code)` | BR-06 hiện tại: đơn xác định bởi `(source_id, order_code)` |
| 2   | Ch.1 ghi "kế hoạch có 2 vai trò" dù kế hoạch đã chuyển 3 vai                                           | Viết lại ch.1; vai trò mới ở ADR-0002                      |
| 3   | Ch.3 ghi "kế hoạch chưa nói rõ bẫy MV" dù kế hoạch đã nói                                              | Bỏ MV; bẫy chỉ số không cộng được ghi ở §3.3.1             |
| 4   | Rủi ro trong kế hoạch tính tới "bắt buộc 3 loại nguồn" dù đề chỉ cần một trong hai                     | Kế hoạch mới sinh lại từ phân tích                         |
| 5   | Định nghĩa "xong" của bước hoàn thiện phân tích chỉ nhắc O-01…O-09, bỏ sót O-10…O-14                   | Mọi O-xx đã có quyết định (bảng 4.1)                       |
| 6   | Code ghi mã bước cũ (B2.7, B3.3, B4.1, B5.2) và sai sprint                                             | Sửa chú thích theo kế hoạch mới                            |
| 7   | `.env.example` có `JWT_SECRET`, `ENCRYPTION_KEY` nhưng `env.ts` không kiểm tra                         | Bỏ `ENCRYPTION_KEY`; `env.ts` kiểm tra `JWT_SECRET`        |
| 8   | Hai bảng markdown vỡ cột do ký tự `\|` trong mã                                                        | Viết lại bảng; script kiểm tra số cột mọi bảng             |
| 9   | Báo cáo `docs/bao-cao/*.docx, *.pdf` là bản đầu                                                        | Xoá; xuất lại từ tài liệu hiện tại khi nộp                 |

### 4.3 Lệch tìm thấy ở lần rà soát thứ hai (bản hiện tại)

| #   | Lệch                                                                                                  | Cách giải quyết                                                                   |
| --- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | Kế hoạch ghi kết quả hỏi GVHD vào "07 §4" trong khi vấn đề mở nằm ở §5                                | Kế hoạch mới trỏ đúng O-15                                                        |
| 2   | Kế hoạch ghi "xác nhận 7 quyết định", danh sách câu hỏi có 8 câu                                      | Kế hoạch mới không đếm lại, chỉ trỏ O-15                                          |
| 3   | Bộ lọc mặc định: BR-18 "30 ngày tính đến ngày có dữ liệu mới nhất", ch.2 chỉ ghi "30 ngày gần nhất"   | Ch.2 dùng đúng câu chữ BR-18                                                      |
| 4   | Bố cục dashboard minh hoạ breadcrumb khác AC-14.1                                                     | Bố cục dùng đúng ví dụ AC-14.1                                                    |
| 5   | Trạng thái lần nhập ghi "đã lấy được khoá" cho cả file, nhưng chỉ đồng bộ API dùng khoá               | Tách điều kiện file / API                                                         |
| 6   | Cách mở rộng "hủy lần nhập" ghi khác nhau ở §3.1.7 và ADR-0004; ADR-0004 nhắc 2 mục không có ở §3.1.7 | §3.1.7 là nguồn duy nhất cho cách mở rộng (thêm 2 mục); ADR-0004 chỉ trỏ tới      |
| 7   | Tài liệu phân tích trỏ vào mã bước kế hoạch ở > 60 chỗ → bỏ/đổi kế hoạch là gãy truy vết              | Bỏ mọi tham chiếu tới bước kế hoạch khỏi phân tích; chỉ kế hoạch trỏ tới UC/FR/AC |
| 8   | Kiến trúc, công nghệ, mô hình dữ liệu nằm trong kế hoạch, lặp một phần ở ch.3                         | Chuyển về một nơi: chương 8                                                       |
| 9   | FR-30, FR-34, FR-35 chưa có cách kiểm chứng cụ thể (chỉ trỏ "DoD" của kế hoạch)                       | Thêm AC-15.5; ghi cách kiểm chứng FR-34, FR-35 ngay trong bảng §3                 |

## 5. Vấn đề còn mở - cần bạn tự xử lý

| Mã   | Vấn đề                                                                          | Vì sao AI không tự giải quyết được | Việc cần làm                                                                               | Hạn                      |
| ---- | ------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ |
| O-15 | GVHD chưa xác nhận các quyết định phạm vi ở §4.1                                | Cần người hướng dẫn quyết định     | Gửi bản câu hỏi cho GVHD (file Word, **không** lưu trong repo); ghi câu trả lời vào đây    | 22/10/2026               |
| O-16 | Hiện trạng (§1.3) và tên cột thật của file POS là **giả định**                  | Không có file và người dùng thật   | (Tuỳ chọn) phỏng vấn theo [`phieu-khao-sat.md`](phieu-khao-sat.md); bổ sung từ điển §3.5.3 | Trước khi code nhập file |
| O-17 | "Kỳ trước" là _cùng số ngày liền trước_; có người kỳ vọng _cùng kỳ tháng trước_ | Lựa chọn trình bày                 | Hỏi GVHD (nằm trong bản câu hỏi O-15). Nếu đổi: sửa BR-05 trước, rồi các AC liên quan      | Trước khi code KPI       |
| O-18 | Báo cáo nộp theo mẫu Word của trường                                            | Không có mẫu                       | Xuất từ markdown bằng pandoc; ảnh PNG sẵn trong `so-do/out/`                               | Khi nộp                  |

## 6. Tự kiểm tra

### 6.1 Kiểm tra tự động

Chạy `npm run check:docs` (tự chạy trước mỗi commit qua git hook). Script kiểm tra:

| Kiểm tra                                                                           | Bắt được loại lỗi                          |
| ---------------------------------------------------------------------------------- | ------------------------------------------ |
| Mọi mã FR/NFR/BR/UC/AC được tham chiếu đều đã định nghĩa (kể cả dạng khoảng `X…Y`) | Tham chiếu treo sau khi xoá/đổi số         |
| FR ↔ UC khai báo hai chiều khớp nhau (ch.3 ↔ ch.5); bảng §3 chương này khớp ch.3   | Sửa một bên quên bên kia                   |
| Mọi AC được ít nhất một FR trỏ tới                                                 | Tiêu chí chấp nhận "mồ côi"                |
| Các con số "Thống kê" khớp số dòng thật (FR, AC, UC, chức năng lá)                 | Đếm sai sau khi thêm/bớt                   |
| Kế hoạch phủ đủ mọi FR và AC; giờ các bước cộng đúng tổng sprint và tổng kế hoạch  | Kế hoạch bỏ sót yêu cầu, sai ngân sách giờ |
| Tài liệu phân tích và ADR không trỏ vào mã bước kế hoạch                           | Ràng buộc ngược phân tích → kế hoạch       |
| Bảng markdown đủ cột; link nội bộ và anchor tồn tại; mỗi `.puml` có ảnh PNG/SVG    | Bảng vỡ, link chết, sơ đồ chưa xuất lại    |
| Không có file ngoài phạm vi repo (tài liệu ôn tập, câu hỏi GVHD)                   | Đưa nhầm tài liệu cá nhân vào repo         |

Script **không** hiểu nghĩa câu chữ. Những thông tin vẫn phải đối chiếu bằng mắt mỗi khi sửa được liệt kê trong `CLAUDE.md` ở gốc repo.

### 6.2 Đối chiếu tiêu chí của bản phân tích

| Tiêu chí                    | Đáp ứng ở          | Bằng chứng                                                                                         | Đánh giá                                                |
| --------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Đúng đề                     | §1 chương này      | 15/15 yêu cầu của đề có use case/sản phẩm                                                          | Chưa kiểm chứng                                         |
| Phân tích đề tài            | Ch.1               | Bài toán, 6 mục tiêu đo được, stakeholder, 8 vấn đề có nguyên nhân gốc, so sánh giải pháp, phạm vi | Chưa kiểm chứng                                         |
| Xác định yêu cầu            | Ch.3               | 35 FR · 14 NFR có cách đo · 21 BR · từ điển 14 trường có ví dụ đúng/sai                            | Chưa kiểm chứng                                         |
| Quy trình nghiệp vụ         | Ch.2               | AS-IS + 4 quy trình TO-BE + máy trạng thái lần nhập                                                | Chưa kiểm chứng                                         |
| Chức năng & BFD             | Ch.4, H8           | 29 chức năng lá, MVP, phụ thuộc                                                                    | Chưa kiểm chứng                                         |
| Use case                    | Ch.5-6             | 4 tác nhân, 17 UC, phân rã 3 nhóm, ma trận quyền theo UC **và** theo API, 62 AC                    | Chưa kiểm chứng                                         |
| Kiến trúc & mô hình dữ liệu | Ch.8, H6, H13, H14 | Phân lớp, luồng request, star schema có grain, khoá, ràng buộc, index                              | Chưa kiểm chứng                                         |
| Mức "cơ bản, mở rộng được"  | §3.1.7, §8.6       | Mỗi tính năng cắt bỏ có cách mở rộng không phá kiến trúc                                           | Chưa kiểm chứng                                         |
| Sát thực tế                 | Ch.1-3             | Tiền dạng chữ, ngày serial Excel, đơn hủy, đơn trùng giữa nguồn, giá vốn, khách lẻ                 | Chưa kiểm chứng; cần O-16 để xác nhận bằng dữ liệu thật |

### 6.3 Mức độ sẵn sàng triển khai

| Hạng mục                            | Mức sẵn sàng    | Còn thiếu gì                                    |
| ----------------------------------- | --------------- | ----------------------------------------------- |
| Phạm vi, chức năng, quyền           | Chưa kiểm chứng | Chờ GVHD xác nhận (O-15)                        |
| Quy tắc nghiệp vụ & dữ liệu đầu vào | Chưa kiểm chứng | Xác nhận bằng file thật (O-16)                  |
| Kiến trúc, mô hình dữ liệu          | Chưa kiểm chứng | DDL chi tiết trong migration                    |
| Đặc tả API                          | Chưa kiểm chứng | Schema request/response đầy đủ, mã lỗi chi tiết |
| Thiết kế giao diện                  | Chưa kiểm chứng | Mới có bố cục dashboard dạng ASCII              |

> **Kết luận (chưa kiểm chứng):** phần **phân tích và kiến trúc** đủ để bắt đầu code. Phần **thiết kế chi tiết** (DDL, đặc tả API, giao diện) làm dần trong các bước của kế hoạch.

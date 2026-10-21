# Chương 7. MA TRẬN TRUY VẾT, TÁC ĐỘNG KẾ HOẠCH & TỰ KIỂM TRA

## 1. Ma trận vấn đề → giải pháp

Mỗi vấn đề hiện trạng phải có ít nhất một yêu cầu và một use case giải quyết; ngược lại, mỗi yêu cầu Must phải giải quyết ít nhất một vấn đề hoặc là yêu cầu trực tiếp của đề.

| Vấn đề                     | Mục tiêu | Yêu cầu giải quyết                     | Use case                     | Quy tắc                     |
| -------------------------- | -------- | -------------------------------------- | ---------------------------- | --------------------------- |
| P1 Dữ liệu phân tán        | G5       | FR-10, FR-12…FR-14, FR-24…FR-28, FR-34 | UC05, UC06, UC10, UC12, UC13 | BR-13                       |
| P2 Chuẩn hoá tay           | G1       | FR-11, FR-15, FR-16, FR-21, FR-23      | UC05, UC07, UC09             | BR-09, BR-10                |
| P3 Tên SP khác nhau        | G2       | FR-15, FR-32, FR-42                    | UC05, UC18                   | BR-11                       |
| P4 Đơn hủy/trùng bị cộng   | G2       | FR-15, FR-17, FR-19                    | UC05                         | BR-01, BR-06, BR-08         |
| P5 Không tự xem được       | G3       | FR-30…FR-38, FR-40                     | UC14, UC15, UC16             | BR-22                       |
| P6 Không so sánh kỳ trước  | G4       | FR-30, FR-31                           | UC14                         | BR-04                       |
| P7 Nhập nhầm không gỡ được | G2       | FR-20, FR-22                           | UC07, UC08                   | BR-17                       |
| P8 Lộ dữ liệu khách        | —        | FR-01…FR-09, FR-29, FR-40              | UC01…UC04, UC10              | BR-20, BR-21, BR-24, NFR-18 |

**Kết quả kiểm tra:** 8/8 vấn đề có giải pháp; 5/5 mục tiêu có yêu cầu đo được.

## 2. Ma trận truy vết yêu cầu chức năng

Mỗi FR → use case → bước trong kế hoạch → bằng chứng kiểm chứng. Dùng bảng này khi **tick tiến độ**: một bước chỉ được tick khi mọi AC của các FR thuộc bước đó đã pass.

| FR    | Ưu tiên | UC         | Bước KH                  | Kiểm chứng bằng                          |
| ----- | ------- | ---------- | ------------------------ | ---------------------------------------- |
| FR-01 | Must    | UC01       | B2.2, B2.3               | AC-01.1…01.4, 01.8                       |
| FR-02 | Must    | UC02       | B2.2, B2.3               | UC02 (§6.12)                             |
| FR-03 | Must    | UC01       | B2.3                     | AC-01.5…01.7                             |
| FR-04 | Should  | UC03       | B4.8 🆕                  | AC-03.1, 03.2                            |
| FR-05 | Should  | UC04       | B4.8 🆕                  | AC-04.1                                  |
| FR-06 | Should  | UC04       | B4.8 🆕                  | AC-04.2                                  |
| FR-07 | Should  | UC04       | B4.8 🆕                  | AC-04.3…04.5                             |
| FR-08 | Should  | UC04, UC03 | B4.8 🆕                  | AC-03.3                                  |
| FR-09 | Must    | tất cả     | B2.2 (+ mọi bước có API) | AC-04.1, 05.13, 08.4, 10.4 + bảng §5.4.2 |
| FR-10 | Must    | UC05       | B2.4                     | AC-05.8                                  |
| FR-11 | Must    | UC05       | B2.4                     | AC-05.5                                  |
| FR-12 | Must    | UC06       | B2.5, B2.7               | AC-06.1, 05.12                           |
| FR-13 | Must    | UC06       | B2.5, B2.7               | AC-06.2, 06.3                            |
| FR-14 | Must    | UC06       | B2.7                     | AC-05.12                                 |
| FR-15 | Must    | UC05       | B2.5                     | AC-05.3, 05.4, 05.6, 05.7, 05.11         |
| FR-16 | Must    | UC05, UC07 | B2.5                     | AC-05.3, 07.1                            |
| FR-17 | Must    | UC05       | B2.6                     | AC-05.2, 05.9                            |
| FR-18 | Must    | UC05       | B2.6, B2.7               | AC-05.10                                 |
| FR-19 | Must    | UC05       | B2.7                     | AC-05.1, 05.2                            |
| FR-20 | Must    | UC07       | B2.7                     | AC-07.2                                  |
| FR-21 | Must    | UC07       | B2.7                     | AC-07.1, 07.3                            |
| FR-22 | Should  | UC08       | B3.7 🆕                  | AC-08.1…08.5                             |
| FR-23 | Should  | UC09       | B2.7                     | UC09 (§6.12)                             |
| FR-24 | Should  | UC10       | B4.1, B4.2               | AC-10.1, 10.3                            |
| FR-25 | Should  | UC10       | B4.4                     | AC-12.1, 12.2, 12.3                      |
| FR-26 | Should  | UC11       | B4.2                     | AC-10.3                                  |
| FR-27 | Should  | UC12       | B4.2, B4.4               | AC-12.4                                  |
| FR-28 | Should  | UC10, UC13 | B4.5                     | AC-10.5, 13.1                            |
| FR-29 | Should  | UC10       | B4.1                     | AC-10.1, 10.2                            |
| FR-30 | Must    | UC14       | B3.2, B3.3               | AC-14.1, 14.2, 14.4, 14.10               |
| FR-31 | Must    | UC14       | B3.2, B3.4               | AC-14.3, 14.6                            |
| FR-32 | Must    | UC14       | B3.2, B3.4               | AC-14.8                                  |
| FR-33 | Must    | UC14       | B3.2, B3.4               | AC-14.8                                  |
| FR-34 | Must    | UC14       | B3.2, B3.4               | AC-14.8                                  |
| FR-35 | Must    | UC15       | B3.3                     | AC-14.5                                  |
| FR-36 | Must    | UC15       | B3.5                     | AC-14.8                                  |
| FR-37 | Should  | UC15       | B3.5                     | AC-14.11                                 |
| FR-38 | Must    | UC15       | B3.3                     | AC-14.7                                  |
| FR-39 | Must    | UC14       | B3.4                     | AC-14.2, 14.9                            |
| FR-43 | Must    | UC15       | B3.5                     | AC-14.8                                  |
| FR-40 | Should  | UC16       | B4.6                     | AC-16.1, 16.2                            |
| FR-41 | Could   | UC17       | Vùng đệm                 | UC17 (§6.12)                             |
| FR-42 | Could   | UC18       | Vùng đệm                 | UC18 (§6.12)                             |
| FR-44 | Must    | —          | B1.4                     | DoD B1.4                                 |
| FR-45 | Must    | —          | B2.6                     | E6 §2.2 (thêm test vào B2.6)             |
| FR-46 | Must    | —          | B3.1                     | AC-05.1 + NFR-17                         |

**Yêu cầu phi chức năng:** cột "Bước KH" và "Cách đo" ở bảng [3.2](03-dac-ta-yeu-cau.md#32-yêu-cầu-phi-chức-năng-non-functional-requirements) đóng vai trò ma trận truy vết cho NFR-01…NFR-19.

**Kết quả kiểm tra tự động** (script đối chiếu chéo các chương, chạy ngày 2026-10-21):

| Kiểm tra                                                       | Kết quả                          |
| -------------------------------------------------------------- | -------------------------------- |
| Mỗi FR có ≥ 1 UC (trừ tác vụ nền FR-44…FR-46 thuộc F7)         | ✅ 43/43                         |
| Quan hệ FR ↔ UC khai báo **hai chiều** khớp nhau (ch.3 ↔ ch.5) | ✅ (đã sửa 1 lệch: FR-16 ↔ UC07) |
| Mỗi UC có ≥ 1 FR và xuất hiện trong sơ đồ tổng quát H9         | ✅ 18/18                         |
| Mã BR/NFR/FR được tham chiếu đều đã định nghĩa                 | ✅ 0 tham chiếu treo             |
| Mỗi FR có ≥ 1 cách kiểm chứng                                  | ✅ 46/46 (63 AC + DoD)           |
| Mỗi AC được ít nhất một FR trỏ tới                             | ✅ 63/63                         |

## 3. Tác động lên kế hoạch và mô hình dữ liệu

### 3.1 Thay đổi mô hình dữ liệu (so với `ke-hoach.md` §5) — nên đưa vào migration B1.5

```sql
-- users: 3 vai trò + quản lý vòng đời tài khoản (UC03, UC04, BR-21, BR-23)
users(
  id, email UNIQUE, full_name TEXT NOT NULL, password_hash,
  role TEXT NOT NULL CHECK (role IN ('admin','analyst','viewer')),        -- đổi: 2 → 3 giá trị
  is_active BOOLEAN NOT NULL DEFAULT true,                                -- mới
  must_change_password BOOLEAN NOT NULL DEFAULT false,                    -- mới
  password_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),                 -- mới (vô hiệu phiên cũ)
  last_login_at TIMESTAMPTZ NULL,                                         -- mới
  created_at)

-- orders: thay 1 cột import_job_id bằng 2 cột để hủy lần nhập đúng (UC08, BR-17)
orders(
  ..., created_job_id FK import_jobs NULL,                                -- đổi
       last_job_id    FK import_jobs NULL,                                -- đổi
       updated_at TIMESTAMPTZ NOT NULL DEFAULT now())                     -- mới
-- index: orders(created_job_id), orders(last_job_id), orders(customer_id)

-- import_jobs: ai/cái gì kích hoạt, tiến độ, thống kê đầy đủ, hủy
import_jobs(
  id, source_id FK NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('upload','manual','schedule')), -- mới
  created_by FK users NULL,                         -- mới (NULL = Bộ lập lịch)
  file_name TEXT NULL,                              -- mới
  status TEXT NOT NULL CHECK (status IN ('pending','running','success','partial','failed','undone')),
  total_rows, processed_rows,                       -- processed_rows mới (thanh tiến độ)
  ok_rows, error_rows, skipped_rows INT NOT NULL DEFAULT 0,  -- skipped_rows mới (BR-08)
  new_orders INT, updated_orders INT,               -- mới (FR-19)
  error_message TEXT NULL,                          -- mới (lỗi hệ thống, chỉ admin xem)
  started_at, finished_at,
  undone_at TIMESTAMPTZ NULL, undone_by FK users NULL)       -- mới

import_errors(id, import_job_id FK, row_number, column_name TEXT NULL, message, raw JSONB)  -- column_name mới

data_sources(..., name UNIQUE, is_active BOOLEAN NOT NULL DEFAULT true, created_by FK users NULL)  -- mới
```

### 3.2 Phát hiện về `mv_daily_sales` (cần ghi vào ADR khi làm B3.1)

`mv_daily_sales` gộp theo `(day, product_id, channel_id)`. **Cộng dồn** các dòng MV cho kết quả đúng với **Doanh thu** và **Số lượng bán** (cộng được), nhưng **sai** với:

- **Số đơn**: một đơn có 2 sản phẩm nằm ở 2 dòng MV → bị đếm 2 lần.
- **Số khách**: không cộng được qua nhiều ngày (một khách mua 3 ngày bị đếm 3 lần).

**Đề xuất:** API `summary` tính Số đơn, Số khách từ bảng `orders` (+ `EXISTS` sang `order_items` khi lọc danh mục), dùng index `orders(ordered_at)`; các biểu đồ doanh thu vẫn đọc MV. Với 40.000 đơn, truy vấn này dự kiến < 50 ms (kiểm chứng bằng `EXPLAIN ANALYZE` ở B1.7). Cột `order_count` của MV chỉ dùng được khi **không** cộng qua nhiều sản phẩm.

### 3.3 Bước mới và điều chỉnh ước lượng

| Bước        | Nội dung                              | Thay đổi                                                                       | Giờ                            |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------ | ------ |
| B1.5        | Migration schema                      | Thêm các cột ở 3.1                                                             | +0,5 h                         |
| B2.2        | API auth                              | 3 vai trò; đọc lại user mỗi request (BR-21)                                    | +0,5 h                         |
| B2.5        | Mapping + validate + staging          | Xử lý nền (202 + polling), `skipped_rows`, kiểm tra nhất quán theo đơn (BR-07) | +1 h                           |
| B2.7        | UI nhập 3 bước                        | File mẫu (UC09), `/api/mapping-templates`                                      | +1 h                           |
| B3.5        | Lọc chéo                              | API `catalog/channels                                                          | categories`, lọc nhiều giá trị | +0,5 h |
| **B3.7 🆕** | **Hủy lần nhập**                      | UC08: preview, undo, test 5 AC                                                 | **3 h**                        |
| **B4.8 🆕** | **Quản lý người dùng + đổi mật khẩu** | UC03, UC04: API + UI + test                                                    | **5 h**                        |
|             | **Tổng tăng thêm**                    |                                                                                | **+11,5 h**                    |

**Kiểm tra ngân sách thời gian:** 114 h + 11,5 h = **125,5 h / 10 tuần ≈ 12,6 h/tuần**, vẫn trong khoảng 10–15 h/tuần. Sprint 3: 22 → 26 h, Sprint 4: 21 → 26 h. Nếu trễ, thứ tự cắt (từ cắt trước): UC17, UC18 (Could) → B3.7 Hủy lần nhập (thay bằng hướng dẫn "sửa file rồi nhập lại") → UI của B4.8 (giữ script tạo user bằng dòng lệnh). **Không cắt** phần Must.

`ke-hoach.md` đã được cập nhật tương ứng (MoSCoW §1.2, mô hình dữ liệu §5, bước B2.2, bảng tiến độ §9) và có [ADR-0001](../adr/0001-ba-vai-tro-nguoi-dung.md) cho quyết định 3 vai trò.

## 4. Vấn đề còn mở — cần bạn tự xử lý

| Mã       | Vấn đề                                                                                                                                                 | Vì sao AI không tự giải quyết được                                   | Việc bạn cần làm                                                                                                                                                                                                      | Hạn              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **O-01** | Tên cột thật của file xuất từ Shopee, TikTok Shop, KiotViet, Sapo…                                                                                     | Không truy cập được tài khoản/file thật; mẫu xuất đổi theo phiên bản | Xin 1–2 file xuất thật (đã xoá tên/SĐT khách), đối chiếu & bổ sung từ điển §3.5.3, BR-08 (nhãn trạng thái)                                                                                                            | Trước B2.5       |
| **O-02** | Đề có **bắt buộc** cả 3 loại nguồn (file, CSDL, API) không? `ke-hoach.md` B4 ghi "theo yêu cầu đề" nhưng MoSCoW xếp CSDL/API là **Should** → mâu thuẫn | Không có văn bản đề gốc trong repo                                   | Hỏi GVHD. Nếu bắt buộc: nâng UC10–UC13 lên Must (không đổi sprint, chỉ đổi nguyên tắc "không được cắt khi trễ")                                                                                                       | Buổi báo cáo tới |
| **O-03** | Mã đơn trùng giữa các nguồn (giả định A3). Ví dụ POS và một file khác cùng có `HD0001` cho 2 đơn khác nhau → đơn sau ghi đè đơn trước                  | Là quyết định nghiệp vụ, cần bạn chọn                                | Chọn 1: **(a)** `UNIQUE(external_code)` toàn cục (hiện tại, đơn giản); **(b)** `UNIQUE(channel_id, external_code)`. Đề xuất **(b)**: an toàn hơn, chi phí ≈ 0, nhưng đổi kênh của một đơn khi nhập lại sẽ tạo đơn mới | **Trước B1.5**   |
| **O-04** | Giảm giá cấp đơn (voucher toàn đơn), phí vận chuyển                                                                                                    | Phụ thuộc file thật và cách chủ shop tính doanh thu                  | Hỏi Q7 trong phiếu khảo sát. Tạm thời: ánh xạ "Giá ưu đãi" (đã trừ khuyến mãi sản phẩm) vào `unit_price`; voucher toàn đơn bị bỏ qua → doanh thu có thể **cao hơn** tiền thực nhận. Ghi vào hạn chế                   | Trước B2.5       |
| **O-05** | "Kỳ trước" của preset tháng: hiện là _cùng số ngày liền trước_ (01–21/10 ↔ 10–30/09). Nhiều người kỳ vọng _cùng kỳ tháng trước_ (01–21/09)             | Lựa chọn trình bày, cần người dùng/GVHD xác nhận                     | Hỏi GVHD. Nếu đổi: chỉ sửa 1 hàm `previousRange()` + AC-14.4                                                                                                                                                          | Trước B3.2       |
| **O-06** | File dùng nhãn trạng thái lạ ngoài từ điển BR-08                                                                                                       | Chưa có file thật                                                    | Nếu O-01 phát hiện nhiều nhãn lạ: thêm bước "ánh xạ giá trị trạng thái" vào UC06 (~2 h)                                                                                                                               | Sau O-01         |
| **O-07** | Hiện trạng (mục 1.3) đang là **giả định**                                                                                                              | Cần người thật trả lời                                               | Phỏng vấn 1–2 người theo phiếu §1.7, lưu vào phụ lục                                                                                                                                                                  | Trong tuần này   |
| **O-08** | Báo cáo nộp theo mẫu Word của trường (font, đánh số hình/bảng, bìa)                                                                                    | Không có mẫu của trường                                              | Chuyển nội dung sang Word; ảnh PNG có sẵn trong `so-do/out/`                                                                                                                                                          | Khi nộp          |
| **O-09** | Đối chiếu với **đề bài gốc** của GVHD                                                                                                                  | Repo không chứa đề gốc; phân tích dựa trên `ke-hoach.md`             | Đọc lại đề gốc, đánh dấu yêu cầu nào chưa có trong ch.3 rồi báo lại để bổ sung                                                                                                                                        | Ngay             |

## 5. Tự kiểm tra so với yêu cầu của nhiệm vụ

### 5.1 Đối chiếu tiêu chí

| Tiêu chí của nhiệm vụ   | Đáp ứng ở              | Bằng chứng                                                                                                                                 | Đánh giá                                        |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Phân tích đề tài        | Ch.1                   | Phát biểu bài toán, 5 mục tiêu đo được, stakeholder, 8 vấn đề có nguyên nhân gốc, so sánh 4 giải pháp, phạm vi in/out, giả định, thuật ngữ | ✅                                              |
| Xác định yêu cầu        | Ch.3                   | 46 FR · 19 NFR (có cách đo) · 26 BR · từ điển 13 trường dữ liệu có ví dụ đúng/sai                                                          | ✅                                              |
| Quy trình nghiệp vụ     | Ch.2                   | AS-IS + 5 quy trình TO-BE (4 có activity swimlane) + máy trạng thái job; mỗi bước có người làm, dữ liệu, quy tắc, ngoại lệ                 | ✅                                              |
| Chức năng cốt lõi       | Ch.4                   | 32 chức năng lá, tiêu chí "cốt lõi", MVP, thứ tự phụ thuộc, gắn sprint                                                                     | ✅                                              |
| Sơ đồ chức năng         | H8                     | BFD 3 mức                                                                                                                                  | ✅                                              |
| Use case tổng quát      | Ch.5, H9, H9b, H10–H13 | 5 tác nhân, 18 UC, phân rã 4 nhóm, ma trận quyền theo UC **và** theo API                                                                   | ✅                                              |
| Cụ thể, không mơ hồ     | Toàn bộ                | Mọi ngưỡng có số (10 MB, 50.000 dòng, 8 giờ, 300 ms…); quét từ mơ hồ ("thân thiện", "tối ưu"…) và thay bằng tiêu chí đo được               | ✅                                              |
| Vào dự án làm được ngay | Ch.6, 7.2, 7.3         | 63 AC dạng Given–When–Then, danh sách endpoint + quyền, thay đổi schema, giờ công                                                          | ✅ (xem 5.3)                                    |
| Sát thực tế             | Ch.1–3                 | Đơn trạng thái trung gian, số tiền dạng "1.200.000", ngày serial Excel, CSV có BOM, mã đơn trùng, voucher                                  | ⚠️ cần O-01, O-07 để xác nhận bằng dữ liệu thật |

### 5.2 Các lỗi đã tự phát hiện và sửa trong quá trình rà soát

| #   | Lỗi phát hiện                                                                                                                   | Cách phát hiện                         | Đã sửa                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| 1   | QT-01 dùng `fork` (song song) cho "dòng hợp lệ / dòng lỗi"; đúng ra mỗi dòng chỉ đi **một** nhánh → phải là vòng lặp + rẽ nhánh | Đọc lại ngữ nghĩa UML                  | Vòng lặp `repeat` + `if`                                                  |
| 2   | Ví dụ số serial Excel cho ngày 21/10/2026 ghi 45951, đúng là **46316**                                                          | Tính lại bằng script                   | ✅                                                                        |
| 3   | Đếm số chức năng lá ghi 33 (Must 19), đúng là **32 (Must 17, Should 12, Could 3)**                                              | Script đếm bảng                        | ✅                                                                        |
| 4   | FR-16 trỏ UC07 nhưng UC07 không liệt kê FR-16                                                                                   | Script đối chiếu hai chiều             | ✅                                                                        |
| 5   | FR-37 (lọc chéo) chưa có tiêu chí chấp nhận                                                                                     | Lập ma trận 7.2                        | Thêm AC-14.11                                                             |
| 6   | Đơn trạng thái "đang giao" trong file sàn sẽ bị coi là lỗi → hàng trăm lỗi giả mỗi lần nhập                                     | Rà soát theo dữ liệu thực tế           | Thêm khái niệm **bỏ qua** (BR-08, `skipped_rows`), cập nhật BR-15, H3, H7 |
| 7   | `mv_daily_sales` không tính đúng Số đơn/Số khách khi cộng dồn                                                                   | Rà soát định nghĩa KPI với cấu trúc MV | Mục 3.2 + AC-14.10                                                        |
| 8   | Lưu mẫu ánh xạ qua `/api/sources` (admin) mâu thuẫn với quyền nhập file của analyst                                             | Đối chiếu ma trận quyền với API        | Tách `/api/mapping-templates` (§5.4.2)                                    |
| 9   | Hủy lần nhập bằng 1 cột `import_job_id` sẽ xoá nhầm đơn có từ trước                                                             | Phân tích trường hợp upsert            | 2 cột `created_job_id`/`last_job_id` (§2.5)                               |
| 10  | Sơ đồ use case tổng quát bản đầu rối (đường cắt chéo); bản thứ hai vỡ bố cục                                                    | Xem ảnh render                         | Tách sơ đồ phân cấp tác nhân H9b; dùng `[norank]` cho include/extend      |
| 11  | Từ mơ hồ "thân thiện", "tối ưu" trong FR-26, NFR-12, H4                                                                         | Quét từ khoá                           | Thay bằng tiêu chí cụ thể                                                 |

### 5.3 Mức độ sẵn sàng triển khai — đánh giá trung thực

| Hạng mục                            | Mức sẵn sàng | Còn thiếu gì                                                                  | Làm ở đâu                           |
| ----------------------------------- | ------------ | ----------------------------------------------------------------------------- | ----------------------------------- |
| Phạm vi, chức năng, quyền           | ~100 %       | —                                                                             | —                                   |
| Quy tắc nghiệp vụ & dữ liệu đầu vào | ~90 %        | Xác nhận bằng file thật (O-01, O-04, O-06)                                    | Trước B2.5                          |
| Quy trình & trạng thái              | ~100 %       | —                                                                             | —                                   |
| Tiêu chí kiểm thử                   | ~90 %        | Bảng decision table chi tiết cho import                                       | B5.2 (`docs/test-cases.md`)         |
| Thiết kế CSDL                       | ~80 %        | ERD vẽ chính thức, kiểu dữ liệu từng cột, index cuối cùng                     | B1.5 (`docs/erd.md`)                |
| Đặc tả API                          | ~75 %        | Schema request/response đầy đủ, mã lỗi                                        | B3.2 (`docs/api.md`)                |
| Thiết kế giao diện                  | ~50 %        | Chỉ có bố cục dashboard dạng ASCII; chưa có wireframe màn nhập liệu, quản trị | Có thể làm wireframe trước Sprint 2 |

> **Kết luận:** phần **phân tích** (hệ thống làm _gì_, cho _ai_, theo _quy tắc nào_, _khi nào coi là xong_) đã đủ để bắt đầu code. Các phần còn lại thuộc giai đoạn **thiết kế** (làm _thế nào_: ERD, API chi tiết, giao diện). Chúng đã được gắn vào bước tương ứng trong kế hoạch, không bị bỏ sót.

## 6. Kế hoạch hoàn thiện trong 1 tuần

| Ngày | Việc                                                            | Đầu ra                       | Liên quan              |
| ---- | --------------------------------------------------------------- | ---------------------------- | ---------------------- |
| 1    | Đọc toàn bộ ch.1–7, làm bộ câu hỏi ch.8; đánh dấu chỗ chưa hiểu | Ghi chú câu hỏi              | —                      |
| 2    | Đối chiếu đề gốc (O-09); chuẩn bị câu hỏi cho GVHD (O-02, O-05) | Danh sách câu hỏi            | O-02, O-05, O-09       |
| 3    | Phỏng vấn 1–2 người dùng theo phiếu §1.7; xin file xuất thật    | Biên bản phỏng vấn, file mẫu | O-01, O-07             |
| 4    | Cập nhật từ điển §3.5.3, BR-08, O-04 theo file thật; chốt O-03  | Ch.3 bản v1.1                | O-01, O-03, O-04, O-06 |
| 5    | Chuyển sang Word theo mẫu trường, chèn hình H1–H13              | Báo cáo Word                 | O-08                   |
| 6    | Tự trình bày thử 10 phút (BFD → UC → 1 đặc tả UC05)             | Slide/ghi chú                | Ch.8                   |
| 7    | Nộp/báo cáo GVHD; ghi nhận góp ý vào ch.7 mục 4                 | Báo cáo đã nộp               | —                      |

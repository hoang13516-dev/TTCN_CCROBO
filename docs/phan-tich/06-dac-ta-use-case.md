# Chương 6. ĐẶC TẢ USE CASE

> **Mẫu đặc tả:** Tác nhân · Mục tiêu · Tiền điều kiện · Hậu điều kiện (thành công ✓ / thất bại ✗) · Luồng chính · Luồng thay thế (A) · Ngoại lệ (E) · Quy tắc · API · **Tiêu chí chấp nhận (AC)** dạng _Cho trước – Khi – Thì_.
>
> **Mỗi AC = ít nhất 1 test case** (Supertest cho API, Testing Library hoặc thao tác tay cho UI). Một bước trong kế hoạch chỉ được coi là xong khi các AC nó trỏ tới đã pass.

Đặc tả đầy đủ cho các use case Must có luồng phức tạp (UC01, UC06+UC07, UC11, UC12+UC13+UC14, UC15, UC17); các use case còn lại đặc tả rút gọn ở [6.7](#67-đặc-tả-rút-gọn).

Dữ liệu kiểm thử chuẩn: file mẫu [§3.5.2](03-dac-ta-yeu-cau.md#352-ví-dụ-file-mẫu-mau-du-lieuxlsx-sheet-donhang--đồng-thời-là-bộ-dữ-liệu-kiểm-thử-chuẩn) và 5 chi nhánh khởi tạo ([§8.4.2](08-kien-truc-va-dinh-huong.md#842-bảng-vận-hành)).

---

## 6.1 UC01 — Đăng nhập

| Mục             | Nội dung                                                       |
| --------------- | -------------------------------------------------------------- |
| Tác nhân        | Manager, Analyst, Admin                                        |
| Tiền điều kiện  | Tài khoản tồn tại và đang hoạt động                            |
| Hậu điều kiện ✓ | Cookie `token` (httpOnly) được đặt; chuyển tới `next` hoặc `/` |
| Hậu điều kiện ✗ | Không có cookie; không lộ thông tin email có tồn tại hay không |

**Luồng chính:** 1) Nhập email, mật khẩu, bấm "Đăng nhập". 2) FE kiểm tra định dạng bằng schema `LoginInput`. 3) `POST /api/auth/login`. 4) BE tìm user theo email (không phân biệt hoa thường), `bcrypt.compare`. 5) BE ký JWT `{ sub }` hạn 8 giờ, đặt cookie, trả `{ id, email, fullName, role, branch }`. 6) FE chuyển tới `next` (chỉ nhận đường dẫn nội bộ bắt đầu bằng `/`) hoặc `/`.

**Ngoại lệ:** E1 sai email/mật khẩu → 401 "Sai email hoặc mật khẩu" (vẫn chạy bcrypt với hash giả khi email không tồn tại, để thời gian phản hồi như nhau). E2 tài khoản bị khoá → 401 "Tài khoản đã bị khoá" (chỉ báo khi mật khẩu đúng). E3 quá 10 lần/phút/IP → 429.

**Quy tắc:** BR-17 · **API:** `POST /api/auth/login`, `GET /api/auth/me`

| AC      | Cho trước                            | Khi                     | Thì                                                                   |
| ------- | ------------------------------------ | ----------------------- | --------------------------------------------------------------------- |
| AC-01.1 | user `a@x.vn` / `Matkhau1` hoạt động | đăng nhập đúng          | 200, có `Set-Cookie: token=…; HttpOnly`, body không có `passwordHash` |
| AC-01.2 | như trên                             | sai mật khẩu            | 401, thông báo chung                                                  |
| AC-01.3 | không có user `b@x.vn`               | đăng nhập `b@x.vn`      | 401, **cùng** thông báo với AC-01.2                                   |
| AC-01.4 | user bị khoá                         | đăng nhập đúng mật khẩu | 401 "Tài khoản đã bị khoá"                                            |
| AC-01.5 | đã đăng nhập                         | F5 trang `/`            | vẫn ở `/`, không về `/login`                                          |
| AC-01.6 | chưa đăng nhập (analyst)             | mở `/imports`           | chuyển `/login?next=/imports`; đăng nhập xong về `/imports`           |
| AC-01.7 | —                                    | `next=https://evil.com` | bỏ qua `next`, về `/` (chống open redirect)                           |

---

## 6.2 UC06 — Nhập dữ liệu từ file (gồm UC07 Ánh xạ cột)

| Mục             | Nội dung                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Tác nhân        | Analyst (+)                                                                                                 |
| Mục tiêu        | Đưa đơn hàng từ file vào kho, biết chính xác dòng nào lỗi và vì sao                                         |
| Tiền điều kiện  | Đăng nhập analyst+; có ít nhất một nguồn loại `file` (dòng có chi nhánh chưa khai báo sẽ bị lỗi theo BR-11) |
| Hậu điều kiện ✓ | 1 lần nhập `success`/`partial`; dòng hợp lệ đã nằm trong `fact_sales`; dòng lỗi nằm trong `import_errors`   |
| Hậu điều kiện ✗ | Lần nhập `failed`; kho **không thay đổi** (rollback)                                                        |
| Quy trình       | QT-01 (Hình H3)                                                                                             |

**Luồng chính**

| #   | Tác nhân              | Hệ thống                                                                                                                                             |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Chọn nguồn, chọn file |                                                                                                                                                      |
| 2   |                       | `POST /api/imports/preview` (multipart): kiểm tra BR-14, đọc tên cột + 10 dòng đầu, trả `{ uploadId, columns, sampleRows, suggestedMapping }`        |
| 3   |                       | **[UC07]** Bảng ánh xạ: mỗi **trường hệ thống** (14 trường §3.5.1) một hàng, dropdown chọn cột của file hoặc "Không dùng"; trường bắt buộc có dấu \* |
| 4   | Sửa ánh xạ nếu cần    | Hiển thị 10 dòng xem trước **sau chuẩn hoá** (FE dùng **cùng hàm** chuẩn hoá trong `packages/shared`), ô lỗi tô đỏ                                   |
| 5   | Bấm "Nhập dữ liệu"    | Nút chỉ bật khi đủ trường bắt buộc                                                                                                                   |
| 6   |                       | `POST /api/imports { uploadId, sourceId, mapping }` → tạo lần nhập `running` → Transform → kiểm tra nhất quán theo đơn → Load 1 transaction          |
| 7   |                       | Trả và hiển thị **Tổng / Hợp lệ / Lỗi / Đơn mới / Đơn cập nhật** + bảng lỗi + nút "Tải dòng lỗi", "Xem dashboard"                                    |

**Luồng thay thế:** A1 (bước 2) tên cột trùng nhau → tự đổi thành `Tên (2)` và cảnh báo. A2 (bước 7) có lỗi nhưng cũng có dòng hợp lệ → `partial`, dòng hợp lệ đã nạp.

**Ngoại lệ:** E1 file rỗng → 400 "File không có dữ liệu". E2 vi phạm BR-14 → 400 kèm lý do. E3 `uploadId` hết hạn (> 30 phút) → 410 "Phiên tải file đã hết hạn, hãy chọn lại file". E4 lỗi CSDL khi Load → rollback, `failed`.

**Quy tắc:** BR-06…BR-14 · **API:** `POST /api/imports/preview`, `POST /api/imports`

| AC       | Cho trước                                              | Khi                                            | Thì                                                                                                     |
| -------- | ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| AC-06.1  | kho rỗng                                               | nhập file mẫu §3.5.2                           | `success`; tổng 3, hợp lệ 3, lỗi 0, đơn mới 2; kho có 3 dòng `fact_sales`                               |
| AC-06.2  | đã nhập file mẫu                                       | nhập lại **cùng file**                         | đơn mới 0, đơn cập nhật 2; doanh thu ngày 21/10 vẫn **630.000**, số dòng `fact_sales` vẫn 3             |
| AC-06.3  | —                                                      | Đơn giá `"1.200.000"`; Số lượng `"2.5"`        | đơn giá = 1200000; dòng số lượng `2.5` lỗi "Số lượng phải là số nguyên ≥ 1"                             |
| AC-06.4  | —                                                      | dòng có Ngày đặt `21/10/2026 00:30`            | `date_key = 20261021` (không bị lùi về 20/10)                                                           |
| AC-06.5  | file 3 dòng, 1 dòng có mã chi nhánh `XX01`             | nhập                                           | `partial`; lỗi "Chi nhánh 'XX01' chưa được khai báo" ở đúng số dòng; 2 dòng còn lại đã nạp              |
| AC-06.6  | đơn DH9 có 2 dòng khác Ngày đặt                        | nhập                                           | cả 2 dòng lỗi "Đơn DH9 không nhất quán giữa các dòng ở cột: Ngày đặt"                                   |
| AC-06.7  | test giả lập lỗi CSDL khi chèn dòng thứ 500            | nhập file 1.000 dòng hợp lệ                    | `failed`; `count(*) fact_sales` không đổi so với trước khi nhập                                         |
| AC-06.8  | —                                                      | tải file `.xls`; file 6 MB; file 10.001 dòng   | 400 với thông báo tương ứng; không tạo lần nhập                                                         |
| AC-06.9  | file hợp lệ 10.000 dòng                                | nhập                                           | hoàn tất < 15 s (NFR-02)                                                                                |
| AC-06.10 | đăng nhập manager                                      | `POST /api/imports/preview`                    | 403                                                                                                     |
| AC-07.1  | file có cột `Mã chi nhánh`, `Giá vốn`, `Mã khách hàng` | xem trước                                      | gợi ý: `branch_code`, `cost_price`, `customer_code` (**không** gán `Mã khách hàng` cho `customer_name`) |
| AC-07.2  | ánh xạ thiếu `cost_price`                              | xem bảng ánh xạ; gọi thẳng `POST /api/imports` | nút "Nhập dữ liệu" bị khoá, hiện "Thiếu trường bắt buộc: Giá vốn"; API trả 400 cùng nội dung            |

---

## 6.3 UC11 — Đồng bộ dữ liệu từ REST API

| Mục             | Nội dung                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Tác nhân        | Analyst (+); tác nhân phụ: Hệ thống nguồn API                                                                   |
| Tiền điều kiện  | Nguồn loại `api` đang hoạt động, đã kiểm tra kết nối (UC10)                                                     |
| Hậu điều kiện ✓ | Đơn mới/sửa từ API nằm trong kho; `last_synced_at` = thời điểm bắt đầu lần đồng bộ; có 1 lần nhập trong lịch sử |
| Hậu điều kiện ✗ | Lần nhập `failed`; kho và `last_synced_at` **không đổi**                                                        |
| Quy trình       | QT-02 (Hình H4)                                                                                                 |

**Luồng chính:** 1) Trên trang "Nguồn dữ liệu", bấm "Đồng bộ ngay" ở một nguồn API. 2) `POST /api/sources/:id/sync`. 3) Hệ thống lấy khoá `pg_try_advisory_lock(source_id)`. 4) Ghi `startedAt`, tạo lần nhập `running` (`trigger = 'sync'`). 5) Gọi `GET {api_url}/orders?updated_since={last_synced_at}&page=1` với header `x-api-key`; lặp tới khi `next_page = null`. 6) Mỗi trang đi qua Transform/Load **chung** với UC06 (không cần ánh xạ vì API trả đúng tên trường §3.5.1). 7) Thành công → `last_synced_at = startedAt`, nhả khoá, trả kết quả như UC06 bước 7.

**Ngoại lệ:** E1 không lấy được khoá → 409 "Nguồn đang đồng bộ". E2 API trả 401 → `failed` "API key không hợp lệ". E3 mất mạng/timeout/5xx → `failed` "Không kết nối được nguồn API". Mọi ngoại lệ đều nhả khoá và giữ nguyên `last_synced_at`.

**Quy tắc:** BR-06…BR-13, BR-16 · **API:** `POST /api/sources/:id/sync`

| AC      | Cho trước                                 | Khi                        | Thì                                                           |
| ------- | ----------------------------------------- | -------------------------- | ------------------------------------------------------------- |
| AC-11.1 | mock API có 50 đơn, `last_synced_at` rỗng | đồng bộ                    | `success`, 50 đơn mới; `last_synced_at` = thời điểm bắt đầu   |
| AC-11.2 | sau AC-11.1, mock API thêm 3 đơn mới      | đồng bộ lần 2              | request gửi `updated_since`; 3 đơn mới, 0 đơn cập nhật        |
| AC-11.3 | tắt mock API giữa chừng (sau trang 1)     | đồng bộ                    | `failed`; `last_synced_at` và `count(*) fact_sales` không đổi |
| AC-11.4 | một lần đồng bộ đang chạy                 | bấm "Đồng bộ ngay" lần nữa | 409 "Nguồn đang đồng bộ"; không tạo lần nhập thứ hai          |

---

## 6.4 UC12 — Xem dashboard KPI (gồm UC13 Lọc đa chiều & lọc chéo, UC14 Drill-down)

| Mục             | Nội dung                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Tác nhân        | Manager (+)                                                                                           |
| Tiền điều kiện  | Đã đăng nhập                                                                                          |
| Hậu điều kiện ✓ | Người dùng thấy cảnh báo, 6 KPI, 5 biểu đồ đúng bộ lọc và đúng phạm vi chi nhánh; URL phản ánh bộ lọc |
| Quy trình       | QT-03 (Hình H5)                                                                                       |

**Bố cục** (≥ 1280 px; ở 375 px các khối xếp dọc, KPI lưới 2 cột):

```
┌ Bộ lọc: [30 ngày ▾] [Chi nhánh ▾] [Danh mục ▾] [Kênh ▾]   [Xoá lọc]  [Xuất Excel] [Xuất PDF] ┐
├ ⚠ Cảnh báo (UC15) ───────────────────────────────────────────────────────────────────────────┤
├ Doanh thu │ Lợi nhuận gộp │ Biên lợi nhuận │ Số đơn │ AOV │ Tỷ lệ giữ chân   (mỗi thẻ có delta) ┤
├ Xu hướng doanh thu & lợi nhuận   2026 › Tháng 10   (breadcrumb sau khi drill)        ──────────┤
├ Theo vùng (click → chi nhánh)            │ Top 10 sản phẩm   vùng: [Tất cả ▾]                 ┤
├ Theo danh mục (donut, click → sản phẩm)  │ Theo kênh (cột)                                    ┤
└ Dữ liệu đến hết ngày 21/10/2026 ─────────────────────────────────────────────────────────────┘
```

**Luồng chính (UC12):** 1) Mở `/`. 2) FE đọc bộ lọc từ URL, thiếu thì dùng mặc định (BR-18). 3) Gọi song song: `summary`, `trend`, `top-products`, `by-region`, `by-category`, `by-channel`, `alerts`. 4) Server: `requireAuth` → `applyBranchScope` → validate → SQL trên `fact_sales` JOIN `dim_*`. 5) Hiển thị; mỗi khối tự xử lý trạng thái tải/rỗng/lỗi.

**UC13 (extend):** đổi bộ lọc → URL cập nhật (`?from=&to=&branch=&category=&channel=&level=`) → mọi khối tải lại. Click một vùng/danh mục/kênh trên biểu đồ → thêm vào bộ lọc tương ứng (lọc chéo). "Xoá lọc" → về mặc định.

**UC14 (extend):** click một điểm trên xu hướng ở cấp `month` → bộ lọc thời gian = tháng đó, cấp = `day`; breadcrumb "Năm › Quý › Tháng" để quay lên. Click một vùng → biểu đồ chuyển sang các chi nhánh của vùng đó. Click một danh mục → bảng các sản phẩm của danh mục đó.

**Ngoại lệ:** E1 tham số sai (BR-18, cấp không thuộc whitelist) → 400 với thông báo; FE hiển thị lỗi và giữ bộ lọc cũ.

**Quy tắc:** BR-01…BR-05, BR-15, BR-18, BR-19, BR-21 · **API:** `GET /api/analytics/*`, `GET /api/branches`, `GET /api/catalog/*`

| AC      | Cho trước                                                   | Khi                                                  | Thì                                                                                                     |
| ------- | ----------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| AC-12.1 | kho chỉ có file mẫu §3.5.2                                  | xem 21/10/2026–21/10/2026                            | Doanh thu 630.000; Lợi nhuận 250.000; Biên 39,7 %; Số đơn 1; AOV 630.000                                |
| AC-12.2 | không có đơn trong tháng 01/2020                            | xem tháng 01/2020                                    | 200; Doanh thu 0; Biên, AOV, Tỷ lệ giữ chân hiển thị "—"; khối biểu đồ hiện "Chưa có dữ liệu…"          |
| AC-12.3 | kỳ trước khách {A, B, C}, kỳ này {A, B, D} + 1 đơn khách lẻ | xem                                                  | Tỷ lệ giữ chân **66,7 %**                                                                               |
| AC-12.4 | kỳ trước doanh thu 0, kỳ này 100.000                        | xem                                                  | delta Doanh thu hiển thị "Mới"                                                                          |
| AC-12.5 | màn hình 375 px                                             | xem                                                  | không cuộn ngang; KPI lưới 2 cột                                                                        |
| AC-12.6 | đơn A gồm 2 sản phẩm                                        | xem số đơn                                           | đếm **1**, không phải 2                                                                                 |
| AC-13.1 | —                                                           | `from=2026-10-10&to=2026-10-01`                      | 400                                                                                                     |
| AC-13.2 | đang lọc chi nhánh `HN01`, danh mục `Áo`                    | copy URL, mở ở trình duyệt khác đã đăng nhập (admin) | thấy đúng bộ lọc và đúng số liệu                                                                        |
| AC-13.3 | đang xem mọi vùng                                           | click cột "Miền Nam" trên biểu đồ theo vùng          | URL thêm bộ lọc chi nhánh Miền Nam; mọi KPI/biểu đồ chỉ còn Miền Nam; "Xoá lọc" đưa về như cũ           |
| AC-13.4 | manager của `DN01`                                          | gọi `GET /api/analytics/summary?branch=HCM01`        | 200, số liệu **của DN01** (tham số bị ghi đè); bằng đúng kết quả của admin lọc `branch=DN01`            |
| AC-14.1 | xem năm 2026, cấp `month`                                   | click điểm tháng 10                                  | cấp `day`, 31 điểm, ngày không có đơn = 0; breadcrumb "2026 › Tháng 10"; click "2026" quay về cấp tháng |
| AC-14.2 | —                                                           | `level=hour` hoặc `level=day;DROP TABLE fact_sales`  | 400 (whitelist), không lỗi SQL                                                                          |
| AC-14.3 | đang xem mọi danh mục                                       | click lát "Áo" trên donut                            | hiện bảng sản phẩm thuộc "Áo"; tổng doanh thu bảng = doanh thu lát "Áo"                                 |

---

## 6.5 UC15 — Xem cảnh báo chỉ số bất thường

| Mục             | Nội dung                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| Tác nhân        | Manager (+) — luôn được gọi khi xem dashboard (UC12 include UC15)                          |
| Hậu điều kiện ✓ | Danh sách cảnh báo khớp đúng bộ lọc và phạm vi chi nhánh; không có cảnh báo → khối được ẩn |

**Luồng chính:** 1) FE gọi `GET /api/alerts?<bộ lọc>`. 2) Server áp phạm vi chi nhánh, đọc các quy tắc đang bật. 3) Với quy tắc `drop_vs_previous`/`below_threshold`: dùng lại kết quả tính KPI kỳ này + kỳ trước (cùng hàm với `summary`). 4) Với quy tắc `daily_zscore`: tính z-score cho từng ngày trong khoảng lọc. 5) Trả danh sách `{ ruleCode, severity, metric, value, previous?, threshold, message }`, sắp `critical` trước. 6) FE hiển thị, ví dụ: 🔴 "Biên lợi nhuận 12,4 % thấp hơn ngưỡng 15 %"; 🟡 "Doanh thu giảm 25,0 % so với kỳ trước (ngưỡng 20 %)"; 🟡 "Ngày 14/10/2026 doanh thu bất thường (z = −2,6)".

**Quy tắc:** BR-05, BR-15, BR-20 · **API:** `GET /api/alerts`

| AC      | Cho trước                                                                                           | Khi                                     | Thì                                                                                |
| ------- | --------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------- |
| AC-15.1 | R1 bật (ngưỡng 20 %); doanh thu kỳ trước 1.000.000                                                  | kỳ này 750.000 (−25 %)                  | có cảnh báo R1 mức warning; kỳ này 850.000 (−15 %) → **không** có R1               |
| AC-15.2 | R3 bật (ngưỡng 15 %)                                                                                | biên lợi nhuận kỳ này 10 %              | có cảnh báo R3 mức critical, đứng đầu danh sách                                    |
| AC-15.3 | R1 bị tắt                                                                                           | doanh thu giảm 50 %                     | không có cảnh báo R1                                                               |
| AC-15.4 | chỉ chi nhánh HCM01 sụt giảm; manager của HN01                                                      | xem dashboard                           | không thấy cảnh báo sụt giảm của HCM01                                             |
| AC-15.5 | R5 bật (`k = 2`); 28 ngày trước ngày 14/10 doanh thu trung bình 10.000.000, độ lệch chuẩn 1.000.000 | ngày 14/10 doanh thu 6.000.000 (z = −4) | có cảnh báo R5 "Ngày 14/10/2026 doanh thu bất thường"; ngày có z = −1,5 → không có |

---

## 6.6 UC17 — Xuất báo cáo Excel/PDF

| Mục             | Nội dung                                                                             |
| --------------- | ------------------------------------------------------------------------------------ |
| Tác nhân        | Manager (+)                                                                          |
| Tiền điều kiện  | Đang xem dashboard với một bộ lọc                                                    |
| Hậu điều kiện ✓ | Người dùng có file `.xlsx` hoặc `.pdf` mà số liệu **khớp** dashboard với cùng bộ lọc |

**Luồng chính — Excel:** 1) Bấm "Xuất Excel". 2) `GET /api/reports/excel?<bộ lọc>` (đã áp phạm vi chi nhánh). 3) Server gọi lại các hàm phân tích, ghi 5 sheet bằng exceljs (tiền định dạng `#,##0`), trả file `bao-cao_<from>_<to>.xlsx`.

**Luồng chính — PDF:** 1) Bấm "Xuất PDF" → mở `/report?<bộ lọc>` (trang báo cáo bố cục A4, không có thanh điều hướng). 2) Trang tải dữ liệu từ cùng các API, hiện tiêu đề, bộ lọc đang áp dụng, thời điểm xuất, cảnh báo, KPI, biểu đồ, bảng top sản phẩm. 3) Khi tải xong, gọi `window.print()`; người dùng chọn "Lưu thành PDF".

**Quy tắc:** BR-15, BR-21; dữ liệu xuất **chỉ** là số liệu tổng hợp, không có tên/mã khách.

| AC      | Cho trước            | Khi                       | Thì                                                                                       |
| ------- | -------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| AC-17.1 | bộ lọc tháng 10/2026 | xuất Excel, mở bằng Excel | 5 sheet, tiếng Việt đúng; tổng doanh thu sheet "Tổng quan" = KPI Doanh thu trên dashboard |
| AC-17.2 | manager của DN01     | xuất Excel                | mọi sheet chỉ có số liệu DN01                                                             |
| AC-17.3 | —                    | xuất PDF trên Chrome      | 1–2 trang A4, không mất biểu đồ, có tiêu đề, bộ lọc, thời điểm xuất                       |
| AC-17.4 | —                    | xuất Excel                | không sheet nào chứa tên hoặc mã khách                                                    |

---

## 6.7 Đặc tả rút gọn

### UC02 — Đăng xuất

`POST /api/auth/logout` → xoá cookie → FE về `/login`.

| AC      | Cho trước    | Khi       | Thì                                     |
| ------- | ------------ | --------- | --------------------------------------- |
| AC-02.1 | đã đăng nhập | đăng xuất | cookie bị xoá; `GET /api/auth/me` → 401 |

### UC03 — Đổi mật khẩu

Nhập mật khẩu hiện tại, mật khẩu mới, nhập lại → `PATCH /api/auth/password` → kiểm tra mật khẩu hiện tại và BR-17 → cập nhật.

| AC      | Cho trước | Khi                                   | Thì                                          |
| ------- | --------- | ------------------------------------- | -------------------------------------------- |
| AC-03.1 | —         | mật khẩu hiện tại sai                 | 400 "Mật khẩu hiện tại không đúng"           |
| AC-03.2 | —         | mật khẩu mới `abcdefgh` (không có số) | 400 "Mật khẩu phải có ít nhất 1 chữ và 1 số" |

### UC04 — Quản lý người dùng

Danh sách (email, họ tên, vai trò, chi nhánh, trạng thái) → thêm / đổi vai trò, chi nhánh / khoá-mở / đặt lại mật khẩu tạm. Không có "xoá" (giữ lịch sử ai đã nhập dữ liệu).

| AC      | Cho trước                | Khi                                           | Thì                                                 |
| ------- | ------------------------ | --------------------------------------------- | --------------------------------------------------- |
| AC-04.1 | đăng nhập analyst        | `GET /api/users`                              | 403                                                 |
| AC-04.2 | admin                    | tạo user vai trò `manager` không có chi nhánh | 400 "Quản lý chi nhánh phải được gán một chi nhánh" |
| AC-04.3 | manager X đang đăng nhập | admin khoá X                                  | request kế tiếp của X → 401                         |
| AC-04.4 | chỉ có 1 admin           | admin đó tự đổi vai trò hoặc tự khoá          | 400, không thay đổi                                 |

### UC05 — Quản lý chi nhánh

Danh sách → thêm/sửa (mã, tên, tỉnh, vùng), ngừng hoạt động. Không xoá chi nhánh đã có dữ liệu.

| AC      | Cho trước    | Khi                        | Thì                     |
| ------- | ------------ | -------------------------- | ----------------------- |
| AC-05.1 | đã có `HN01` | thêm chi nhánh mã `hn01`   | 409 (mã viết hoa trùng) |
| AC-05.2 | —            | thêm chi nhánh vùng `east` | 400                     |

### UC08 — Tải file mẫu

`GET /api/imports/template` → `mau-du-lieu.xlsx` (sheet `DonHang` có tiêu đề chuẩn + 3 dòng §3.5.2; sheet `HuongDan` giải thích 14 cột).

| AC      | Cho trước | Khi                                          | Thì                            |
| ------- | --------- | -------------------------------------------- | ------------------------------ |
| AC-08.1 | kho rỗng  | tải file mẫu rồi nhập ngay, không sửa ánh xạ | `success`; kết quả như AC-06.1 |

### UC09 — Xem lịch sử & lỗi nhập

Bảng lần nhập (mới nhất trước): thời gian, nguồn, tên file, người thực hiện, trạng thái, Tổng/Hợp lệ/Lỗi/Đơn mới/Đơn cập nhật; lọc theo trạng thái; nút "Tải dòng lỗi".

| AC      | Cho trước              | Khi                         | Thì                                                           |
| ------- | ---------------------- | --------------------------- | ------------------------------------------------------------- |
| AC-09.1 | đã có 2 lần nhập       | mở "Lịch sử nhập"           | 2 dòng, đúng thống kê và người thực hiện                      |
| AC-09.2 | lần nhập có 1 dòng lỗi | tải dòng lỗi, mở bằng Excel | tiếng Việt đúng (UTF-8 BOM); có các cột gốc + cột "Lý do lỗi" |

### UC10 — Quản lý nguồn dữ liệu

Danh sách nguồn (loại, tên, trạng thái, lần đồng bộ cuối) → thêm/sửa nguồn `file` (tên) hoặc `api` (tên, URL, API key) → "Kiểm tra kết nối" cho nguồn API.

| AC      | Cho trước               | Khi                          | Thì                                                       |
| ------- | ----------------------- | ---------------------------- | --------------------------------------------------------- |
| AC-10.1 | nguồn API có key `demo` | `GET /api/sources` (admin)   | response **không** chứa chuỗi `demo`; key hiển thị `••••` |
| AC-10.2 | như trên                | sửa tên, để trống ô API key  | key trong CSDL vẫn là `demo`                              |
| AC-10.3 | —                       | kiểm tra kết nối với key sai | thông báo "API key không hợp lệ (401)"; không lộ key      |

### UC16 — Cấu hình quy tắc cảnh báo

Bảng 5 quy tắc (BR-20): bật/tắt, ngưỡng, mức → `PATCH /api/alert-rules/:id`.

| AC      | Cho trước                           | Khi                                   | Thì                   |
| ------- | ----------------------------------- | ------------------------------------- | --------------------- |
| AC-16.1 | đăng nhập analyst                   | `PATCH /api/alert-rules/1`            | 403                   |
| AC-16.2 | doanh thu giảm 15 %, R1 ngưỡng 20 % | admin đổi R1 thành 10 %, F5 dashboard | cảnh báo R1 xuất hiện |

---

**Thống kê:** 62 AC — UC01 7 · UC02 1 · UC03 2 · UC04 4 · UC05 2 · UC06 10 · UC07 2 · UC08 1 · UC09 2 · UC10 3 · UC11 4 · UC12 6 · UC13 4 · UC14 3 · UC15 5 · UC16 2 · UC17 4.

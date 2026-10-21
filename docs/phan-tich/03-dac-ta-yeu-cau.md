# Chương 3. ĐẶC TẢ YÊU CẦU

> Mức ưu tiên theo **MoSCoW** (Must / Should / Could / Won't). Phạm vi đồ án = **Must + Should**.
> Mỗi yêu cầu phải **kiểm chứng được**: câu nào không viết được test hoặc thao tác kiểm tra thì chưa phải yêu cầu.
> Chương này là **nguồn sự thật duy nhất** cho định nghĩa KPI, quy tắc nhập và từ điển dữ liệu. Các chương khác, `ke-hoach.md` và ADR chỉ tham chiếu, không định nghĩa lại.

## 3.1 Yêu cầu chức năng (Functional Requirements)

### 3.1.1 Tài khoản, phân quyền, danh mục chi nhánh

| Mã    | Yêu cầu                                                                                                                                                          | Ưu tiên | UC     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ |
| FR-01 | Đăng nhập bằng email + mật khẩu; sai thì nhận thông báo chung "Sai email hoặc mật khẩu"                                                                          | Must    | UC01   |
| FR-02 | Đăng xuất; cookie phiên bị xoá                                                                                                                                   | Must    | UC02   |
| FR-03 | Phiên 8 giờ, F5 không mất phiên; vào trang cần đăng nhập khi chưa có phiên → `/login?next=…`, đăng nhập xong quay lại đúng trang                                 | Must    | UC01   |
| FR-04 | Người dùng đổi mật khẩu của mình (phải nhập đúng mật khẩu hiện tại)                                                                                              | Should  | UC03   |
| FR-05 | Admin quản lý người dùng: xem danh sách, thêm (email, họ tên, vai trò, chi nhánh nếu là manager, mật khẩu tạm), đổi vai trò/chi nhánh, khoá/mở, đặt lại mật khẩu | Should  | UC04   |
| FR-06 | Mọi API kiểm tra quyền **ở server** theo ma trận §5.4; với manager, mọi API phân tích/cảnh báo/xuất **tự giới hạn** trong chi nhánh của người đó (BR-15)         | Must    | tất cả |
| FR-07 | Admin quản lý danh mục chi nhánh: mã, tên, tỉnh/thành, vùng (Bắc/Trung/Nam), đang hoạt động                                                                      | Should  | UC05   |

### 3.1.2 Nhập dữ liệu từ file (ETL)

| Mã    | Yêu cầu                                                                                                                                       | Ưu tiên | UC   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- |
| FR-08 | Chọn **nguồn** (vd. "POS chi nhánh", "Shopee") và tải lên file `.csv`/`.xlsx` (BR-14); xem tên cột + 10 dòng đầu                              | Must    | UC06 |
| FR-09 | Tự gợi ý ánh xạ cột theo từ điển đồng nghĩa §3.5.3; người dùng sửa bằng dropdown; chặn nhập khi thiếu trường bắt buộc và nêu tên trường thiếu | Must    | UC07 |
| FR-10 | **Transform:** chuẩn hoá và kiểm tra **từng dòng** theo từ điển §3.5 và BR-07…BR-12                                                           | Must    | UC06 |
| FR-11 | **Load:** ghi vào kho dữ liệu trong **một transaction**; nhập lại cùng file không làm thay đổi số liệu (BR-06)                                | Must    | UC06 |
| FR-12 | Màn hình kết quả: tổng dòng, hợp lệ, lỗi, **đơn mới**, **đơn cập nhật**; bảng dòng lỗi (số dòng, cột, lý do tiếng Việt)                       | Must    | UC06 |
| FR-13 | Lịch sử nhập: thời gian, nguồn/tên file, người thực hiện, trạng thái, thống kê; tải CSV dòng lỗi (UTF-8 BOM, các cột gốc + cột `Lý do lỗi`)   | Must    | UC09 |
| FR-14 | Tải file mẫu `mau-du-lieu.xlsx`: sheet `DonHang` (tiêu đề chuẩn + 3 dòng ví dụ §3.5.2) và sheet `HuongDan`                                    | Should  | UC08 |

### 3.1.3 Nguồn dữ liệu REST API

| Mã    | Yêu cầu                                                                                                                                                            | Ưu tiên | UC   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---- |
| FR-15 | Admin quản lý nguồn: loại `file` (chỉ có tên) hoặc `api` (tên, URL, API key); bật/tắt. API **không bao giờ trả** API key (hiển thị `••••`); để trống khi sửa = giữ | Must    | UC10 |
| FR-16 | "Kiểm tra kết nối" nguồn API: timeout 10 s, trả số bản ghi đọc được hoặc thông báo lỗi tiếng Việt (sai URL, sai key, hết thời gian)                                | Should  | UC10 |
| FR-17 | "Đồng bộ ngay": lấy đơn **tăng dần** từ mốc `last_synced_at`, đọc hết các trang, đi qua **cùng bước Transform/Load** với file; ghi vào lịch sử như một lần nhập    | Must    | UC11 |
| FR-18 | Một nguồn chỉ có tối đa một lần đồng bộ đang chạy; bấm khi đang chạy → 409 "Nguồn đang đồng bộ"                                                                    | Must    | UC11 |

### 3.1.4 Phân tích & trực quan hoá

| Mã    | Yêu cầu                                                                                                                                                                 | Ưu tiên | UC   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- |
| FR-19 | 6 thẻ KPI: **Doanh thu, Lợi nhuận gộp, Biên lợi nhuận, Số đơn, Giá trị đơn trung bình (AOV), Tỷ lệ giữ chân khách** (BR-01…BR-04), mỗi thẻ có delta so kỳ trước (BR-05) | Must    | UC12 |
| FR-20 | Biểu đồ xu hướng **doanh thu và lợi nhuận** theo thời gian; kỳ không có đơn = 0                                                                                         | Must    | UC12 |
| FR-21 | Top N sản phẩm bán chạy (N = 5/10/20, mặc định 10) theo doanh thu hoặc số lượng, **xem được theo từng vùng miền**                                                       | Must    | UC12 |
| FR-22 | Doanh thu và lợi nhuận theo **vùng miền**                                                                                                                               | Must    | UC12 |
| FR-23 | Doanh thu theo **danh mục** (donut, > 8 danh mục gộp "Khác") và theo **kênh bán** (cột)                                                                                 | Must    | UC12 |
| FR-24 | Bộ lọc **đa chiều**: thời gian (preset + từ–đến, BR-18), chi nhánh, danh mục, kênh (chọn nhiều); áp dụng cho toàn dashboard; trạng thái lọc nằm trên URL để chia sẻ     | Must    | UC13 |
| FR-25 | **Lọc chéo** (cross-filtering): click vùng/chi nhánh/danh mục/kênh trên một biểu đồ → thêm vào bộ lọc, mọi khối khác cập nhật; nút "Xoá lọc"                            | Must    | UC13 |
| FR-26 | **Drill-down thời gian**: năm → quý → tháng → ngày trên biểu đồ xu hướng; có breadcrumb để quay lên (BR-19)                                                             | Must    | UC14 |
| FR-27 | **Drill-down phân cấp**: vùng → chi nhánh; danh mục → sản phẩm                                                                                                          | Must    | UC14 |
| FR-28 | Mỗi khối có trạng thái đang tải / rỗng ("Chưa có dữ liệu trong khoảng này") / lỗi (nút "Thử lại"); hiển thị "Dữ liệu đến hết ngày …"                                    | Must    | UC12 |

### 3.1.5 Cảnh báo chỉ số bất thường

| Mã    | Yêu cầu                                                                                                                                                                            | Ưu tiên | UC   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- |
| FR-29 | Khi xem dashboard, hệ thống đánh giá các quy tắc cảnh báo **đang bật** trên đúng bộ lọc hiện tại và hiển thị danh sách cảnh báo (mức, chỉ số, giá trị, ngưỡng) ở đầu trang (BR-20) | Must    | UC15 |
| FR-30 | Quy tắc "ngày bất thường": doanh thu một ngày lệch quá _k_ độ lệch chuẩn so với trung bình 28 ngày trước đó (z-score)                                                              | Should  | UC15 |
| FR-31 | Admin bật/tắt và sửa ngưỡng, mức độ của từng quy tắc cảnh báo                                                                                                                      | Should  | UC16 |

### 3.1.6 Báo cáo & hệ thống

| Mã    | Yêu cầu                                                                                                                                                       | Ưu tiên | UC   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- |
| FR-32 | Xuất **Excel** (`.xlsx`) theo bộ lọc hiện tại, 5 sheet: Tổng quan (KPI + cảnh báo), Theo thời gian, Top sản phẩm, Theo vùng & chi nhánh, Theo danh mục & kênh | Must    | UC17 |
| FR-33 | Xuất **PDF**: trang "Báo cáo" bố cục A4 (tiêu đề, bộ lọc, thời điểm xuất, KPI, biểu đồ, bảng) → nút "Xuất PDF" mở hộp in của trình duyệt để lưu thành PDF     | Must    | UC17 |
| FR-34 | `GET /api/health` trả trạng thái API và CSDL (503 khi CSDL không kết nối được)                                                                                | Must    | —    |
| FR-35 | Script sinh dữ liệu demo tái lập được: 5 chi nhánh / 3 vùng, ~200 sản phẩm, ~2.000 khách, ~100.000 dòng bán hàng trong 18 tháng, có mùa vụ                    | Must    | —    |

**Thống kê:** 35 FR — Must 28 · Should 7.

### 3.1.7 Ngoài phạm vi (Won't) — ghi là hướng phát triển

| Không làm                                                 | Lý do                                            | Mở rộng sau này bằng cách                                                                                |
| --------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Kết nối trực tiếp CSDL ngoài                              | Đề cho chọn "CSDL **hoặc** API"; đã chọn API     | Thêm 1 extractor `database.ts`, dùng lại Transform/Load                                                  |
| Đồng bộ tự động theo lịch (cron)                          | Cần khoá phân tán, job nền; vượt mức cơ bản      | `node-cron` gọi đúng hàm `syncSource()` của FR-17                                                        |
| Xử lý nhập nền (job queue), file > 10.000 dòng            | Xử lý trong request đủ cho 10.000 dòng           | Đưa `runImport()` vào hàng đợi (BullMQ), API trả `202 + jobId`                                           |
| Bảng tổng hợp sẵn (materialized view / `agg_sales_daily`) | 100.000 dòng + index đã đạt NFR-01               | Thêm bảng tổng hợp theo ngày; chỉ repository đổi nguồn đọc, API giữ nguyên                               |
| Hủy một lần nhập                                          | Nhập lại file đúng đã ghi đè được (BR-06)        | Thêm cột `created_job_id` vào `fact_sales` (cột `import_job_id` hiện chỉ ghi lần nhập gần nhất của dòng) |
| Lưu mẫu ánh xạ cột                                        | Gợi ý theo từ điển đã đủ cho file mẫu chuẩn      | Bảng `mapping_templates(source_id, mapping JSONB)`                                                       |
| Mã hoá API key trong CSDL                                 | Chỉ một nguồn demo; key không bao giờ trả ra API | AES-256-GCM với khoá trong biến môi trường                                                               |
| Dự báo bằng ML, phát hiện bất thường bằng ML              | Ngoài thời lượng                                 | Thay hàm đánh giá quy tắc bằng mô hình, giữ nguyên API `/api/alerts`                                     |
| Tạo file PDF ở server (tải trực tiếp)                     | Trang in A4 của trình duyệt đã giữ được biểu đồ  | Puppeteer render cùng trang `/report`                                                                    |
| Gửi cảnh báo/báo cáo qua email                            | Cần dịch vụ gửi thư                              | Job định kỳ gọi lại API xuất báo cáo                                                                     |
| Giảm giá cấp đơn (voucher toàn đơn), phí vận chuyển       | Mô hình tính giảm giá theo **dòng**              | Thêm bảng `fact_order` cấp đơn                                                                           |
| Nhiều doanh nghiệp trên 1 bản deploy                      | Độ phức tạp cao cho 1 sinh viên                  | Thêm `tenant_id` vào mọi bảng                                                                            |

## 3.2 Yêu cầu phi chức năng (Non-functional Requirements)

| Mã     | Nhóm        | Yêu cầu                                                                                                                           | Cách đo / kiểm chứng                             |
| ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| NFR-01 | Hiệu năng   | Dashboard tải đầy đủ < **2 s**; mỗi API phân tích < **500 ms** với 100.000 dòng `fact_sales`                                      | DevTools Network (tắt cache), 5 lần lấy trung vị |
| NFR-02 | Hiệu năng   | Nhập file 10.000 dòng < **15 s**                                                                                                  | Đo thời gian request                             |
| NFR-03 | Bảo mật     | Mật khẩu hash **bcrypt** cost ≥ 10; không response nào chứa `password_hash`                                                       | Test API; xem CSDL                               |
| NFR-04 | Bảo mật     | JWT trong cookie `httpOnly; SameSite=Lax` (`Secure` ở production)                                                                 | Kiểm tra header `Set-Cookie`                     |
| NFR-05 | Bảo mật     | Phân quyền và **phạm vi chi nhánh** kiểm tra ở server; FE ẩn nút chỉ để tiện dùng                                                 | Test Supertest theo ma trận §5.4.2               |
| NFR-06 | Bảo mật     | Mọi SQL tham số hoá `$1…`; cấp độ thời gian, cột sắp xếp đi qua **whitelist**                                                     | Review code; test chuỗi `'; DROP TABLE`          |
| NFR-07 | Toàn vẹn    | Nạp dữ liệu atomic (lỗi giữa chừng → rollback toàn bộ) và idempotent                                                              | Integration test                                 |
| NFR-08 | Dễ dùng     | Giao diện tiếng Việt; lỗi nhập ghi **dòng + cột + lý do**; nhập file ≤ 3 bước                                                     | Người không học IT tự nhập được file mẫu         |
| NFR-09 | Tương thích | Dashboard ở **375 px**: không cuộn ngang, KPI lưới 2 cột; trang nhập liệu/quản trị thiết kế cho ≥ 1280 px                         | DevTools responsive                              |
| NFR-10 | Bảo trì     | TypeScript `strict`; ESLint 0 lỗi; có unit test cho chuẩn hoá, ETL, công thức KPI; coverage thư mục `etl`, `analytics` ≥ 60 %     | `npm run lint`, `npm test -- --coverage`         |
| NFR-11 | Dữ liệu     | Múi giờ nghiệp vụ `Asia/Ho_Chi_Minh`; tiền `BIGINT` VND                                                                           | Test đơn lúc 00:30 giờ VN rơi đúng ngày          |
| NFR-12 | Triển khai  | Người khác dựng lại được từ README (Postgres + migrate + seed + chạy)                                                             | Làm theo hướng dẫn trên máy khác                 |
| NFR-13 | Mở rộng     | Thêm nguồn mới = thêm 1 **extractor**; thêm chiều phân tích = thêm 1 bảng `dim_*` + 1 cột khoá ở `fact_sales`; không sửa pipeline | Review kiến trúc (ADR-0003, ADR-0004)            |
| NFR-14 | Bảo mật     | API key nguồn không xuất hiện trong response, log, thông báo lỗi                                                                  | Test API; đọc log                                |

## 3.3 Quy tắc nghiệp vụ (Business Rules)

### 3.3.1 Định nghĩa chỉ số (KPI)

Mọi KPI chỉ tính trên dòng có `status = 'completed'` và nằm trong bộ lọc hiện tại (thời gian, chi nhánh, danh mục, kênh, phạm vi chi nhánh của manager).

| Mã                             | Quy tắc                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-01** Doanh thu            | `Σ revenue` với `revenue = quantity × unit_price − discount`. Đơn `cancelled`, `returned` **không** tính.                                                                                                                                                                                                                              |
| **BR-02** Lợi nhuận            | Giá vốn `= Σ cost_amount` với `cost_amount = quantity × cost_price` (giá vốn **tại thời điểm bán**, lấy từ file). **Lợi nhuận gộp** = Doanh thu − Giá vốn. **Biên lợi nhuận** = Lợi nhuận gộp ÷ Doanh thu; Doanh thu = 0 → `null` (hiển thị "—").                                                                                      |
| **BR-03** Số đơn, AOV          | Số đơn = số cặp `(source_id, order_code)` khác nhau. AOV = Doanh thu ÷ Số đơn, làm tròn tới đồng; Số đơn = 0 → `null`.                                                                                                                                                                                                                 |
| **BR-04** Tỷ lệ giữ chân khách | `P` = tập khách (bỏ khách lẻ) có ≥ 1 đơn trong **kỳ trước**; `C` = tập khách có ≥ 1 đơn trong **kỳ này**. Tỷ lệ giữ chân = số phần tử của `P ∩ C` ÷ số phần tử của `P`; `P` rỗng → `null`. Ví dụ: kỳ trước {A, B, C}, kỳ này {A, B, D} → 2/3 = **66,7 %**. Tooltip: "Trong số khách đã mua kỳ trước, bao nhiêu % quay lại mua kỳ này". |
| **BR-05** Kỳ trước & delta     | Kỳ trước = khoảng **cùng số ngày, liền ngay trước** `from` (01/10–21/10 ↔ 10/09–30/09). Chỉ số tiền/số lượng: `delta = (này − trước) ÷ trước`, hiển thị `%`; trước = 0 và này > 0 → "Mới"; cả hai = 0 → "—". Chỉ số tỷ lệ (Biên lợi nhuận, Tỷ lệ giữ chân): `delta = này − trước`, hiển thị **điểm phần trăm** (`+2,3 đ%`).            |

> ⚠️ **Bẫy chỉ số không cộng được:** Doanh thu, Lợi nhuận **cộng được** (additive) qua mọi chiều. Số đơn, Số khách, Tỷ lệ giữ chân **không cộng được** (non-additive): một đơn 2 sản phẩm nằm ở 2 dòng `fact_sales`. Vì vậy phải dùng `COUNT(DISTINCT …)` trên đúng phạm vi lọc, không cộng kết quả của các nhóm con. Biên lợi nhuận là tỷ lệ: phải tính `Σ lợi nhuận ÷ Σ doanh thu`, **không** lấy trung bình các biên lợi nhuận con.

### 3.3.2 Quy tắc nhập dữ liệu (dùng chung cho file và API)

| Mã                                        | Quy tắc                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-06** Idempotent                      | Đơn được xác định bởi **`(source_id, order_code)`**: cùng mã đơn ở hai nguồn khác nhau là hai đơn khác nhau. Nhập một đơn đã có → **xoá toàn bộ** dòng `fact_sales` cũ của đơn đó rồi chèn dòng mới. Hệ quả: **file phải chứa đủ mọi dòng của một đơn** (ghi vào hướng dẫn sử dụng).                                                                                                                                                         |
| **BR-07** Cấu trúc dòng                   | **1 dòng = 1 sản phẩm trong 1 đơn.** Nhiều dòng cùng mã đơn = 1 đơn. Các trường **cấp đơn** (`ordered_at`, `order_status`, `branch_code`, `channel`, `customer_code`) phải giống nhau giữa các dòng của cùng đơn; mâu thuẫn → **mọi dòng** của đơn đó bị lỗi: "Đơn DH001 không nhất quán giữa các dòng ở cột: Ngày đặt".                                                                                                                     |
| **BR-08** Trạng thái                      | So khớp không phân biệt hoa thường, bỏ dấu. **completed**: _(trống)_, `completed`, `hoàn thành`, `đã giao`, `thành công`, `delivered`. **cancelled**: `cancelled`, `canceled`, `hủy`, `huỷ`, `đã hủy`. **returned**: `returned`, `trả hàng`, `hoàn hàng`, `refunded`. Giá trị khác → lỗi "Trạng thái không nhận diện: '…'".                                                                                                                  |
| **BR-09** Số tiền, số lượng               | Ô kiểu số → dùng trực tiếp, làm tròn tới đồng. Ô kiểu chữ: bỏ khoảng trắng, `₫`, `đ`, `VND`; dạng `1.200.000` hoặc `1,200,000` → 1200000. `quantity` nguyên, 1–100.000 (`2.0` hợp lệ, `2.5` lỗi). `unit_price ≥ 0`, `cost_price ≥ 0`, `0 ≤ discount ≤ quantity × unit_price`.                                                                                                                                                                |
| **BR-10** Ngày giờ                        | Chấp nhận `dd/MM/yyyy [HH:mm[:ss]]`, `yyyy-MM-dd[THH:mm[:ss]]`, ô ngày Excel, số serial Excel (20000–80000, gốc 1899-12-30). Không có múi giờ → hiểu là **giờ Việt Nam**; chuỗi ISO có múi giờ (`Z`, `+07:00`) → tôn trọng múi giờ đó. Hợp lệ khi `01/01/2000 ≤ ngày ≤ hôm nay + 1`. **Ngày nghiệp vụ** = ngày theo giờ Việt Nam → `date_key`.                                                                                               |
| **BR-11** Chi nhánh                       | `branch_code` (viết hoa, bỏ khoảng trắng) phải **có sẵn** trong danh mục chi nhánh đang hoạt động. Không tự tạo, vì chi nhánh mới cần tỉnh/vùng → lỗi "Chi nhánh 'XX01' chưa được khai báo".                                                                                                                                                                                                                                                 |
| **BR-12** Sản phẩm, danh mục, kênh, khách | **Sản phẩm** định danh bằng SKU (viết hoa, bỏ khoảng trắng đầu/cuối). SKU mới → tạo, cần tên (thiếu → lỗi dòng). SKU đã có → **không ghi đè tên** (mỗi kênh đặt tên một kiểu). **Danh mục** trống → "Chưa phân loại". **Kênh**: viết thường, bỏ dấu; bí danh `tai_quay`, `cua_hang`, `pos` → `store`; `fb` → `facebook`; chưa có → tạo. **Khách**: theo `customer_code`; trống → **khách lẻ** (`customer_key = NULL`, không tính vào BR-04). |
| **BR-13** Trạng thái lần nhập             | `success`: không lỗi hệ thống và `error_rows = 0`. `partial`: `ok_rows > 0` và `error_rows > 0` (dòng hợp lệ **vẫn được nạp**, trừ dòng thuộc đơn có lỗi theo BR-07). `failed`: lỗi hệ thống/mạng, **hoặc** `ok_rows = 0`. Luôn có `total_rows = ok_rows + error_rows`. Khi server khởi động, lần nhập còn `running` và bắt đầu cách đây > 10 phút → `failed` ("Gián đoạn do khởi động lại").                                                |
| **BR-14** Giới hạn file                   | Đuôi `.csv`/`.xlsx`; ≤ **5 MB**; ≤ **10.000 dòng dữ liệu**; ≤ 30 cột; CSV UTF-8 (có/không BOM), tự nhận dấu phân cách `,` `;`; Excel đọc **sheet đầu tiên**, dòng 1 là tiêu đề. `.xls` → "Hãy lưu lại dưới dạng .xlsx".                                                                                                                                                                                                                      |

### 3.3.3 Quy tắc phân quyền, vận hành, hiển thị

| Mã                             | Quy tắc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-15** Phạm vi chi nhánh    | Vai trò `manager` gắn đúng **một** chi nhánh (`users.branch_key NOT NULL`); `analyst`, `admin` không gắn chi nhánh và xem mọi chi nhánh. Với manager, server **ghi đè** tham số `branch` của request bằng chi nhánh của người đó trước khi truy vấn (không báo lỗi, không tin tham số từ client). Áp dụng cho phân tích, cảnh báo, xuất báo cáo.                                                                                                                                                                                                                                                                                                                                             |
| **BR-16** Đồng bộ API tăng dần | Lần đầu (`last_synced_at` rỗng) lấy toàn bộ; các lần sau gửi `updated_since = last_synced_at`. Đọc lần lượt các trang tới khi `next_page = null`. Thành công → `last_synced_at = thời điểm BẮT ĐẦU lần đồng bộ`; thất bại → giữ nguyên. Chống chạy chồng bằng `pg_try_advisory_lock(source_id)`.                                                                                                                                                                                                                                                                                                                                                                                             |
| **BR-17** Mật khẩu & phiên     | Mật khẩu 8–72 ký tự, có ít nhất 1 chữ và 1 số. JWT hết hạn 8 giờ. **Mỗi request** đọc lại user từ CSDL: bị khoá → 401; vai trò và chi nhánh lấy từ CSDL, không tin giá trị trong token. Đăng nhập tối đa 10 lần/phút/IP → 429.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **BR-18** Bộ lọc thời gian     | `from`, `to` dạng `yyyy-MM-dd`, theo ngày Việt Nam, **gồm cả hai đầu**; `from ≤ to`; khoảng ≤ 3 năm; sai → 400. Mặc định: 30 ngày gần nhất **tính đến ngày có dữ liệu mới nhất**. Preset: 7 ngày, 30 ngày, Tháng này, Tháng trước, Quý này, Năm nay, Tuỳ chọn.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **BR-19** Drill-down           | Cấp thời gian (whitelist): `year → quarter → month → day`. Mặc định theo độ dài khoảng lọc: ≤ 62 ngày → `day`; ≤ 2 năm → `month`; lớn hơn → `quarter`. Click một điểm ở cấp X → bộ lọc thời gian thu về khoảng của điểm đó, cấp chuyển xuống một bậc; breadcrumb cho phép quay lên. Phân cấp khác: `region → branch`, `category → product`.                                                                                                                                                                                                                                                                                                                                                  |
| **BR-20** Quy tắc cảnh báo     | Mỗi quy tắc gồm: chỉ số, kiểu, ngưỡng, mức (`warning`/`critical`), bật/tắt. Ba kiểu: **(a)** `drop_vs_previous`: chỉ số giảm quá ngưỡng so với kỳ trước (tiền/số lượng tính %, tỷ lệ tính điểm %); **(b)** `below_threshold`: chỉ số tỷ lệ thấp hơn ngưỡng; **(c)** `daily_zscore` (Should): ngày có trị tuyệt đối của `z` lớn hơn `k`, với `z = (DT ngày − TB 28 ngày trước) ÷ độ lệch chuẩn 28 ngày trước`. Quy tắc mặc định (seed): R1 Doanh thu giảm > 20 % (warning); R2 Lợi nhuận gộp giảm > 20 % (warning); R3 Biên lợi nhuận < 15 % (critical); R4 Tỷ lệ giữ chân giảm > 10 điểm % (warning); R5 ngày bất thường `k = 2` (warning). Kỳ trước = 0 → quy tắc kiểu (a) không kích hoạt. |
| **BR-21** Hiển thị             | Tiền `1.250.000 ₫` (`Intl.NumberFormat('vi-VN')`); tiền rút gọn trên trục biểu đồ `1,2 tr`, `3,4 tỷ`; ngày `dd/MM/yyyy`; phần trăm 1 chữ số thập phân `+12,5 %`; vùng hiển thị "Miền Bắc / Miền Trung / Miền Nam".                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 3.4 Ràng buộc thiết kế

- Stack: TypeScript · React (Vite) · Node.js/Express · PostgreSQL · SQL viết tay; chi tiết và lý do chọn: [§8.5](08-kien-truc-va-dinh-huong.md#85-công-nghệ).
- Một pipeline ETL dùng chung cho mọi nguồn: **Extract (theo nguồn) → Map → Transform/Validate → Load**. Chỉ bước Extract khác nhau giữa file và API.
- Kho dữ liệu theo **mô hình hình sao** (star schema): 1 bảng sự kiện `fact_sales` + 5 bảng chiều. Thiết kế chi tiết: [§8.4](08-kien-truc-va-dinh-huong.md#84-mô-hình-dữ-liệu) và [ADR-0003](../adr/0003-mo-hinh-hinh-sao.md).

## 3.5 Từ điển dữ liệu đầu vào (Import Row)

> Đây là **hợp đồng** giữa người dùng (file mẫu), nguồn API, schema Zod `ImportRow` (`packages/shared`) và hàm chuẩn hoá. Code phải khớp từng dòng bảng này.

### 3.5.1 Các trường

| #   | Trường (`ImportRow`) | Tên cột trong file mẫu | Cấp  | Bắt buộc                 | Kiểu sau chuẩn hoá          | Quy tắc | Ví dụ hợp lệ                     | Ví dụ lỗi → thông báo                            |
| --- | -------------------- | ---------------------- | ---- | ------------------------ | --------------------------- | ------- | -------------------------------- | ------------------------------------------------ |
| 1   | `order_code`         | Mã đơn                 | Đơn  | ✅                       | text 1–50                   | Trim    | `DH000123`                       | _(trống)_ → "Thiếu Mã đơn"                       |
| 2   | `ordered_at`         | Ngày đặt               | Đơn  | ✅                       | timestamptz                 | BR-10   | `21/10/2026 14:30`, `2026-10-21` | `32/10/2026` → "Ngày không hợp lệ"               |
| 3   | `order_status`       | Trạng thái             | Đơn  | — (mặc định `completed`) | enum                        | BR-08   | `Hoàn thành`, `Đã hủy`           | `Lạ` → "Trạng thái không nhận diện: 'Lạ'"        |
| 4   | `branch_code`        | Mã chi nhánh           | Đơn  | ✅                       | → `dim_branch.code`         | BR-11   | `HN01`                           | `XX01` → "Chi nhánh 'XX01' chưa được khai báo"   |
| 5   | `channel`            | Kênh bán               | Đơn  | ✅                       | → `dim_channel.code`        | BR-12   | `Tại quầy`, `Shopee`             | _(trống)_ → "Thiếu Kênh bán"                     |
| 6   | `customer_code`      | Mã khách               | Đơn  | —                        | text ≤ 50 / null            | BR-12   | `KH001`                          | —                                                |
| 7   | `customer_name`      | Tên khách              | —    | —                        | text ≤ 150 / null           | Trim    | `Nguyễn Văn A`                   | —                                                |
| 8   | `product_sku`        | SKU                    | Dòng | ✅                       | text ≤ 64, viết hoa         | BR-12   | `AO-01`                          | _(trống)_ → "Thiếu SKU"                          |
| 9   | `product_name`       | Tên sản phẩm           | Dòng | — (bắt buộc với SKU mới) | text ≤ 255                  | BR-12   | `Áo thun trắng M`                | SKU mới, tên trống → "SKU mới cần Tên sản phẩm"  |
| 10  | `category`           | Danh mục               | Dòng | —                        | text ≤ 100                  | BR-12   | `Áo`                             | —                                                |
| 11  | `quantity`           | Số lượng               | Dòng | ✅                       | int 1–100.000               | BR-09   | `2`, `2.0`                       | `0`, `2.5` → "Số lượng phải là số nguyên ≥ 1"    |
| 12  | `unit_price`         | Đơn giá                | Dòng | ✅                       | bigint ≥ 0                  | BR-09   | `150000`, `150.000 ₫`            | `-5`, `abc` → "Đơn giá không hợp lệ"             |
| 13  | `discount`           | Giảm giá               | Dòng | — (mặc định 0)           | bigint ≥ 0                  | BR-09   | `10.000`                         | `> SL × đơn giá` → "Giảm giá lớn hơn thành tiền" |
| 14  | `cost_price`         | Giá vốn                | Dòng | ✅                       | bigint ≥ 0 (giá vốn/đơn vị) | BR-09   | `90.000`                         | _(trống)_ → "Thiếu Giá vốn"                      |

**Nguồn API** trả JSON với **đúng các tên trường ở cột 2** (`order_code`, `ordered_at`…), mỗi phần tử là một dòng; vì vậy không cần bước ánh xạ (UC07 chỉ dùng cho file).

### 3.5.2 Ví dụ file mẫu (`mau-du-lieu.xlsx`, sheet `DonHang`) — đồng thời là bộ dữ liệu kiểm thử chuẩn

| Mã đơn | Ngày đặt         | Trạng thái | Mã chi nhánh | Kênh bán | Mã khách | Tên khách    | SKU   | Tên sản phẩm      | Danh mục | Số lượng | Đơn giá | Giảm giá | Giá vốn |
| ------ | ---------------- | ---------- | ------------ | -------- | -------- | ------------ | ----- | ----------------- | -------- | -------- | ------- | -------- | ------- |
| DH0001 | 21/10/2026 09:15 | Hoàn thành | HN01         | Tại quầy | KH001    | Nguyễn Văn A | AO-01 | Áo thun trắng M   | Áo       | 2        | 150.000 | 0        | 90.000  |
| DH0001 | 21/10/2026 09:15 | Hoàn thành | HN01         | Tại quầy | KH001    | Nguyễn Văn A | QJ-02 | Quần jean xanh 30 | Quần     | 1        | 350.000 | 20.000   | 200.000 |
| DH0002 | 21/10/2026 20:40 | Đã hủy     | HCM01        | Shopee   |          |              | AO-01 | Áo thun trắng M   | Áo       | 1        | 145.000 | 0        | 90.000  |

→ **Kết quả kỳ vọng** khi xem ngày 21/10/2026 (dùng làm test case AC-06.1, AC-12.1):

| Chỉ số         | Tính                                          | Kết quả                          |
| -------------- | --------------------------------------------- | -------------------------------- |
| Doanh thu      | 2×150.000 + (350.000 − 20.000); DH0002 bị hủy | **630.000 ₫**                    |
| Giá vốn        | 2×90.000 + 1×200.000                          | 380.000 ₫                        |
| Lợi nhuận gộp  | 630.000 − 380.000                             | **250.000 ₫**                    |
| Biên lợi nhuận | 250.000 ÷ 630.000                             | **39,7 %**                       |
| Số đơn / AOV   | chỉ DH0001                                    | **1** / 630.000 ₫                |
| Theo vùng      | HN01 thuộc Miền Bắc                           | Miền Bắc 630.000 ₫, Miền Nam 0 ₫ |

### 3.5.3 Từ điển đồng nghĩa để gợi ý ánh xạ (FR-09)

So khớp sau khi: viết thường, bỏ dấu tiếng Việt, bỏ ký tự không phải chữ/số. Khớp **chính xác** trước, rồi mới đến **chứa**.

| Trường          | Tên cột thường gặp                                                 |
| --------------- | ------------------------------------------------------------------ |
| `order_code`    | ma don, ma don hang, so hoa don, ma hoa don, order id, order code  |
| `ordered_at`    | ngay dat, ngay, ngay dat hang, thoi gian, ngay ban, order date     |
| `order_status`  | trang thai, trang thai don hang, status                            |
| `branch_code`   | ma chi nhanh, chi nhanh, ma cua hang, cua hang, branch, store code |
| `channel`       | kenh ban, kenh, nguon don, channel                                 |
| `customer_code` | ma khach, ma khach hang, customer id                               |
| `customer_name` | ten khach, ten khach hang, khach hang, customer name               |
| `product_sku`   | sku, ma sp, ma san pham, ma hang                                   |
| `product_name`  | ten san pham, ten sp, ten hang, san pham, product name             |
| `category`      | danh muc, nhom hang, loai hang, category                           |
| `quantity`      | so luong, sl, qty, quantity                                        |
| `unit_price`    | don gia, gia ban, gia, unit price, price                           |
| `discount`      | giam gia, chiet khau, discount                                     |
| `cost_price`    | gia von, gia nhap, cost, cost price                                |

> **Vì sao khớp chính xác trước?** Cột `Mã khách hàng` **chứa** cụm `khach hang` (đồng nghĩa của `customer_name`). Nếu xét "chứa" trước, cột này bị gán nhầm thành Tên khách. Khớp chính xác trước sẽ gán đúng `customer_code` (AC-07.1). Mỗi cột file chỉ được gán cho tối đa một trường.

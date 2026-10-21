# Chương 3. ĐẶC TẢ YÊU CẦU

> Mức ưu tiên theo **MoSCoW** (Must / Should / Could / Won't), giữ nguyên từ `ke-hoach.md` §1.2 và bổ sung các mục đánh dấu 🆕.
> Mỗi yêu cầu phải **kiểm chứng được**: nếu một câu không viết được test hoặc thao tác kiểm tra thì chưa phải yêu cầu, mà mới là mong muốn.

## 3.1 Yêu cầu chức năng (Functional Requirements)

### 3.1.1 Tài khoản & phân quyền

| Mã       | Yêu cầu                                                                                                                                   | Ưu tiên | UC         | Giải quyết |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | ---------- |
| FR-01    | Người dùng đăng nhập bằng email + mật khẩu; sai thì nhận thông báo chung "Sai email hoặc mật khẩu"                                        | Must    | UC01       | P8         |
| FR-02    | Người dùng đăng xuất; cookie phiên bị xoá                                                                                                 | Must    | UC02       | P8         |
| FR-03    | Phiên duy trì 8 giờ, F5 không mất phiên; truy cập trang cần đăng nhập thì chuyển `/login?next=…` và quay lại đúng trang sau khi đăng nhập | Must    | UC01       | —          |
| FR-04 🆕 | Người dùng đổi mật khẩu của mình (phải nhập đúng mật khẩu hiện tại)                                                                       | Should  | UC03       | P8         |
| FR-05 🆕 | Admin xem danh sách người dùng: email, họ tên, vai trò, trạng thái, lần đăng nhập cuối                                                    | Should  | UC04       | P8         |
| FR-06 🆕 | Admin thêm người dùng: email (duy nhất), họ tên, vai trò, mật khẩu tạm                                                                    | Should  | UC04       | P8         |
| FR-07 🆕 | Admin đổi vai trò, khoá/mở khoá tài khoản (không xoá cứng)                                                                                | Should  | UC04       | P8         |
| FR-08 🆕 | Admin đặt lại mật khẩu; người dùng có mật khẩu tạm (tạo mới/đặt lại) **bắt buộc đổi** ở lần đăng nhập kế tiếp                             | Should  | UC04, UC03 | P8         |
| FR-09    | Mọi API kiểm tra quyền **ở server** theo ma trận §5.4; FE ẩn nút không có quyền (chỉ để tiện dùng, không phải lớp bảo vệ)                 | Must    | tất cả     | P8         |

### 3.1.2 Nhập dữ liệu từ file

| Mã       | Yêu cầu                                                                                                                                                    | Ưu tiên | UC         | Giải quyết |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | ---------- |
| FR-10    | Tải lên file `.csv`/`.xlsx` (BR-16) và xem trước tên cột + 20 dòng đầu                                                                                     | Must    | UC05       | P1         |
| FR-11    | CSV: UTF-8 có/không BOM; tự nhận dấu phân cách `,` `;` tab. Excel: đọc sheet đầu tiên, dòng 1 là tiêu đề                                                   | Must    | UC05       | P2         |
| FR-12    | Gợi ý ánh xạ cột: (1) mẫu ánh xạ đã lưu có **cùng tập tên cột** → áp dụng; (2) nếu không, đoán theo từ điển đồng nghĩa §3.5.3                              | Must    | UC06       | P1, P2     |
| FR-13    | Ánh xạ mỗi trường hệ thống tới **một cột** của file **hoặc** một **giá trị cố định**; chọn định dạng ngày (Tự động / dd/MM/yyyy / MM/dd/yyyy / yyyy-MM-dd) | Must    | UC06       | P1         |
| FR-14    | Lưu mẫu ánh xạ có tên (vd. "Shopee – xuất đơn"), dùng lại, sửa, xoá                                                                                        | Must    | UC06       | P1         |
| FR-15    | Chuẩn hoá và kiểm tra **từng dòng** theo từ điển dữ liệu §3.5 và quy tắc BR-07…BR-14                                                                       | Must    | UC05       | P2, P3, P4 |
| FR-16    | Ghi mỗi dòng lỗi: số dòng (theo file, tính cả dòng tiêu đề), tên cột, lý do bằng tiếng Việt, dữ liệu gốc                                                   | Must    | UC05, UC07 | P2         |
| FR-17    | Nạp dữ liệu vào bảng chính trong **một transaction**; nhập lại cùng dữ liệu không làm thay đổi tổng doanh thu (BR-06)                                      | Must    | UC05       | P4         |
| FR-18 🆕 | Xử lý **nền**: API trả `202 + jobId` ngay; giao diện hiển thị trạng thái/tiến độ (số dòng đã xử lý), cập nhật mỗi 1 giây                                   | Must    | UC05       | NFR-03     |
| FR-19    | Màn hình kết quả: tổng dòng, hợp lệ, lỗi, bỏ qua, **số đơn mới**, **số đơn cập nhật**                                                                      | Must    | UC05       | P4         |
| FR-20    | Lịch sử nhập: thời gian, nguồn/tên file, người thực hiện (hoặc "Lịch tự động"), trạng thái, thống kê; lọc theo trạng thái                                  | Must    | UC07       | P7         |
| FR-21    | Tải danh sách dòng lỗi dạng CSV (UTF-8 BOM): các cột gốc + cột `Lý do lỗi` để sửa và nhập lại                                                              | Must    | UC07       | P2         |
| FR-22 🆕 | Hủy một lần nhập, có xem trước số đơn sẽ xoá / giữ lại (BR-17)                                                                                             | Should  | UC08       | P7         |
| FR-23 🆕 | Tải file mẫu `mau-du-lieu.xlsx`: sheet `DonHang` (tiêu đề chuẩn + 3 dòng ví dụ), sheet `HuongDan` (giải thích từng cột)                                    | Should  | UC09       | P2         |

### 3.1.3 Nguồn dữ liệu kết nối

| Mã    | Yêu cầu                                                                                                                                                                                                  | Ưu tiên | UC         | Giải quyết |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------- | ---------- |
| FR-24 | Admin khai báo nguồn **CSDL**: loại (PostgreSQL bắt buộc; MySQL nếu kịp), host, port, database, user, password, SSL, câu `SELECT`, cột mốc thời gian (tuỳ chọn, cho đồng bộ tăng dần)                    | Should  | UC10       | P1         |
| FR-25 | Admin khai báo nguồn **REST API**: base URL, header xác thực (tên + giá trị), đường dẫn tới mảng dữ liệu (vd. `data`), kiểu phân trang (`page` / không), tên tham số mốc thời gian (vd. `updated_since`) | Should  | UC10       | P1         |
| FR-26 | "Kiểm tra kết nối" trước khi lưu: timeout 10 s, trả 20 bản ghi mẫu hoặc thông báo lỗi tiếng Việt theo từng loại lỗi (danh sách thông báo ở UC11, §6.7 E1–E7)                                             | Should  | UC11       | —          |
| FR-27 | "Đồng bộ ngay" một nguồn; nếu nguồn đang đồng bộ thì báo "Đang đồng bộ" (không tạo job thứ 2)                                                                                                            | Should  | UC12       | —          |
| FR-28 | Đặt lịch: preset (mỗi giờ / mỗi ngày lúc HH:mm) hoặc biểu thức cron; tạm dừng/kích hoạt nguồn                                                                                                            | Should  | UC10, UC13 | G1         |
| FR-29 | API không bao giờ trả mật khẩu/token của nguồn (hiển thị `••••`); khi sửa, để trống ô bí mật = giữ giá trị cũ                                                                                            | Should  | UC10       | P8         |

### 3.1.4 Phân tích & trực quan hoá

| Mã       | Yêu cầu                                                                                                                                                                         | Ưu tiên | UC   | Giải quyết |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- | ---------- |
| FR-30    | 4 thẻ KPI: Doanh thu, Số đơn, AOV, Số khách hàng (BR-01…BR-05) + delta % so kỳ trước, mũi tên xanh ▲ / đỏ ▼                                                                     | Must    | UC14 | P5, P6     |
| FR-31    | Biểu đồ đường xu hướng doanh thu theo ngày/tuần/tháng; ngày không có đơn = 0 (không nối thẳng)                                                                                  | Must    | UC14 | P6         |
| FR-32    | Top N sản phẩm (N = 5/10/20, mặc định 10) theo doanh thu hoặc số lượng: biểu đồ thanh ngang + bảng (SKU, tên, SL, doanh thu, % tổng)                                            | Must    | UC14 | P3         |
| FR-33    | Doanh thu theo danh mục: biểu đồ donut + %; > 8 danh mục thì gộp phần nhỏ thành "Khác"                                                                                          | Must    | UC14 | —          |
| FR-34    | Doanh thu và số đơn theo kênh: biểu đồ cột                                                                                                                                      | Must    | UC14 | P1         |
| FR-35    | Bộ lọc thời gian: preset (Hôm nay, 7 ngày, 30 ngày, Tháng này, Tháng trước, Quý này, Năm nay) + tuỳ chọn từ–đến (BR-22)                                                         | Must    | UC15 | P5         |
| FR-36    | Lọc theo **nhiều** kênh và **nhiều** danh mục, áp dụng cho toàn dashboard                                                                                                       | Must    | UC15 | P5         |
| FR-37    | Click một danh mục/kênh trên biểu đồ → thêm vào bộ lọc (lọc chéo); có nút "Xoá bộ lọc"                                                                                          | Should  | UC15 | P5         |
| FR-38    | Trạng thái bộ lọc nằm trên URL (`?from=&to=&channel=&category=&granularity=`) để chia sẻ link                                                                                   | Must    | UC15 | P5         |
| FR-39    | Mỗi khối có trạng thái đang tải (skeleton) / rỗng ("Chưa có dữ liệu trong khoảng này") / lỗi (nút "Thử lại"); hiển thị "Dữ liệu cập nhật lúc …" (thời điểm làm mới MV gần nhất) | Must    | UC14 | NFR-11     |
| FR-43 🆕 | API danh sách kênh và danh mục (cho dropdown bộ lọc)                                                                                                                            | Must    | UC15 | —          |

### 3.1.5 Báo cáo, danh mục, hệ thống

| Mã       | Yêu cầu                                                                                                                                                                      | Ưu tiên | UC   | Giải quyết |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- | ---------- |
| FR-40    | Xuất CSV (UTF-8 BOM) theo bộ lọc hiện tại, 4 loại: doanh thu theo ngày, top sản phẩm, theo danh mục, theo kênh. **Chỉ số liệu tổng hợp**, không chứa thông tin cá nhân khách | Should  | UC16 | P5, P8     |
| FR-41    | (Could) Khách mới / quay lại theo tháng; phân nhóm RFM đơn giản (3 mức mỗi chiều)                                                                                            | Could   | UC17 | —          |
| FR-42 🆕 | (Could) Xem danh sách sản phẩm, danh mục, kênh; sửa tên sản phẩm, gán danh mục, sửa tên hiển thị kênh                                                                        | Could   | UC18 | P3         |
| FR-44    | `GET /api/health` trả trạng thái API và CSDL (503 khi CSDL không kết nối được)                                                                                               | Must    | —    | —          |
| FR-45 🆕 | Khi server khởi động: job `pending`/`running` cũ hơn 30 phút → `failed` ("Gián đoạn do khởi động lại")                                                                       | Must    | —    | E6         |
| FR-46    | Làm mới `mv_daily_sales` sau mỗi lần nạp/hủy thành công                                                                                                                      | Must    | —    | NFR-17     |

## 3.2 Yêu cầu phi chức năng (Non-functional Requirements)

| Mã     | Nhóm        | Yêu cầu                                                                                                                                                          | Cách đo / kiểm chứng                                     | Bước KH    |
| ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- |
| NFR-01 | Hiệu năng   | Dashboard tải đầy đủ < **2 s** với 100.000 dòng `order_items`                                                                                                    | DevTools Network, cache tắt, máy dev; 5 lần lấy trung vị | S5.6       |
| NFR-02 | Hiệu năng   | Mỗi API analytics < **300 ms** (P95)                                                                                                                             | Log thời gian request; script gọi 50 lần                 | S5.6       |
| NFR-03 | Hiệu năng   | Nhập 10.000 dòng < **15 s**; trong lúc nhập, `/api/health` vẫn phản hồi < 500 ms                                                                                 | Đo thời gian job; gọi health song song                   | S3.2       |
| NFR-04 | Bảo mật     | Mật khẩu hash **bcrypt** cost ≥ 10; không bao giờ trả `password_hash`                                                                                            | Test DTO; xem DB                                         | S2.3       |
| NFR-05 | Bảo mật     | JWT trong cookie `httpOnly; SameSite=Lax` (`Secure` ở production; `SameSite=None` nếu khác domain)                                                               | Kiểm tra header `Set-Cookie`                             | S2.3, S6.5 |
| NFR-06 | Bảo mật     | Phân quyền kiểm tra ở server; viewer gọi API của analyst → 403                                                                                                   | Test Supertest theo ma trận §5.4                         | S2.3       |
| NFR-07 | Bảo mật     | Mọi SQL tham số hoá `$1…`; tên cột/độ chi tiết thời gian đi qua **whitelist**                                                                                    | Review code; test chuỗi `'; DROP TABLE`                  | S4.1       |
| NFR-08 | Bảo mật     | Cấu hình nguồn mã hoá **AES-256-GCM**, khoá trong biến môi trường                                                                                                | Xem DB không đọc được; test encrypt/decrypt              | S5.2       |
| NFR-09 | Bảo mật     | Lỗi 500 không trả stack trace; log không chứa mật khẩu, token, chuỗi kết nối                                                                                     | Test; đọc log                                            | S6.4       |
| NFR-10 | Toàn vẹn    | Nạp dữ liệu atomic (lỗi giữa chừng → rollback toàn bộ); idempotent                                                                                               | Integration test S3.2                                    | S3.2       |
| NFR-11 | Dễ dùng     | Giao diện tiếng Việt; thông báo lỗi nhập ghi **dòng + cột + cách sửa**; nhập file ≤ 3 bước                                                                       | Người không học IT tự nhập được file (S7.3)              | S3.3, S7.3 |
| NFR-12 | Tương thích | Dashboard ở màn hình **375 px**: không cuộn ngang, chữ ≥ 12 px, KPI lưới 2×2; trang nhập liệu/quản trị thiết kế cho ≥ 1280 px (ở 375 px chỉ cần không vỡ bố cục) | DevTools responsive                                      | S4.3       |
| NFR-13 | Tương thích | Chrome, Edge, Firefox, Safari iOS — 2 phiên bản mới nhất                                                                                                         | Thử thủ công                                             | S7.4       |
| NFR-14 | Bảo trì     | TypeScript `strict`; ESLint 0 lỗi; coverage `modules/imports`, `modules/analytics` ≥ 70 %                                                                        | `npm run lint`, `npm test -- --coverage`                 | S7.1       |
| NFR-15 | Triển khai  | Dựng lại được từ tài liệu; migration có version; chạy **1 instance** API                                                                                         | Người khác làm theo hướng dẫn                            | S6.5       |
| NFR-16 | Dữ liệu     | Múi giờ nghiệp vụ `Asia/Ho_Chi_Minh`; tiền `BIGINT` VND                                                                                                          | Test đơn lúc 00:30 giờ VN rơi đúng ngày                  | S1.3, S4.1 |
| NFR-17 | Độ tươi     | Dashboard phản ánh dữ liệu mới **≤ 1 phút** sau khi job thành công                                                                                               | Nhập file → F5 dashboard                                 | S3.4       |
| NFR-18 | Riêng tư    | SĐT/tên khách **không** hiển thị trên dashboard và file CSV xuất; chỉ dùng để đếm khách                                                                          | Review UI + file xuất                                    | S4.3, S5.5 |
| NFR-19 | Khả dụng    | Chấp nhận "cold start" của free tier ≤ 60 s; ghi trong hướng dẫn                                                                                                 | Đo khi demo                                              | S6.5       |

## 3.3 Quy tắc nghiệp vụ (Business Rules)

### 3.3.1 Định nghĩa chỉ số (KPI)

| Mã                         | Quy tắc                                                                                                                                                                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-01** Doanh thu        | `Σ(quantity × unit_price − discount)` của các dòng thuộc đơn `status = 'completed'`. Đơn `cancelled`, `returned` **không** tính.                                                                                                             |
| **BR-02** Số đơn           | `COUNT(DISTINCT order_id)` của đơn `completed`.                                                                                                                                                                                              |
| **BR-03** AOV              | Doanh thu ÷ Số đơn, làm tròn tới đồng. Số đơn = 0 → `null` (hiển thị "—"), **không chia cho 0**.                                                                                                                                             |
| **BR-04** Kỳ trước & delta | Kỳ trước = khoảng **cùng số ngày, liền ngay trước** `from`. Ví dụ `01/10–21/10` (21 ngày) ↔ `10/09–30/09`. `delta = (kỳ này − kỳ trước) / kỳ trước`. Kỳ trước = 0 và kỳ này > 0 → `null`, hiển thị "Mới"; cả hai = 0 → `null`, hiển thị "—". |
| **BR-05** Số khách hàng    | `COUNT(DISTINCT customer_id)` của đơn `completed`, **bỏ qua** đơn khách lẻ (`customer_id IS NULL`). Tooltip trên thẻ KPI phải ghi rõ "Không gồm khách lẻ".                                                                                   |

> ⚠️ **Bẫy MV:** `mv_daily_sales` gộp theo (ngày, sản phẩm, kênh) nên **không** tính được `COUNT(DISTINCT order_id)` hay `COUNT(DISTINCT customer_id)` bằng cách cộng các dòng MV (một đơn có 2 sản phẩm sẽ bị đếm 2 lần). Vì vậy **Số đơn** và **Số khách** phải tính từ bảng `orders` (có index `ordered_at`) hoặc từ một MV thứ hai cấp đơn hàng. Đây là điểm `ke-hoach.md` §5 chưa nói rõ; đã ghi vào [7.3](07-truy-vet-va-tu-kiem-tra.md#3-tác-động-lên-kế-hoạch-và-mô-hình-dữ-liệu).

### 3.3.2 Quy tắc nhập dữ liệu

| Mã                          | Quy tắc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-06** Idempotent        | Đơn xác định bởi `orders.external_code`. Nhập đơn đã có → **cập nhật** thông tin đơn và **thay toàn bộ** dòng đơn cũ bằng dòng trong lần nhập này (xoá `order_items` cũ rồi chèn lại). Hệ quả: **file phải chứa đủ mọi dòng của một đơn**; file chỉ có 1 trong 3 sản phẩm của đơn sẽ làm đơn còn 1 sản phẩm. Ghi điều này vào hướng dẫn sử dụng.                                                                                                                                                                                                                                                                 |
| **BR-07** Cấu trúc dòng     | **1 dòng file = 1 dòng đơn** (1 sản phẩm). Nhiều dòng cùng `order_code` = 1 đơn. Các trường **cấp đơn** (`ordered_at`, `channel`, `customer_code`, `order_status`) phải giống nhau (sau chuẩn hoá) giữa các dòng của cùng đơn; mâu thuẫn → **mọi dòng** của đơn đó vào lỗi: "Đơn DH001 không nhất quán giữa các dòng ở cột: Ngày đặt".                                                                                                                                                                                                                                                                           |
| **BR-08** Trạng thái        | So khớp không phân biệt hoa thường, bỏ dấu. **completed**: _(trống)_, `completed`, `hoàn thành`, `đã giao`, `giao thành công`, `thành công`, `delivered`. **cancelled**: `cancelled`, `canceled`, `hủy`, `huỷ`, `đã hủy`. **returned**: `returned`, `trả hàng`, `hoàn hàng`, `hoàn tiền`, `refunded`. **Trung gian** (`chờ xác nhận`, `chờ lấy hàng`, `đang giao`, `đang xử lý`, `pending`, `shipping`) → **bỏ qua dòng** (đếm vào `skipped_rows`, _không phải lỗi_); đơn sẽ được nhập ở lần sau khi đã hoàn tất. Giá trị khác → lỗi "Trạng thái không nhận diện: '…'".                                          |
| **BR-09** Số tiền, số lượng | Ô kiểu số (Excel) → dùng trực tiếp, làm tròn tới đồng. Ô kiểu chữ: bỏ khoảng trắng, `₫`, `đ`, `VND`; khớp `^\d{1,3}([.,]\d{3})+$` → bỏ dấu phân cách nghìn (`1.200.000` → 1200000; `1.200` → 1200 vì không có giá 1,2 đồng); khớp `^\d+$` → số nguyên; khớp `^\d+[.,]\d{1,2}$` → số thập phân, làm tròn; khác → lỗi. `unit_price ≥ 0`; `discount ≥ 0` và `≤ quantity × unit_price`; `quantity` nguyên, `1 ≤ quantity ≤ 100.000` (`2.0` hợp lệ, `2.5` lỗi).                                                                                                                                                       |
| **BR-10** Ngày giờ          | Ô kiểu ngày (Excel) → lấy **giờ hiển thị** (wall-clock) và hiểu là giờ Việt Nam. Ô số trong khoảng 20000–80000 → **số serial Excel** (gốc 1899-12-30). Chuỗi: theo định dạng người dùng chọn; "Tự động" = xét 20 dòng mẫu: phần đầu > 12 → `dd/MM`, phần giữa > 12 → `MM/dd`, không phân định được → `dd/MM` và **cảnh báo** ở bước ánh xạ. Giờ tuỳ chọn (`HH:mm[:ss]`), thiếu giờ → 00:00. Chuỗi ISO có múi giờ (`Z`, `+07:00`) → tôn trọng múi giờ đó; không có → giờ Việt Nam. Hợp lệ khi `2000-01-01 ≤ ngày ≤ hiện tại + 1 ngày`. **Ngày nghiệp vụ** = `(ordered_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`. |
| **BR-11** Sản phẩm          | Định danh bằng `sku` (bỏ khoảng trắng đầu/cuối, **viết hoa**). SKU mới → tạo, cần `product_name` (thiếu → lỗi dòng). SKU đã có → **không ghi đè tên** (tránh mỗi kênh đổi tên một kiểu, P3); danh mục chỉ được cập nhật nếu đang là "Chưa phân loại". Muốn đổi tên/danh mục → UC18.                                                                                                                                                                                                                                                                                                                              |
| **BR-12** Khách hàng        | Khoá: `customer_code` nếu có; nếu không có nhưng có SĐT hợp lệ → mã `SDT:0901234567`; không có cả hai → **khách lẻ** (`customer_id = NULL`). SĐT chuẩn hoá: bỏ khoảng trắng, `.`, `-`; `+84`/`84` → `0`; phải là 10 chữ số bắt đầu bằng `0`, sai → bỏ giá trị SĐT (không làm lỗi dòng). Tên/SĐT cập nhật theo giá trị **không rỗng mới nhất**.                                                                                                                                                                                                                                                                   |
| **BR-13** Kênh              | Chuẩn hoá: viết thường, bỏ dấu, khoảng trắng → `_`. Bí danh: `tai_quay`, `cua_hang`, `pos`, `offline` → `store`; `fb` → `facebook`; `tiktok_shop` → `tiktok`. Mã chưa có → tự tạo, tên hiển thị = giá trị gốc.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **BR-14** Danh mục          | Thiếu hoặc rỗng → "Chưa phân loại". So khớp theo tên đã bỏ khoảng trắng thừa, không phân biệt hoa thường.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **BR-15** Trạng thái job    | `success`: không lỗi hệ thống và `error_rows = 0` (kể cả trường hợp mọi dòng bị bỏ qua — thông báo "Không có đơn hoàn tất để nhập"). `partial`: `ok_rows > 0` và `error_rows > 0`. `failed`: lỗi hệ thống/mạng, **hoặc** `ok_rows = 0` và `error_rows > 0`. Luôn có `total_rows = ok_rows + error_rows + skipped_rows`.                                                                                                                                                                                                                                                                                          |
| **BR-16** Giới hạn file     | Đuôi `.csv`/`.xlsx` và MIME tương ứng; ≤ **10 MB**; ≤ **50.000 dòng dữ liệu**; ≤ 50 cột; Excel đọc sheet đầu tiên. `.xls` (Excel 97) không hỗ trợ → thông báo "Hãy lưu lại dưới dạng .xlsx".                                                                                                                                                                                                                                                                                                                                                                                                                     |

### 3.3.3 Quy tắc vận hành & bảo mật

| Mã                           | Quy tắc                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-17** Hủy lần nhập       | Chỉ job `success`/`partial`. Analyst chỉ hủy job **do mình tạo**; admin hủy mọi job (gồm job theo lịch). Xoá đơn có `created_job_id = J AND last_job_id = J`; giữ và báo số đơn còn lại. Không khôi phục giá trị cũ của đơn đã bị J cập nhật. Sau khi hủy: job → `undone`, ghi `undone_by`, `undone_at`; làm mới MV.                                                               |
| **BR-18** Đồng bộ tăng dần   | Có mốc thời gian → chỉ lấy bản ghi `> last_synced_at`; lần đầu (mốc rỗng) lấy toàn bộ. Thành công → `last_synced_at = thời điểm bắt đầu job`; thất bại → giữ nguyên. REST: retry 3 lần (1 s, 2 s, 4 s) với lỗi mạng/429/5xx; 4xx khác (401, 404) → thất bại ngay.                                                                                                                  |
| **BR-19** Chống chạy chồng   | Mỗi nguồn tối đa 1 job đồng bộ cùng lúc: `pg_try_advisory_lock(source_id)`. Bước **load/hủy** (ghi bảng chính) dùng chung khoá `pg_advisory_xact_lock(<hằng số>)` → các lần ghi được xếp hàng, không deadlock giữa 2 job ghi cùng đơn.                                                                                                                                             |
| **BR-20** Mật khẩu           | 8–72 ký tự (giới hạn 72 **byte** của bcrypt — dài hơn sẽ bị cắt ngầm), có ít nhất 1 chữ và 1 số, khác email.                                                                                                                                                                                                                                                                       |
| **BR-21** Phiên              | JWT hết hạn 8 giờ. **Mỗi request** đọc lại user từ CSDL: tài khoản bị khoá → 401 "Tài khoản đã bị khoá"; `iat < password_changed_at` → 401 (phiên cũ mất hiệu lực sau đổi/đặt lại mật khẩu); vai trò lấy từ CSDL, không tin vai trò trong token. Đăng nhập: giới hạn 10 lần/phút/IP → 429.                                                                                         |
| **BR-22** Bộ lọc thời gian   | `from`, `to` dạng `yyyy-MM-dd`, theo ngày Việt Nam, **gồm cả hai đầu**. `from ≤ to`, khoảng ≤ 1.096 ngày (3 năm), sai → 400. Mặc định 30 ngày gần nhất tính cả hôm nay. Độ chi tiết mặc định: ≤ 62 ngày → ngày; ≤ 366 ngày → tuần (bắt đầu **Thứ Hai**); lớn hơn → tháng. Chọn "ngày" chỉ cho phép khi khoảng ≤ 400 ngày.                                                          |
| **BR-23** Admin cuối cùng    | Không được khoá/hạ quyền **chính mình**; không thao tác nào được làm số admin đang hoạt động về 0.                                                                                                                                                                                                                                                                                 |
| **BR-24** Bí mật nguồn       | Mật khẩu/token nguồn chỉ tồn tại dạng mã hoá trong CSDL, giải mã **trong bộ nhớ** khi chạy job; không trả về API, không ghi log.                                                                                                                                                                                                                                                   |
| **BR-25** Nguồn CSDL chỉ đọc | Lớp chính: hướng dẫn tạo **tài khoản chỉ đọc** ở CSDL nguồn. Lớp phụ: chạy trong `SET TRANSACTION READ ONLY`, `statement_timeout = 30 s`, câu lệnh phải bắt đầu bằng `SELECT`/`WITH`, tối đa 200.000 bản ghi/lần. Có cột mốc → hệ thống bọc `SELECT * FROM (<câu của người dùng>) q WHERE q.<cột> > $1 ORDER BY q.<cột>` (tên cột kiểm tra bằng regex `^[a-zA-Z_][a-zA-Z0-9_]*$`). |
| **BR-26** Hiển thị           | Tiền `1.250.000 ₫` (`Intl.NumberFormat('vi-VN')`), ngày `dd/MM/yyyy`, giờ Việt Nam, phần trăm 1 chữ số thập phân `+12,5 %`.                                                                                                                                                                                                                                                        |

## 3.4 Ràng buộc thiết kế

- Stack, kiến trúc, cấu trúc thư mục: theo `ke-hoach.md` §2–§4 (không đổi).
- Một pipeline nhập dùng chung cho mọi nguồn: **Extract → Map → Normalize/Validate → Stage → Load → Refresh** (`ke-hoach.md` §3.2).

## 3.5 Từ điển dữ liệu đầu vào (Import Row)

> Đây là **hợp đồng** giữa người dùng, schema Zod `ImportRow` (`packages/shared`, S2.2) và hàm chuẩn hoá (`mapping.ts`, S3.1). Code phải khớp từng dòng bảng này.

### 3.5.1 Các trường hệ thống

| #   | Trường (`ImportRow`) | Tên hiển thị      | Cấp  | Bắt buộc khi ánh xạ               | Kiểu sau chuẩn hoá     | Quy tắc | Ví dụ hợp lệ                                       | Ví dụ lỗi → thông báo                                |
| --- | -------------------- | ----------------- | ---- | --------------------------------- | ---------------------- | ------- | -------------------------------------------------- | ---------------------------------------------------- |
| 1   | `order_code`         | Mã đơn            | Đơn  | ✅                                | text 1–50              | Trim    | `DH000123`, `231021ABCXYZ`                         | _(trống)_ → "Thiếu Mã đơn"                           |
| 2   | `ordered_at`         | Ngày đặt          | Đơn  | ✅                                | timestamptz            | BR-10   | `21/10/2026 14:30`, `2026-10-21`, `46316` (serial) | `32/10/2026` → "Ngày không hợp lệ"                   |
| 3   | `order_status`       | Trạng thái        | Đơn  | — (mặc định `completed`)          | enum                   | BR-08   | `Hoàn thành`, `Đã hủy`                             | `Lạ` → "Trạng thái không nhận diện"                  |
| 4   | `channel`            | Kênh bán          | Đơn  | ✅ (cột **hoặc** giá trị cố định) | text → `channels.code` | BR-13   | `Shopee`, `Tại quầy`                               | _(trống)_ → "Thiếu Kênh bán"                         |
| 5   | `customer_code`      | Mã khách          | Đơn  | —                                 | text ≤ 50 / null       | BR-12   | `KH001`                                            | —                                                    |
| 6   | `customer_name`      | Tên khách         | —    | —                                 | text ≤ 150 / null      | Trim    | `Nguyễn Văn A`                                     | —                                                    |
| 7   | `customer_phone`     | SĐT khách         | —    | —                                 | text 10 số / null      | BR-12   | `0901 234 567`, `+84901234567`                     | sai → bỏ giá trị, không lỗi                          |
| 8   | `product_sku`        | Mã sản phẩm (SKU) | Dòng | ✅                                | text ≤ 64, viết hoa    | BR-11   | `AO-THUN-01`                                       | _(trống)_ → "Thiếu SKU"                              |
| 9   | `product_name`       | Tên sản phẩm      | Dòng | — (bắt buộc với SKU mới)          | text ≤ 255             | BR-11   | `Áo thun trắng size M`                             | SKU mới, tên trống → "SKU mới cần Tên sản phẩm"      |
| 10  | `category`           | Danh mục          | Dòng | —                                 | text ≤ 100             | BR-14   | `Áo`                                               | —                                                    |
| 11  | `quantity`           | Số lượng          | Dòng | ✅                                | int 1–100.000          | BR-09   | `2`, `2.0`                                         | `0`, `2.5`, `abc` → "Số lượng phải là số nguyên ≥ 1" |
| 12  | `unit_price`         | Đơn giá           | Dòng | ✅                                | bigint ≥ 0             | BR-09   | `150000`, `150.000`, `150.000 ₫`                   | `-5`, `abc` → "Đơn giá không hợp lệ"                 |
| 13  | `discount`           | Giảm giá (dòng)   | Dòng | — (mặc định 0)                    | bigint ≥ 0             | BR-09   | `10.000`                                           | `> SL × đơn giá` → "Giảm giá lớn hơn thành tiền"     |

### 3.5.2 Ví dụ file mẫu (`mau-du-lieu.xlsx`, sheet `DonHang`)

| Mã đơn | Ngày đặt         | Trạng thái | Kênh bán | Mã khách | Tên khách    | SĐT khách  | SKU   | Tên sản phẩm      | Danh mục | Số lượng | Đơn giá | Giảm giá |
| ------ | ---------------- | ---------- | -------- | -------- | ------------ | ---------- | ----- | ----------------- | -------- | -------- | ------- | -------- |
| DH0001 | 21/10/2026 09:15 | Hoàn thành | Tại quầy | KH001    | Nguyễn Văn A | 0901234567 | AO-01 | Áo thun trắng M   | Áo       | 2        | 150.000 | 0        |
| DH0001 | 21/10/2026 09:15 | Hoàn thành | Tại quầy | KH001    | Nguyễn Văn A | 0901234567 | QJ-02 | Quần jean xanh 30 | Quần     | 1        | 350.000 | 20.000   |
| DH0002 | 21/10/2026 20:40 | Đã hủy     | Shopee   |          |              |            | AO-01 | Áo thun trắng M   | Áo       | 1        | 145.000 | 0        |

→ Kết quả kỳ vọng (dùng làm test case): 2 đơn, 3 dòng đơn; Doanh thu = 2×150.000 + 350.000 − 20.000 = **630.000 ₫** (DH0002 bị hủy, không tính); Số đơn = 1; AOV = 630.000; Số khách = 1.

### 3.5.3 Từ điển đồng nghĩa để gợi ý ánh xạ (FR-12)

So khớp sau khi: viết thường, bỏ dấu tiếng Việt, bỏ ký tự không phải chữ/số. Khớp **chính xác** trước, rồi mới đến **chứa**.

| Trường           | Tên cột thường gặp                                                                   |
| ---------------- | ------------------------------------------------------------------------------------ |
| `order_code`     | ma don, ma don hang, so hoa don, ma hoa don, order id, order code, order sn          |
| `ordered_at`     | ngay, ngay dat, ngay dat hang, thoi gian, ngay tao, ngay ban, order date, created at |
| `order_status`   | trang thai, trang thai don hang, status                                              |
| `channel`        | kenh, kenh ban, nguon don, channel, san                                              |
| `customer_code`  | ma khach, ma khach hang, customer id                                                 |
| `customer_name`  | ten khach, ten khach hang, khach hang, nguoi mua, customer                           |
| `customer_phone` | sdt, so dien thoai, dien thoai, phone                                                |
| `product_sku`    | sku, ma sp, ma san pham, ma hang, sku phan loai hang                                 |
| `product_name`   | ten sp, ten san pham, ten hang, san pham, product name                               |
| `category`       | danh muc, nhom hang, loai hang, category                                             |
| `quantity`       | so luong, sl, qty, quantity                                                          |
| `unit_price`     | don gia, gia ban, gia, gia uu dai, unit price, price                                 |
| `discount`       | giam gia, chiet khau, discount                                                       |

> ⚠️ Tên cột thật của file xuất từ Shopee/KiotViet/Sapo **thay đổi theo phiên bản** và AI không truy cập được file thật. Bạn cần lấy 1–2 file xuất thật (xoá thông tin khách) để bổ sung bảng này: xem [O-01](07-truy-vet-va-tu-kiem-tra.md#4-vấn-đề-còn-mở--cần-bạn-tự-xử-lý).

### 3.5.4 Cấu trúc lưu mẫu ánh xạ (`data_sources.column_mapping`, JSONB)

```json
{
  "version": 1,
  "dateFormat": "dd/MM/yyyy",
  "fields": {
    "order_code": { "column": "Mã đơn hàng" },
    "ordered_at": { "column": "Ngày đặt hàng" },
    "channel": { "constant": "shopee" },
    "product_sku": { "column": "SKU phân loại hàng" },
    "quantity": { "column": "Số lượng" },
    "unit_price": { "column": "Giá ưu đãi" }
  },
  "sourceColumns": ["Mã đơn hàng", "Ngày đặt hàng", "SKU phân loại hàng", "Số lượng", "Giá ưu đãi"]
}
```

`sourceColumns` dùng để so khớp ở FR-12 (cùng **tập** tên cột → gợi ý mẫu này). Mỗi trường có đúng một trong `column` / `constant` (ràng buộc bằng Zod `union`).

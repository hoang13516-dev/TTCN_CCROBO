# Chương 1. KHẢO SÁT & PHÂN TÍCH ĐỀ TÀI

## 1.1 Phát biểu bài toán

**Đề tài:** CN-019 — Dashboard phân tích dữ liệu bán hàng (đồ án chuyên ngành, mức Khó).

**Đề bài gốc (tóm tắt):** xây dựng hệ thống web BI thu thập, tổng hợp dữ liệu bán hàng từ nhiều nguồn (upload CSV/Excel, kết nối CSDL hoặc đồng bộ API) và trực quan hoá thành dashboard; theo dõi KPI (doanh thu, lợi nhuận, giá trị đơn trung bình, tỷ lệ giữ chân khách hàng, sản phẩm bán chạy theo vùng miền/thời gian). Kiến thức: ETL, OLAP/Star Schema, tối ưu truy vấn tổng hợp, biểu đồ đa chiều (drill-down, cross-filtering). Kết quả: đăng nhập & phân quyền xem báo cáo, quản lý nguồn dữ liệu & import/ETL, bộ lọc đa chiều theo thời gian/chi nhánh/danh mục, biểu đồ KPI, cảnh báo chỉ số bất thường, xuất báo cáo PDF/Excel, báo cáo phân tích thiết kế.

**Phát biểu một câu (problem statement):**

> Doanh nghiệp bán lẻ có **nhiều chi nhánh ở ba miền** và bán thêm **online** có dữ liệu bán hàng **nằm rải rác** (file xuất từ POS của từng chi nhánh, đơn từ website/sàn). Ban giám đốc mất nhiều giờ mỗi kỳ để gộp tay vào Excel nhưng vẫn **không trả lời nhanh và đúng**: _bán được bao nhiêu và **lãi** bao nhiêu?_, _chi nhánh/vùng nào, sản phẩm nào đang kéo kết quả lên hay xuống?_, _khách cũ có quay lại không?_, _có gì bất thường cần xử lý ngay không?_

**Mục tiêu của hệ thống (đo được):**

| #   | Mục tiêu                              | Chỉ số đo                                     | Hiện trạng (giả định khảo sát) | Mục tiêu                             |
| --- | ------------------------------------- | --------------------------------------------- | ------------------------------ | ------------------------------------ |
| G1  | Giảm thời gian tổng hợp số liệu       | Thời gian từ "có file" đến "có báo cáo"       | 3–6 giờ/kỳ                     | **< 10 phút**/lần nhập               |
| G2  | Số liệu đúng, nhất quán               | Đơn hủy/trùng bị cộng vào doanh thu           | Thường xuyên                   | **0** (BR-01, BR-06)                 |
| G3  | Lãnh đạo tự xem, đa chiều             | Thời gian trả lời 1 câu hỏi mới               | 1–2 ngày                       | **< 1 phút** (đổi lọc, drill-down)   |
| G4  | Thấy được lợi nhuận và khách quay lại | Có KPI lợi nhuận, tỷ lệ giữ chân, so kỳ trước | Không có                       | 6 KPI đều có delta so kỳ trước       |
| G5  | Phát hiện sớm bất thường              | Thời điểm biết doanh thu/biên lãi sụt         | Cuối tháng                     | **Ngay khi mở dashboard** (cảnh báo) |
| G6  | Hợp nhất nhiều nguồn                  | Số loại nguồn gộp được tự động                | 0                              | File CSV/Excel + REST API            |

> **Lưu ý:** cột "Hiện trạng" là **giả định**. Xác nhận bằng phỏng vấn theo [`phieu-khao-sat.md`](phieu-khao-sat.md) nếu có điều kiện; nếu không, ghi rõ là giả định trong báo cáo.

## 1.2 Bối cảnh & đối tượng sử dụng

### 1.2.1 Mô hình doanh nghiệp mục tiêu

| Thuộc tính        | Giá trị giả định (thiết kế theo)                                                     | Ảnh hưởng tới thiết kế                                             |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Loại hình         | Chuỗi bán lẻ vừa và nhỏ: thời trang, mỹ phẩm, gia dụng                               | Một đơn nhiều sản phẩm → hạt của bảng sự kiện là **dòng đơn**      |
| Chi nhánh         | 3–10 cửa hàng ở nhiều tỉnh; mỗi tỉnh thuộc một vùng (Bắc/Trung/Nam)                  | Bảng chiều `dim_branch(province, region)`; lọc theo chi nhánh/vùng |
| Kênh bán          | Tại quầy, website, Shopee, TikTok… Đơn online do một chi nhánh xử lý (kho xuất hàng) | Bảng chiều `dim_channel`; mọi đơn đều có chi nhánh                 |
| Người dùng        | 1 giám đốc/chủ, 1–2 nhân viên phân tích/kế toán, mỗi chi nhánh 1 quản lý             | 3 vai trò, quản lý chỉ thấy chi nhánh mình                         |
| Quy mô dữ liệu    | 50–300 đơn/ngày toàn chuỗi, ≤ 2.000 SKU                                              | 18 tháng ≈ 100.000 dòng bán hàng (NFR-01)                          |
| Nguồn dữ liệu     | POS chi nhánh xuất Excel/CSV (có giá vốn); website bán hàng có REST API              | Hai loại nguồn: file, REST API                                     |
| Tiền tệ / múi giờ | VND, `Asia/Ho_Chi_Minh`                                                              | Tiền `BIGINT`, ngày nghiệp vụ theo giờ Việt Nam                    |
| Số doanh nghiệp   | 1 (single-tenant)                                                                    | Mỗi doanh nghiệp 1 bản deploy                                      |

### 1.2.2 Các bên liên quan

| Bên liên quan                 | Vai trò với hệ thống             | Mối quan tâm chính                                                        | Tác nhân                          |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------------- | --------------------------------- |
| Giám đốc / chủ doanh nghiệp   | Ra quyết định, quản trị hệ thống | Số liệu toàn chuỗi đúng, lợi nhuận, cảnh báo sớm; kiểm soát ai xem gì     | **Quản trị viên (admin)**         |
| Nhân viên phân tích / kế toán | Thao tác dữ liệu hằng ngày       | Nhập file nhanh, biết dòng nào lỗi; đồng bộ dữ liệu online; xuất báo cáo  | **Nhân viên phân tích (analyst)** |
| Quản lý chi nhánh             | Theo dõi kết quả chi nhánh mình  | Xem KPI, sản phẩm bán chạy, cảnh báo **của chi nhánh mình**; xuất báo cáo | **Quản lý chi nhánh (manager)**   |
| Website bán hàng (REST API)   | Nguồn dữ liệu                    | Chỉ cho đọc, xác thực bằng API key                                        | **Hệ thống nguồn API**            |
| GVHD                          | Đánh giá đồ án                   | Đúng đề, phân tích rõ, chạy được, có kiểm thử                             | —                                 |

## 1.3 Hiện trạng & các vấn đề (AS-IS)

Quy trình hiện tại: **Hình H2** ([`02-as-is.png`](so-do/out/02-as-is.png)), chi tiết ở [Chương 2](02-quy-trinh-nghiep-vu.md#21-quy-trình-hiện-tại-as-is).

| Mã     | Vấn đề                                                                    | Nguyên nhân gốc                                                        | Hậu quả                              | Giải pháp trong hệ thống                                              |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| **P1** | Dữ liệu phân tán: mỗi chi nhánh một file, đơn online ở website            | Mỗi phần mềm một mẫu xuất, không có kho chung                          | Phải gộp tay                         | ETL nhiều nguồn: file + REST API, **một pipeline** (FR-08…FR-18)      |
| **P2** | Tốn 3–6 giờ chuẩn hoá tay, dễ sai                                         | Ngày `dd/MM` lẫn `MM/dd`, tiền "1.200.000" dạng chữ, tên cột khác nhau | Sai số liệu, mất thời gian           | Gợi ý ánh xạ cột + **chuẩn hoá tự động** (FR-09, FR-10, BR-09, BR-10) |
| **P3** | Đơn hủy, đơn trùng vẫn bị cộng doanh thu                                  | Không có khoá định danh đơn, lọc tay hay quên                          | Doanh thu bị thổi phồng              | Chỉ tính đơn `completed` (BR-01); nhập lại theo mã đơn (BR-06)        |
| **P4** | Chỉ thấy doanh thu, không thấy **lợi nhuận**                              | Giá vốn nằm file khác, không ai ghép                                   | Bán nhiều nhưng lãi ít mà không biết | Giá vốn đi cùng dòng bán; KPI lợi nhuận gộp, biên lợi nhuận (BR-02)   |
| **P5** | Không so sánh được giữa **chi nhánh, vùng miền, sản phẩm**                | Báo cáo là bảng tĩnh, mỗi lần muốn góc nhìn khác phải làm lại          | Phản hồi chậm 1–2 ngày               | Dashboard lọc đa chiều, **drill-down, lọc chéo** (FR-19…FR-27)        |
| **P6** | Biết doanh số sụt giảm quá muộn                                           | Chỉ tổng hợp cuối tháng                                                | Mất cơ hội xử lý                     | **Cảnh báo chỉ số bất thường** theo quy tắc (FR-29…FR-31)             |
| **P7** | Không biết khách cũ có quay lại không                                     | Không theo dõi khách theo thời gian                                    | Không đánh giá được chăm sóc khách   | KPI **tỷ lệ giữ chân khách** (BR-04)                                  |
| **P8** | Quản lý chi nhánh xem được số liệu chi nhánh khác; file tổng gửi qua Zalo | Chia sẻ file thủ công                                                  | Lộ thông tin kinh doanh              | Đăng nhập + **phân quyền theo chi nhánh** (FR-06, BR-15)              |

## 1.4 Khảo sát giải pháp hiện có

| Giải pháp                                  | Ưu điểm               | Nhược điểm với đối tượng mục tiêu                                      | Bài học cho đề tài                                                   |
| ------------------------------------------ | --------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Excel / Google Sheets + Pivot              | Quen thuộc, miễn phí  | Gộp tay (P1–P3), không phân quyền, chậm khi > 100.000 dòng             | Giữ thói quen "tải file Excel lên" → nhập file là chức năng Must     |
| Báo cáo có sẵn trong POS (KiotViet, Sapo…) | Đúng số của chính POS | Chỉ thấy dữ liệu của POS đó, không gộp đơn website/sàn                 | Giá trị khác biệt = **hợp nhất đa nguồn**                            |
| Power BI / Looker Studio / Metabase        | Mạnh, linh hoạt       | Cần người biết dựng mô hình dữ liệu, làm sạch dữ liệu; chi phí học cao | Đóng gói sẵn **kho hình sao + KPI bán lẻ** → không cần chuyên gia BI |

> **Định vị:** CN-019 không cạnh tranh tính năng với Power BI. Giá trị của nó là **"nhập file/API → làm sạch → kho dữ liệu hình sao → dashboard bán lẻ dựng sẵn, có phân quyền chi nhánh và cảnh báo"** cho người không chuyên.

## 1.5 Phạm vi hệ thống

### 1.5.1 Trong phạm vi

1. Tài khoản với **3 vai trò** `manager < analyst < admin`; quản lý chi nhánh chỉ thấy chi nhánh mình ([ADR-0002](../adr/0002-vai-tro-va-pham-vi-chi-nhanh.md)).
2. Quản lý nguồn dữ liệu (file, REST API) và **ETL**: nhập CSV/Excel có ánh xạ cột, chuẩn hoá, kiểm tra từng dòng, nhập lại an toàn; đồng bộ REST API tăng dần.
3. Kho dữ liệu **hình sao** ([ADR-0003](../adr/0003-mo-hinh-hinh-sao.md)).
4. Dashboard: 6 KPI + xu hướng + top sản phẩm theo vùng + theo vùng/chi nhánh + theo danh mục + theo kênh; lọc đa chiều; drill-down; lọc chéo; so sánh kỳ trước.
5. Cảnh báo chỉ số bất thường theo quy tắc cấu hình được.
6. Xuất báo cáo Excel và PDF theo bộ lọc.

### 1.5.2 Ngoài phạm vi

Danh sách và cách mở rộng sau này: [§3.1.7](03-dac-ta-yeu-cau.md#317-ngoài-phạm-vi-wont--ghi-là-hướng-phát-triển). Ranh giới quan trọng nhất: hệ thống là **phân tích** (OLAP), **không** tạo đơn, quản lý kho hay ghi ngược dữ liệu vào nguồn (OLTP).

### 1.5.3 Giả định & ràng buộc

| Mã  | Giả định / ràng buộc                                           | Nếu sai thì sao                                                                   |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A1  | Mỗi đơn có **mã đơn duy nhất trong nguồn của nó**              | Không chống trùng được → nhập lại sẽ nhân đôi                                     |
| A2  | Mỗi sản phẩm có **SKU** ổn định, giống nhau giữa các nguồn     | Top sản phẩm bị chia nhỏ → cần thêm chức năng gộp sản phẩm (hướng phát triển)     |
| A3  | Dữ liệu xuất có **giá vốn** từng dòng (POS quản lý kho đều có) | Không tính được lợi nhuận cho nguồn đó → ghi hạn chế, nhập giá vốn = 0 sẽ làm sai |
| A4  | Mỗi đơn (kể cả đơn online) gắn với **một chi nhánh** xử lý     | Không phân tích theo vùng được cho đơn đó                                         |
| A5  | Người nhập liệu dùng máy tính; điện thoại chủ yếu để xem       | Trang nhập liệu không tối ưu cho mobile                                           |
| C1  | 1 sinh viên, ~13 giờ/tuần, 50 ngày (21/10 → 09/12/2026)        | Ưu tiên MoSCoW, có thứ tự cắt (`ke-hoach.md` §8)                                  |
| C2  | Stack đã chốt: TypeScript, React, Node.js/Express, PostgreSQL  | —                                                                                 |

## 1.6 Thuật ngữ

| Thuật ngữ                      | Định nghĩa trong hệ thống này                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Đơn hàng**                   | Một giao dịch bán, xác định bởi `(nguồn, mã đơn)`. Trạng thái `completed` / `cancelled` / `returned`.                      |
| **Dòng bán hàng**              | Một sản phẩm trong một đơn: SKU × số lượng × đơn giá − giảm giá, kèm giá vốn. **Một dòng file = một dòng bán hàng.**       |
| **Chi nhánh / vùng**           | Cửa hàng vật lý xử lý đơn; mỗi chi nhánh thuộc một tỉnh, mỗi tỉnh thuộc một vùng (Miền Bắc/Trung/Nam).                     |
| **Kênh bán**                   | Nơi phát sinh đơn: tại quầy, website, Shopee… Khác với _chi nhánh_ và khác với _nguồn dữ liệu_.                            |
| **Nguồn dữ liệu**              | Nơi hệ thống lấy dữ liệu: một loại file (vd. "POS chi nhánh") hoặc một REST API. Một nguồn có thể chứa đơn của nhiều kênh. |
| **ETL**                        | Extract (đọc từ nguồn) → Transform (ánh xạ, chuẩn hoá, kiểm tra) → Load (ghi vào kho).                                     |
| **Lần nhập**                   | Một lần chạy ETL (upload file hoặc đồng bộ API), có trạng thái và thống kê dòng hợp lệ/lỗi.                                |
| **Kho dữ liệu hình sao**       | Một **bảng sự kiện** (`fact_sales`, chứa số đo) ở giữa, nối tới các **bảng chiều** (`dim_*`, chứa thuộc tính để lọc/nhóm). |
| **Hạt (grain)**                | Mức chi tiết của một dòng trong bảng sự kiện; ở đây là "một sản phẩm trong một đơn".                                       |
| **Drill-down**                 | Đi từ mức tổng hợp xuống mức chi tiết: năm → quý → tháng → ngày; vùng → chi nhánh; danh mục → sản phẩm.                    |
| **Lọc chéo (cross-filtering)** | Click một phần tử trên một biểu đồ thì mọi biểu đồ khác lọc theo phần tử đó.                                               |
| **Kỳ trước**                   | Khoảng thời gian **cùng độ dài, liền ngay trước** khoảng đang xem.                                                         |
| **Tỷ lệ giữ chân khách**       | Trong số khách đã mua ở kỳ trước, tỷ lệ khách mua lại trong kỳ này (BR-04).                                                |
| **Đồng bộ tăng dần**           | Chỉ lấy bản ghi thay đổi sau mốc `last_synced_at` của lần đồng bộ thành công trước.                                        |
| **Idempotent**                 | Nhập lại cùng dữ liệu N lần cho cùng kết quả như 1 lần.                                                                    |

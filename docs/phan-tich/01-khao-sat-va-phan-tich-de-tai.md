# Chương 1. KHẢO SÁT & PHÂN TÍCH ĐỀ TÀI

## 1.1 Phát biểu bài toán

**Đề tài:** CN-019 — Xây dựng web dashboard phân tích dữ liệu bán hàng.

**Phát biểu một câu (problem statement):**

> Chủ cửa hàng bán lẻ nhỏ bán hàng trên **nhiều kênh** (tại quầy, Facebook/Zalo, sàn TMĐT) có dữ liệu đơn hàng **nằm rải rác ở nhiều nơi, mỗi nơi một định dạng**. Họ mất nhiều giờ mỗi kỳ để gộp tay vào Excel nhưng vẫn **không trả lời được nhanh và đúng** ba câu hỏi kinh doanh cốt lõi: _bán gì chạy?_, _lúc nào / kênh nào bán tốt?_, _kỳ này tốt hơn hay kém hơn kỳ trước?_

**Mục tiêu của hệ thống (đo được):**

| #   | Mục tiêu                        | Chỉ số đo                               | Hiện trạng (ước tính khảo sát) | Mục tiêu                        |
| --- | ------------------------------- | --------------------------------------- | ------------------------------ | ------------------------------- |
| G1  | Giảm thời gian tổng hợp số liệu | Thời gian từ "có file" đến "có báo cáo" | 3–6 giờ/kỳ                     | **< 10 phút**/lần nhập          |
| G2  | Số liệu đúng, nhất quán         | Đơn hủy/trùng bị cộng vào doanh thu     | Thường xuyên                   | **0** (có quy tắc BR-01, BR-06) |
| G3  | Chủ shop tự xem, không phải chờ | Thời gian trả lời 1 câu hỏi mới         | 1–2 ngày                       | **< 1 phút** (đổi bộ lọc)       |
| G4  | So sánh được theo thời gian     | Có so sánh kỳ trước nhất quán           | Không                          | Mọi KPI có delta %              |
| G5  | Hợp nhất nhiều nguồn            | Số nguồn gộp được tự động               | 0                              | File + CSDL + REST API          |

> **Lưu ý:** cột "Hiện trạng" là **giả định** từ khảo sát sơ bộ. Bạn cần xác nhận lại bằng phỏng vấn thật (phiếu khảo sát ở [1.7](#17-phiếu-khảo-sát-dùng-để-xác-nhận-hiện-trạng)). Đây là việc AI không làm thay được.

## 1.2 Bối cảnh & đối tượng sử dụng

### 1.2.1 Mô hình doanh nghiệp mục tiêu

| Thuộc tính               | Giá trị giả định (thiết kế theo)                                                                | Ảnh hưởng tới thiết kế                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Loại hình                | Cửa hàng bán lẻ nhỏ: thời trang, mỹ phẩm, đồ gia dụng, tạp hoá                                  | Một đơn có nhiều dòng sản phẩm → bảng `orders` + `order_items` |
| Số nhân sự dùng hệ thống | 1 chủ + 1–3 nhân viên                                                                           | Đủ 3 vai trò, không cần phân cấp phức tạp                      |
| Kênh bán                 | 2–5 kênh: `store`, `facebook`, `zalo`, `shopee`, `tiktok`…                                      | Bảng `channels`, lọc theo kênh                                 |
| Quy mô dữ liệu           | 50–300 đơn/ngày, ≤ 2.000 SKU                                                                    | 18 tháng ≈ 100.000 dòng `order_items` (khớp NFR-01)            |
| Nguồn dữ liệu            | Phần mềm POS (KiotViet, Sapo, …) xuất Excel; sàn TMĐT xuất Excel; một số shop có CSDL/API riêng | 3 loại nguồn: file, CSDL, REST API                             |
| Tiền tệ / múi giờ        | VND, `Asia/Ho_Chi_Minh`                                                                         | Tiền `BIGINT`, nhóm ngày theo giờ VN                           |
| Số cửa hàng              | 1 (single-tenant)                                                                               | Mỗi cửa hàng 1 bản deploy (`ke-hoach.md` §2)                   |

### 1.2.2 Các bên liên quan (stakeholders)

| Bên liên quan                                | Vai trò với hệ thống                | Mối quan tâm chính                                                 | Ánh xạ tác nhân                   |
| -------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| Chủ cửa hàng                                 | Người ra quyết định, người trả tiền | Số liệu đúng, xem nhanh trên điện thoại, dữ liệu không lộ ra ngoài | **Quản trị viên (admin)**         |
| Nhân viên văn phòng / kế toán                | Người thao tác dữ liệu hằng ngày    | Nhập file nhanh, biết dòng nào lỗi và vì sao                       | **Nhân viên phân tích (analyst)** |
| Quản lý ca, cửa hàng trưởng, đối tác góp vốn | Người theo dõi                      | Xem số liệu, **không** được sửa dữ liệu hay xuất dữ liệu khách     | **Người xem (viewer)**            |
| Hệ thống POS / sàn TMĐT / CSDL riêng         | Nguồn dữ liệu                       | Chỉ cho đọc, không bị ghi vào                                      | **Hệ thống nguồn ngoài**          |
| GVHD                                         | Người đánh giá đồ án                | Đúng đề, phân tích rõ, chạy được, có kiểm thử                      | —                                 |

## 1.3 Hiện trạng & các vấn đề (AS-IS)

Quy trình hiện tại được mô hình hoá ở **Hình H2** ([`02-as-is.png`](so-do/out/02-as-is.png)), chi tiết ở [Chương 2](02-quy-trinh-nghiep-vu.md#21-quy-trình-hiện-tại-as-is).

| Mã     | Vấn đề                                                 | Nguyên nhân gốc                                                                | Hậu quả                       | Giải pháp trong hệ thống                                         |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------- |
| **P1** | Dữ liệu phân tán 3–4 nơi, mỗi nơi một định dạng cột    | Mỗi phần mềm/sàn có mẫu xuất riêng                                             | Phải gộp tay                  | Nhập nhiều nguồn + **ánh xạ cột** lưu được (FR-10…FR-14)         |
| **P2** | Tốn 3–6 giờ chuẩn hoá tay, dễ sai                      | Ngày `dd/MM` lẫn `MM/dd`, số tiền "1.200.000" dạng text, ngày serial của Excel | Sai số liệu, mất thời gian    | **Chuẩn hoá tự động** theo BR-09, BR-10                          |
| **P3** | Cùng sản phẩm, nhiều tên khác nhau giữa các kênh       | Mỗi kênh đặt tên riêng                                                         | Top sản phẩm bị chia nhỏ, sai | Định danh sản phẩm bằng **SKU**, tên không ghi đè (BR-11)        |
| **P4** | Đơn hủy, đơn trùng vẫn bị cộng doanh thu               | Không có khoá định danh đơn, lọc tay hay quên                                  | Doanh thu bị thổi phồng       | Chỉ tính đơn `completed` (BR-01); **upsert theo mã đơn** (BR-06) |
| **P5** | Chủ không tự xem được, phải nhờ làm lại pivot          | Báo cáo là ảnh/file tĩnh                                                       | Phản hồi chậm 1–2 ngày        | **Dashboard tương tác** + bộ lọc + link chia sẻ (FR-30…FR-38)    |
| **P6** | Không so sánh nhất quán với kỳ trước, không có lịch sử | Mỗi kỳ một file, định nghĩa KPI thay đổi                                       | Quyết định cảm tính           | KPI định nghĩa cố định + **delta so kỳ trước** (BR-04)           |
| **P7** | Nhập nhầm file thì không gỡ ra được                    | Dán đè vào file tổng                                                           | Phải làm lại từ đầu           | **Hủy lần nhập** (UC08, BR-17)                                   |
| **P8** | Ai cũng mở được file tổng (gồm SĐT khách)              | Chia sẻ file qua Zalo                                                          | Lộ dữ liệu khách hàng         | **Đăng nhập + phân quyền 3 vai**; viewer không xuất được dữ liệu |

## 1.4 Khảo sát giải pháp hiện có (so sánh để định vị đề tài)

| Giải pháp                                  | Ưu điểm                       | Nhược điểm với đối tượng mục tiêu                                                | Bài học cho đề tài                                                              |
| ------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Excel / Google Sheets + Pivot              | Quen thuộc, miễn phí          | Gộp tay (P1–P4), không phân quyền, chậm khi > 100k dòng                          | Giữ thói quen "tải file Excel lên" → **nhập file là chức năng Must**            |
| Báo cáo có sẵn trong POS (KiotViet, Sapo…) | Có sẵn, đúng số của chính POS | **Chỉ thấy dữ liệu của POS đó**, không gộp sàn TMĐT/Facebook                     | Giá trị khác biệt của đề tài = **hợp nhất đa nguồn**                            |
| Báo cáo trong Seller Center của sàn        | Chi tiết cho sàn              | Mỗi sàn một nơi, không so sánh chéo kênh                                         | Cần biểu đồ **theo kênh**                                                       |
| Power BI / Looker Studio / Metabase        | Mạnh, linh hoạt               | Cần người biết dựng mô hình dữ liệu, chuẩn hoá; chi phí/học tập cao với shop nhỏ | Đề tài **đóng gói sẵn** mô hình dữ liệu + KPI cho bán lẻ → không cần chuyên gia |

> **Định vị:** CN-019 không cạnh tranh về tính năng với Power BI. Giá trị của nó là **"nhập file bất kỳ → chuẩn hoá → dashboard bán lẻ dựng sẵn"** cho người không chuyên. Đây là luận điểm nên dùng khi bảo vệ.

## 1.5 Phạm vi hệ thống

### 1.5.1 Trong phạm vi (In scope)

1. Quản lý tài khoản với **3 vai trò** (admin / analyst / viewer) — thay đổi so với `ke-hoach.md` (2 vai), lý do ở [ADR-0001](../adr/0001-ba-vai-tro-nguoi-dung.md).
2. Nhập dữ liệu **đơn hàng** từ CSV/Excel có ánh xạ cột, chuẩn hoá, kiểm tra từng dòng, nhập lại an toàn, hủy lần nhập.
3. Kết nối **CSDL ngoài (chỉ đọc)** và **REST API**, đồng bộ thủ công và theo lịch.
4. Dashboard: 4 KPI + xu hướng + top sản phẩm + theo danh mục + theo kênh; lọc thời gian/kênh/danh mục; so sánh kỳ trước.
5. Xuất CSV theo bộ lọc; chia sẻ link giữ bộ lọc.
6. (Could) Phân tích khách mới/quay lại, RFM; chỉnh danh mục sản phẩm.

### 1.5.2 Ngoài phạm vi (Out of scope) — và lý do

| Không làm                                         | Lý do                                                                                                                              | Ghi vào báo cáo như                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Bán hàng / tạo đơn / quản lý kho                  | Hệ thống là **phân tích** (OLAP-like), không phải **giao dịch** (OLTP). Đơn hàng được tạo ở POS/sàn                                | Ranh giới hệ thống                       |
| Ghi ngược dữ liệu vào nguồn                       | An toàn: chỉ đọc nguồn (BR-25)                                                                                                     | Ràng buộc bảo mật                        |
| Nhiều cửa hàng trên 1 bản deploy (multi-tenant)   | Độ phức tạp cao cho 1 sinh viên                                                                                                    | Hướng phát triển                         |
| Dự báo doanh thu bằng ML                          | Ngoài thời lượng                                                                                                                   | Hướng phát triển                         |
| Ứng dụng mobile native                            | Web responsive đã đủ (NFR-12)                                                                                                      | Hướng phát triển                         |
| Giảm giá **cấp đơn** (voucher toàn đơn, phí ship) | Mô hình dữ liệu tính giảm giá theo **dòng**; xem [vấn đề mở O-04](07-truy-vet-va-tu-kiem-tra.md#4-vấn-đề-còn-mở--cần-bạn-tự-xử-lý) | Hạn chế đã biết                          |
| Lợi nhuận / giá vốn                               | Đa số file xuất **không có giá vốn**                                                                                               | Hướng phát triển (thêm cột `cost_price`) |

### 1.5.3 Giả định & ràng buộc

| Mã  | Giả định / ràng buộc                                                      | Nếu sai thì sao                                                                                  |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A1  | Mỗi đơn hàng có **mã đơn duy nhất** trong nguồn của nó                    | Không chống trùng được → phải sinh mã từ (ngày + khách + tổng tiền), kém tin cậy                 |
| A2  | Mỗi sản phẩm có **SKU** (hoặc mã hàng) ổn định                            | Top sản phẩm không gộp được giữa các kênh → cần UC18 để gộp tay                                  |
| A3  | Hai nguồn khác nhau **không dùng chung** một mã đơn cho hai đơn khác nhau | Đơn bị ghi đè nhầm → xem [O-03](07-truy-vet-va-tu-kiem-tra.md#4-vấn-đề-còn-mở--cần-bạn-tự-xử-lý) |
| A4  | Người dùng có máy tính để nhập liệu; điện thoại chỉ để xem                | Màn hình nhập liệu không cần tối ưu cho mobile                                                   |
| C1  | 1 sinh viên, 10–15 giờ/tuần, 10 tuần                                      | Ưu tiên theo MoSCoW, có phương án cắt (`ke-hoach.md` §7)                                         |
| C2  | Stack đã chốt: TS, React, Express, PostgreSQL                             | —                                                                                                |
| C3  | Deploy free tier, chỉ **1 instance** API (vì `node-cron`)                 | Chạy 2 instance sẽ chạy trùng job đồng bộ                                                        |

## 1.6 Thuật ngữ (glossary)

| Thuật ngữ                               | Định nghĩa trong hệ thống này                                                                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Đơn hàng (order)**                    | Một giao dịch bán, xác định bởi `external_code` (mã đơn ở nguồn). Có trạng thái `completed` / `cancelled` / `returned`. |
| **Dòng đơn (order item)**               | Một sản phẩm trong đơn: SKU × số lượng × đơn giá − giảm giá. **Một dòng trong file nhập = một dòng đơn.**               |
| **Kênh (channel)**                      | Nơi phát sinh đơn: `store`, `facebook`, `shopee`…                                                                       |
| **Nguồn dữ liệu (data source)**         | Nơi hệ thống lấy dữ liệu: file, CSDL, REST API. Khác với _kênh_: một nguồn (file POS) có thể chứa đơn của nhiều kênh.   |
| **Lần nhập (import job)**               | Một lần chạy pipeline nhập/đồng bộ, có trạng thái và thống kê dòng OK/lỗi.                                              |
| **Ánh xạ cột (column mapping)**         | Quy tắc "cột X trong file → trường Y của hệ thống" (hoặc "trường Y = giá trị cố định").                                 |
| **Mẫu ánh xạ**                          | Ánh xạ đã lưu để dùng lại cho lần nhập sau cùng loại file.                                                              |
| **Staging**                             | Bảng tạm chứa dòng đã kiểm tra, trước khi ghi vào bảng chính trong 1 transaction.                                       |
| **Upsert / idempotent**                 | Ghi "có thì cập nhật, chưa có thì thêm". Nhập lại cùng file N lần cho cùng kết quả như 1 lần.                           |
| **KPI**                                 | Chỉ số: Doanh thu, Số đơn, AOV, Số khách hàng. Định nghĩa chính xác ở BR-01…BR-05.                                      |
| **Kỳ trước**                            | Khoảng thời gian **cùng độ dài, liền ngay trước** khoảng đang xem.                                                      |
| **Materialized view (MV)**              | Bảng tổng hợp theo ngày được tính sẵn, làm mới sau mỗi lần nhập; dashboard đọc từ đây cho nhanh.                        |
| **Đồng bộ tăng dần (incremental sync)** | Chỉ lấy bản ghi thay đổi sau mốc `last_synced_at`.                                                                      |

## 1.7 Phiếu khảo sát (dùng để xác nhận hiện trạng)

> Dùng để phỏng vấn 1–2 chủ shop/nhân viên thật trong **tuần này** (15–20 phút/người). Kết quả dán vào phụ lục báo cáo, làm bằng chứng cho mục 1.3. **Câu hỏi nào trả lời khác giả định thì đánh dấu và báo lại để điều chỉnh yêu cầu.**

| #   | Câu hỏi                                                                                                         | Kiểm chứng giả định             |
| --- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Q1  | Anh/chị bán trên những kênh nào? Kênh nào nhiều đơn nhất?                                                       | Danh sách `channels`, P1        |
| Q2  | Đang dùng phần mềm bán hàng nào? Có xuất được Excel không? (xin **1 file mẫu đã xoá tên/SĐT khách**)            | Định dạng file, A1, A2          |
| Q3  | Mỗi đơn trong file có mã đơn không? Một đơn nhiều sản phẩm thì file thể hiện thế nào (nhiều dòng hay một dòng)? | BR-07, A1                       |
| Q4  | Sản phẩm có mã SKU/mã hàng không? Mã có giống nhau giữa POS và sàn không?                                       | A2, P3                          |
| Q5  | Bao lâu làm báo cáo một lần? Mất bao lâu? Ai làm?                                                               | G1, P2                          |
| Q6  | Hay xem những con số nào nhất? (doanh thu, số đơn, sản phẩm bán chạy, …)                                        | Chọn KPI, FR-30…FR-35           |
| Q7  | Có tính đơn hủy/hoàn vào doanh thu không? Giảm giá/voucher ghi ở đâu?                                           | BR-01, O-04                     |
| Q8  | Có muốn biết khách nào quay lại mua không? Có lưu SĐT khách không?                                              | UC17 (Could), BR-12             |
| Q9  | Ai trong cửa hàng được xem số liệu? Ai được sửa?                                                                | 3 vai trò, ma trận phân quyền   |
| Q10 | Hay xem trên điện thoại hay máy tính?                                                                           | NFR-12                          |
| Q11 | Có hệ thống/website riêng có CSDL hoặc API không?                                                               | Mức ưu tiên UC10–UC13           |
| Q12 | Nếu có công cụ này, điều gì khiến anh/chị **không dùng**?                                                       | Rủi ro chấp nhận, NFR usability |

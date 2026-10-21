# Chương 8. KIẾN THỨC NỀN & CÂU HỎI ÔN TẬP

> Chương này không nộp cho GVHD. Nó giúp bạn **hiểu vì sao** tài liệu được viết như vậy, để tự bảo vệ và tự làm cho các đồ án sau.

## 8.1 Mỗi sơ đồ trả lời một câu hỏi khác nhau

```
                        ┌──────────────── Góc nhìn NGOÀI hệ thống ───────────────┐
  Ngữ cảnh (H1)   : Hệ thống trao đổi với AI/CÁI GÌ bên ngoài?
  Use case (H9)   : AI dùng hệ thống để đạt MỤC TIÊU gì?
                        ├──────────────── Góc nhìn CẤU TRÚC ─────────────────────┤
  BFD (H8)        : Hệ thống GỒM những chức năng nào, phân cấp ra sao?
                        ├──────────────── Góc nhìn HÀNH VI ──────────────────────┤
  Activity (H3)   : Công việc chạy THEO THỨ TỰ nào, ai làm bước nào, rẽ nhánh ra sao?
  State (H7)      : Một ĐỐI TƯỢNG đi qua những TRẠNG THÁI nào, chuyển khi nào?
  Sequence (sau)  : Các THÀNH PHẦN gọi nhau theo thứ tự nào? (giai đoạn thiết kế)
                        └────────────────────────────────────────────────────────┘
```

| Sơ đồ    | Có tác nhân?  | Có thứ tự thời gian? | Lỗi hay gặp                                                               |
| -------- | ------------- | -------------------- | ------------------------------------------------------------------------- |
| BFD      | Không         | Không                | Vẽ thành luồng xử lý (có mũi tên thứ tự) → đó là activity, không phải BFD |
| Use case | **Có**        | **Không**            | Nối use case theo thứ tự "đăng nhập → nhập file → xem" như flowchart      |
| Activity | Có (swimlane) | **Có**               | Dùng `fork` cho rẽ nhánh điều kiện (lỗi #1 đã sửa ở QT-01)                |
| State    | Không         | Có (theo sự kiện)    | Nhầm _trạng thái_ (job `running`) với _hành động_ ("đang đọc file")       |

## 8.2 `include` · `extend` · `generalization`

| Quan hệ                   | Chiều mũi tên                       | Nghĩa                                                      | Câu kiểm tra nhanh                                          | Ví dụ trong đồ án                            |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| `«include»`               | Cơ sở **→** phần được gộp           | Cơ sở **luôn luôn** gọi phần được gộp                      | "Làm A mà **không** làm B được không?" Không được → include | UC05 → UC06 (nhập file luôn phải ánh xạ cột) |
| `«extend»`                | Phần mở rộng **→** cơ sở            | Phần mở rộng **thỉnh thoảng** chèn vào cơ sở, có điều kiện | "B có phải tuỳ chọn khi đang làm A?" Có → B extend A        | UC16 Xuất CSV → UC14 Dashboard               |
| Generalization (tác nhân) | Con **→** cha (tam giác rỗng ở cha) | Con làm được mọi thứ của cha                               | "Analyst có làm được mọi việc của Viewer không?"            | Admin → Analyst → Viewer                     |

> **Mẹo nhớ chiều mũi tên:** mũi tên chỉ về phía **bên "biết"** về bên kia. UC05 _biết_ nó cần UC06 → mũi tên từ UC05. UC14 _không biết_ có UC16; chính UC16 _biết_ nó gắn vào UC14 → mũi tên từ UC16.

## 8.3 Mười lỗi phân tích hay bị bắt khi bảo vệ

| #   | Lỗi                                                | Vì sao sai                                                   | Trong đồ án đã tránh thế nào                       |
| --- | -------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| 1   | Mọi use case đều `«include» Đăng nhập`             | Đăng nhập là **tiền điều kiện**, không phải một phần hành vi | Ghi ở "Tiền điều kiện" (§5.3)                      |
| 2   | Use case đặt tên theo màn hình ("Trang Dashboard") | Use case là **mục tiêu** (động từ + danh từ)                 | "Xem dashboard tổng quan"                          |
| 3   | Use case "Quản lý hệ thống" ôm mọi thứ             | Quá rộng, không đặc tả được                                  | Tách UC04, UC10, có phân rã                        |
| 4   | Vẽ tác vụ nền thành use case ("Refresh MV")        | Không có tác nhân với mục tiêu đó                            | Đưa vào BFD nhóm F7                                |
| 5   | Use case không có tác nhân nào nối tới             | Use case "mồ côi"                                            | Thêm tác nhân thời gian "Bộ lập lịch" cho UC13     |
| 6   | Yêu cầu không đo được ("hệ thống chạy nhanh")      | Không kiểm chứng được                                        | NFR-01: "< 2 s với 100.000 dòng, đo bằng DevTools" |
| 7   | Phân quyền chỉ ẩn nút ở giao diện                  | Gọi thẳng API vẫn được                                       | FR-09, NFR-06, ma trận quyền theo **API**          |
| 8   | KPI không định nghĩa chính xác                     | FE, BE, báo cáo mỗi nơi tính một kiểu                        | BR-01…BR-05 có công thức                           |
| 9   | Bỏ qua dữ liệu bẩn ("giả sử file đúng định dạng")  | Dữ liệu thật luôn bẩn                                        | Từ điển dữ liệu §3.5, BR-07…BR-16                  |
| 10  | Không có tiêu chí "xong"                           | Không biết khi nào dừng, không biết test gì                  | 63 AC dạng Given–When–Then                         |

## 8.4 Trắc nghiệm có bẫy

**Câu 1.** Nhân viên phân tích bấm "Đồng bộ ngay" trong khi lịch tự động của cùng nguồn đang chạy. Hệ thống nên:

- A. Tạo job thứ hai chạy song song cho nhanh
- B. Hủy job đang chạy, chạy job mới
- C. Trả 409 "Đang đồng bộ", không tạo job mới
- D. Xếp hàng job mới chạy ngay sau job hiện tại

<details><summary>Đáp án</summary>

**C.** A sai: hai job cùng đọc từ một mốc `last_synced_at` → lấy trùng dữ liệu, tốn tài nguyên; tệ hơn, job nào xong sau sẽ ghi đè mốc thời gian. B sai: job bị hủy giữa chừng phí công sức, và nếu đang ở bước load thì phải rollback. D _không sai về kỹ thuật_ nhưng vô ích: job vừa xong đã lấy dữ liệu mới nhất, job xếp hàng gần như không có gì để lấy, lại phức tạp hơn (cần hàng đợi). **Lỗi tư duy:** nghĩ "người dùng bấm thì phải chạy". Đúng ra mục tiêu của người dùng là _có dữ liệu mới_, và mục tiêu đó đang được job hiện tại đáp ứng.

</details>

**Câu 2.** File có đơn `DH01` gồm 3 sản phẩm. Lần nhập sau, file chỉ còn 2 dòng của `DH01` (1 sản phẩm bị khách trả). Sau khi nhập, `DH01` có:

- A. 3 sản phẩm (giữ dòng cũ, cập nhật 2 dòng)
- B. 5 sản phẩm (cộng thêm)
- C. 2 sản phẩm
- D. Lỗi vì số dòng khác lần trước

<details><summary>Đáp án</summary>

**C**, theo BR-06: nhập lại một đơn = **thay toàn bộ** dòng đơn. B là lỗi kinh điển khi chỉ `INSERT` mà không xoá dòng cũ: nhập lại file làm doanh thu tăng gấp đôi. A đòi hỏi khoá định danh cho _từng dòng_, trong khi file bán hàng thường không có. **Hệ quả cần nhớ:** file phải chứa đủ mọi dòng của một đơn. Nếu một file chỉ có một phần đơn thì sẽ làm mất dòng. Đây là trade-off đã chấp nhận và ghi vào hướng dẫn sử dụng.

</details>

**Câu 3.** Vì sao Số đơn **không** được tính bằng `SUM(order_count)` từ `mv_daily_sales` gộp theo (ngày, sản phẩm, kênh)?

<details><summary>Đáp án</summary>

Một đơn có 2 sản phẩm xuất hiện ở **2 dòng** của MV, mỗi dòng có `order_count = 1`, nên cộng lại thành 2. `COUNT(DISTINCT)` **không có tính cộng** (non-additive): biết số phần tử khác nhau của từng nhóm không suy ra được số phần tử khác nhau của hợp các nhóm. Doanh thu thì cộng được (additive). Đây là khái niệm cốt lõi khi thiết kế bảng tổng hợp và data warehouse: phải phân loại mỗi chỉ số là additive, semi-additive hay non-additive (ch.7 mục 3.2).

</details>

**Câu 4.** Lần đồng bộ bắt đầu lúc 23:00:00, kết thúc lúc 23:00:40. Một đơn ở nguồn được sửa lúc 23:00:20. Nếu đặt `last_synced_at = 23:00:40` thì sao?

<details><summary>Đáp án</summary>

Có thể **bỏ sót** đơn đó. Nếu job đã đọc qua bản ghi đó trước 23:00:20 thì nó lấy bản cũ, và lần sau chỉ lấy bản ghi `> 23:00:40` nên bỏ qua đơn sửa lúc 23:00:20. Đặt `= 23:00:00` (thời điểm bắt đầu) thì lần sau lấy lại cả khoảng 23:00:00–23:00:40: có thể **trùng** nhưng không **sót**, và trùng thì vô hại nhờ upsert. Nguyên tắc: _at-least-once + idempotent_ an toàn hơn _at-most-once_.

</details>

**Câu 5.** Phương án nào **không** bảo vệ được nguồn CSDL khỏi bị ghi dữ liệu?

- A. Tài khoản CSDL chỉ có quyền `SELECT`
- B. Kiểm tra câu lệnh bắt đầu bằng `SELECT`
- C. `SET TRANSACTION READ ONLY`
- D. Cả B và C đều không đủ nếu đứng một mình

<details><summary>Đáp án</summary>

**D.** B có thể bị vượt qua: `SELECT` gọi hàm có tác dụng phụ (`SELECT do_delete()`), hoặc `WITH x AS (DELETE … RETURNING *) SELECT …` trong PostgreSQL. C chặn ghi trong transaction đó, nhưng không chặn được các hàm chạy với quyền khác hoặc lệnh ngoài transaction. **Chỉ A là lớp bảo vệ thật**, vì quyền được CSDL nguồn tự kiểm soát. Đó là lý do BR-25 gọi A là "lớp chính", B và C là "lớp phụ" (defense in depth).

</details>

**Câu 6.** Admin đổi vai trò của Hoa từ analyst thành viewer. Hoa đang đăng nhập. Với thiết kế BR-21, Hoa bấm "Nhập dữ liệu" ngay sau đó thì:

- A. Vẫn nhập được tới khi token hết hạn (8 giờ)
- B. Bị 403 ngay

<details><summary>Đáp án</summary>

**B**, vì BR-21 quy định mỗi request đọc lại vai trò từ CSDL thay vì tin vai trò ghi trong JWT. Nếu chỉ tin JWT (thiết kế "stateless" thuần) thì kết quả là A, và đó là lỗ hổng: thu hồi quyền không có hiệu lực ngay. **Trade-off:** thêm 1 truy vấn theo khoá chính mỗi request (rất rẻ ở quy mô này) để đổi lấy khả năng thu hồi quyền tức thì.

</details>

**Câu 7.** Đơn đặt lúc **00:30 ngày 21/10** giờ Việt Nam. Lưu trong PostgreSQL là `2026-10-20 17:30:00+00`. Câu `GROUP BY ordered_at::date` (server đặt múi giờ UTC) xếp đơn vào ngày nào?

<details><summary>Đáp án</summary>

**20/10**, sai. Phải dùng `(ordered_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date` → 21/10 (BR-10, AC-05.6). Mọi đơn từ 00:00 đến 06:59 giờ VN đều bị lùi một ngày. Lỗi này không gây crash, chỉ làm số liệu sai lệch âm thầm, nên phải có test riêng.

</details>

**Câu 8.** Bạn đang lưỡng lự đặt "Lọc dữ liệu" là `include` hay `extend` của "Xem dashboard". Câu hỏi nào giúp quyết định?

<details><summary>Đáp án</summary>

"Người dùng có đạt được mục tiêu _xem tình hình kinh doanh_ **mà không cần đổi bộ lọc** không?" Có, vì dashboard hiển thị với bộ lọc mặc định 30 ngày → lọc là tuỳ chọn → `extend`. Ngược lại, nếu thiết kế bắt người dùng chọn khoảng thời gian trước khi thấy dữ liệu thì đó là `include`. **Cùng một chức năng có thể là include hay extend tuỳ theo thiết kế hành vi**, nên không có đáp án học thuộc.

</details>

## 8.5 Câu hỏi GVHD có thể hỏi & hướng trả lời

| Câu hỏi                                                      | Hướng trả lời (trỏ tới tài liệu)                                                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| "Đề tài này khác gì báo cáo có sẵn trong KiotViet/Sapo?"     | Hợp nhất **đa nguồn** + chuẩn hoá; §1.4                                                                                            |
| "Tại sao cần 3 vai trò, 2 không đủ à?"                       | Tách _người thao tác dữ liệu_ khỏi _người cấu hình hệ thống_ (thông tin đăng nhập CSDL) và _người chỉ xem_; ADR-0001, ma trận §5.4 |
| "Nhập lại cùng một file thì doanh thu có bị nhân đôi không?" | Không: BR-06, AC-05.2                                                                                                              |
| "Nhập nhầm file thì làm sao?"                                | UC08 + phân tích 3 phương án §2.5                                                                                                  |
| "Dữ liệu trên dashboard có real-time không?"                 | Không, trễ tới lần làm mới MV kế tiếp (sau mỗi lần nhập); NFR-17; đây là trade-off có chủ đích                                     |
| "Sao biết các yêu cầu đã đủ?"                                | Ma trận truy vết hai chiều + kiểm tra tự động §7.2                                                                                 |
| "Use case nào khó nhất, vì sao?"                             | UC05: dữ liệu bẩn (BR-07…BR-16), transaction, idempotent, xử lý nền                                                                |

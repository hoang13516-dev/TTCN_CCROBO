# Chương 8. KIẾN THỨC NỀN & CÂU HỎI ÔN TẬP

> Chương này không nộp cho GVHD. Nó giúp bạn **hiểu vì sao** tài liệu được viết như vậy, để tự bảo vệ và tự làm cho các đồ án sau.

## 8.1 Mỗi sơ đồ trả lời một câu hỏi khác nhau

```
                        ┌──────────────── Góc nhìn NGOÀI hệ thống ───────────────┐
  Ngữ cảnh (H1)   : Hệ thống trao đổi với AI/CÁI GÌ bên ngoài?
  Use case (H9)   : AI dùng hệ thống để đạt MỤC TIÊU gì?
                        ├──────────────── Góc nhìn CẤU TRÚC ─────────────────────┤
  BFD (H8)        : Hệ thống GỒM những chức năng nào, phân cấp ra sao?
  Star schema (H6): Dữ liệu được TỔ CHỨC thế nào để phân tích?
                        ├──────────────── Góc nhìn HÀNH VI ──────────────────────┤
  Activity (H3)   : Công việc chạy THEO THỨ TỰ nào, ai làm bước nào, rẽ nhánh ra sao?
  State (H7)      : Một ĐỐI TƯỢNG đi qua những TRẠNG THÁI nào, chuyển khi nào?
                        └────────────────────────────────────────────────────────┘
```

| Sơ đồ    | Có tác nhân?  | Có thứ tự thời gian? | Lỗi hay gặp                                                               |
| -------- | ------------- | -------------------- | ------------------------------------------------------------------------- |
| BFD      | Không         | Không                | Vẽ thành luồng xử lý (có mũi tên thứ tự) → đó là activity, không phải BFD |
| Use case | **Có**        | **Không**            | Nối use case theo thứ tự "đăng nhập → nhập file → xem" như flowchart      |
| Activity | Có (swimlane) | **Có**               | Dùng `fork` (song song) cho rẽ nhánh điều kiện                            |
| State    | Không         | Có (theo sự kiện)    | Nhầm _trạng thái_ (`running`) với _hành động_ ("đang đọc file")           |

## 8.2 OLTP vs OLAP, chuẩn hoá vs hình sao

```
 OLTP (POS, website)                      OLAP (hệ thống này)
 ─ ghi nhiều, từng đơn một                ─ đọc nhiều, gộp hàng nghìn dòng
 ─ chuẩn hoá 3NF: orders, order_items,     ─ hình sao: 1 fact + các dim
   products, categories, customers…        ─ câu hỏi: "doanh thu theo vùng × tháng × danh mục"
 ─ câu hỏi: "đơn DH001 gồm gì?"

                 dim_date ──┐
       dim_branch(vùng) ────┤
     dim_product(danh mục) ─┼── fact_sales (số đo: quantity, revenue, cost_amount)
           dim_customer ────┤
            dim_channel ────┘
```

| Tiêu chí                 | Chuẩn hoá (3NF)                                | Hình sao                                                |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------- |
| Mục tiêu                 | Không trùng lặp, ghi an toàn                   | Truy vấn tổng hợp đơn giản, nhanh                       |
| "Doanh thu theo vùng"    | JOIN order_items → orders → branches → regions | JOIN `fact_sales` → `dim_branch` (1 bước)               |
| Danh mục của sản phẩm    | Bảng `categories` riêng                        | Cột `category` ngay trong `dim_product` (chấp nhận lặp) |
| Thêm chiều phân tích mới | Sửa nhiều bảng, nhiều câu JOIN                 | Thêm 1 bảng `dim_*` + 1 cột khoá ở fact                 |
| Khi nào dùng             | Hệ thống giao dịch                             | Hệ thống báo cáo, BI                                    |

**Bốn câu phải trả lời được khi thiết kế hình sao** (Kimball):

1. **Quy trình nghiệp vụ** nào? → bán hàng.
2. **Hạt (grain)** là gì? → một sản phẩm trong một đơn. Hạt quyết định mọi thứ: chọn hạt "một đơn" thì không phân tích được theo sản phẩm.
3. **Chiều** nào? → ngày, chi nhánh, sản phẩm, khách, kênh.
4. **Số đo** nào? → số lượng, doanh thu, giá vốn (cộng được).

## 8.3 Chỉ số cộng được, bán cộng được, không cộng được

| Loại                 | Ví dụ trong đồ án                                   | Gộp từ nhóm con lên được không?                               |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| Cộng được (additive) | Doanh thu, Giá vốn, Lợi nhuận, Số lượng             | Được: tổng các chi nhánh = tổng toàn chuỗi                    |
| Không cộng được      | Số đơn, Số khách (`COUNT DISTINCT`), Tỷ lệ giữ chân | Không: một khách mua ở 2 chi nhánh bị đếm 2 lần               |
| Tỷ lệ                | Biên lợi nhuận, AOV                                 | Không lấy trung bình các tỷ lệ con; phải `Σ tử số ÷ Σ mẫu số` |

## 8.4 `include` · `extend` · `generalization`

| Quan hệ                   | Chiều mũi tên                       | Nghĩa                                                      | Câu kiểm tra nhanh                                          | Ví dụ trong đồ án         |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `«include»`               | Cơ sở **→** phần được gộp           | Cơ sở **luôn luôn** gọi phần được gộp                      | "Làm A mà **không** làm B được không?" Không được → include | UC06 → UC07; UC12 → UC15  |
| `«extend»`                | Phần mở rộng **→** cơ sở            | Phần mở rộng **thỉnh thoảng** chèn vào cơ sở, có điều kiện | "B có phải tuỳ chọn khi đang làm A?" Có → B extend A        | UC14 Drill-down → UC12    |
| Generalization (tác nhân) | Con **→** cha (tam giác rỗng ở cha) | Con làm được mọi **use case** của cha                      | "Analyst có làm được mọi việc của Manager không?"           | Admin → Analyst → Manager |

> **Bẫy của đồ án này:** generalization nói về **use case**, không nói về **phạm vi dữ liệu**. Analyst kế thừa UC12 của manager nhưng xem toàn chuỗi, còn manager chỉ xem chi nhánh mình. Phạm vi dữ liệu là quy tắc nghiệp vụ (BR-15), không vẽ được bằng quan hệ trên sơ đồ use case.

## 8.5 Trắc nghiệm có bẫy

**Câu 1.** Chi nhánh A: doanh thu 100 triệu, biên lợi nhuận 40 %. Chi nhánh B: doanh thu 900 triệu, biên 10 %. Biên lợi nhuận toàn chuỗi là:

- A. 25 % B. 13 % C. 50 % D. Không tính được

<details><summary>Đáp án</summary>

**B.** Lợi nhuận = 40 + 90 = 130 triệu; doanh thu = 1.000 triệu → 13 %. A là lỗi kinh điển: **lấy trung bình cộng các tỷ lệ** mà quên trọng số. Đây là lý do API trả `Σ lợi nhuận` và `Σ doanh thu` rồi mới chia, và không bao giờ lấy trung bình cột `margin` của các nhóm con (§8.3).

</details>

**Câu 2.** Kỳ trước có khách {A, B, C, D}; kỳ này có {A, B, E, F, G} và 10 đơn khách lẻ. Tỷ lệ giữ chân là:

- A. 40 % B. 50 % C. 2/15 D. 2/7

<details><summary>Đáp án</summary>

**B.** `|P ∩ C| ÷ |P|` = |{A, B}| ÷ |{A, B, C, D}| = 2/4. A là nhầm mẫu số thành `|C|` (2/5): đó là "tỷ lệ khách cũ trong khách kỳ này", một chỉ số khác. Khách lẻ không có mã nên không thể biết họ có quay lại hay không → **loại khỏi** cả hai tập (BR-04).

</details>

**Câu 3.** File có đơn `DH01` gồm 3 sản phẩm. Lần nhập sau, file chỉ còn 2 dòng của `DH01`. Sau khi nhập, `DH01` có:

- A. 3 sản phẩm B. 5 sản phẩm C. 2 sản phẩm D. Lỗi vì số dòng khác lần trước

<details><summary>Đáp án</summary>

**C**, theo BR-06: nhập lại một đơn = **xoá mọi dòng cũ rồi chèn dòng mới**. B là lỗi kinh điển khi chỉ `INSERT` mà không xoá: nhập lại file làm doanh thu tăng gấp đôi. A đòi hỏi khoá định danh cho _từng dòng_, mà file bán hàng thường không có. **Hệ quả:** file phải chứa đủ mọi dòng của một đơn (ghi trong hướng dẫn sử dụng).

</details>

**Câu 4.** Manager chi nhánh HN01 sửa URL thành `?branch=HCM01`. Hệ thống đúng phải:

- A. Trả 403 B. Trả dữ liệu HCM01 C. Trả dữ liệu HN01 D. Trả dữ liệu cả hai

<details><summary>Đáp án</summary>

**C** (BR-15, AC-13.4). B là lỗ hổng **IDOR**: tin tham số từ client. A an toàn nhưng làm hỏng link chia sẻ: giám đốc gửi link `?branch=HCM01` cho mọi quản lý thì quản lý HN01 nhận lỗi thay vì thấy số của mình. Thiết kế "ghi đè phạm vi ở server" vừa an toàn vừa không làm hỏng trải nghiệm. **Nguyên tắc:** phân quyền dữ liệu (row-level) phải nằm ở server, trước câu SQL.

</details>

**Câu 5.** Lần đồng bộ bắt đầu 09:00:00, kết thúc 09:00:40. Một đơn ở nguồn được sửa lúc 09:00:20. Nếu đặt `last_synced_at = 09:00:40` thì sao?

<details><summary>Đáp án</summary>

Có thể **bỏ sót** đơn đó: nếu đã đọc qua bản ghi trước 09:00:20 thì lấy bản cũ, và lần sau chỉ lấy bản ghi `> 09:00:40`. Đặt `= 09:00:00` (thời điểm bắt đầu) thì lần sau lấy lại cả khoảng 09:00:00–09:00:40: có thể **trùng** nhưng không **sót**, và trùng vô hại nhờ nạp idempotent. Nguyên tắc: _at-least-once + idempotent_ an toàn hơn _at-most-once_.

</details>

**Câu 6.** Đơn đặt lúc **00:30 ngày 21/10** giờ Việt Nam, lưu là `2026-10-20 17:30:00+00`. Nếu tính `date_key` bằng `ordered_at::date` trên server đặt múi giờ UTC thì đơn rơi vào ngày nào?

<details><summary>Đáp án</summary>

**20/10**, sai. Phải dùng `(ordered_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date` → 21/10 (BR-10, AC-06.4). Mọi đơn từ 00:00 đến 06:59 giờ VN bị lùi một ngày. Lỗi không gây crash, chỉ làm số liệu sai âm thầm, nên phải có test riêng.

</details>

**Câu 7.** Quy tắc z-score dùng trung bình và độ lệch chuẩn của **28 ngày trước** ngày đang xét. Vì sao không dùng 28 ngày **bao gồm** chính ngày đó?

<details><summary>Đáp án</summary>

Nếu ngày đó có doanh thu bất thường rất lớn, nó kéo trung bình lên và **làm tăng độ lệch chuẩn**, nên z-score của chính nó bị nhỏ đi và có thể không bị phát hiện (hiện tượng _masking_). Loại ngày đang xét khỏi cửa sổ tham chiếu là quy tắc chung của phát hiện bất thường. Chọn 28 ngày (4 tuần) để cửa sổ chứa đủ số ngày cuối tuần như nhau, tránh nhầm "Chủ Nhật bán chạy" là bất thường.

</details>

**Câu 8.** Bạn lưỡng lự đặt "Xem cảnh báo" là `include` hay `extend` của "Xem dashboard". Câu hỏi nào giúp quyết định?

<details><summary>Đáp án</summary>

"Người dùng có đạt mục tiêu của dashboard **mà không** chạy phần cảnh báo không?" Theo thiết kế này, mở dashboard **luôn** đánh giá cảnh báo, vì mục tiêu G5 là _biết sớm_, không phụ thuộc người dùng nhớ bấm → `include`. Nếu thiết kế là "bấm nút Kiểm tra bất thường" thì là `extend`. **Cùng một chức năng có thể là include hay extend tuỳ thiết kế hành vi**, nên không có đáp án học thuộc.

</details>

## 8.6 Câu hỏi GVHD có thể hỏi & hướng trả lời

| Câu hỏi                                                            | Hướng trả lời (trỏ tới tài liệu)                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| "Star schema của em ở đâu? Fact là gì, grain là gì?"               | `fact_sales`, grain = 1 sản phẩm trong 1 đơn; 5 chiều; §8.2, ADR-0003                                       |
| "Sao không dùng materialized view / bảng tổng hợp?"                | 100.000 dòng + index đã < 500 ms (đo ở S2.1/S6.3); bảng tổng hợp là bước mở rộng khi dữ liệu lớn (ADR-0004) |
| "Phân quyền xem báo cáo thể hiện ở đâu?"                           | 3 vai + phạm vi chi nhánh ghi đè ở server; ADR-0002, AC-13.4, Câu 4 ở trên                                  |
| "Lợi nhuận tính thế nào? Giá vốn thay đổi theo thời gian thì sao?" | Giá vốn tại thời điểm bán lưu trong từng dòng fact, nên đổi giá vốn sau này không làm sai số cũ; BR-02      |
| "Cảnh báo bất thường có dùng AI không?"                            | Không; quy tắc ngưỡng + z-score, giải thích được và kiểm thử được; ML là hướng phát triển (§3.1.7)          |
| "Nhập lại cùng một file thì doanh thu có bị nhân đôi không?"       | Không: BR-06, AC-06.2                                                                                       |
| "Muốn thêm nguồn CSDL thì sửa những gì?"                           | Thêm 1 extractor trả async iterable các dòng; Transform/Load giữ nguyên (NFR-13)                            |
| "Use case nào khó nhất, vì sao?"                                   | UC06: dữ liệu bẩn (BR-07…BR-14), transaction, idempotent                                                    |

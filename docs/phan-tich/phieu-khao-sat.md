# Phiếu khảo sát hiện trạng — CN-019

> Dùng để phỏng vấn 1–2 chủ shop hoặc nhân viên thật (15–20 phút/người). Bản này mở rộng mục [1.7](01-khao-sat-va-phan-tich-de-tai.md#17-phiếu-khảo-sát-dùng-để-xác-nhận-hiện-trạng) và giữ nguyên mã câu hỏi **Q1–Q12** để đối chiếu với các giả định (A1–A4, P1–P3, BR-xx, O-xx).

## Thông tin buổi phỏng vấn

| Mục                                 | Ghi chú                                                |
| ----------------------------------- | ------------------------------------------------------ |
| Ngày, giờ                           |                                                        |
| Người phỏng vấn                     |                                                        |
| Vai trò người được hỏi              | ☐ Chủ shop  ☐ Nhân viên bán hàng  ☐ Kế toán  ☐ Khác: … |
| Quy mô đơn/tháng (ước lượng)        | ☐ < 100  ☐ 100–500  ☐ 500–2.000  ☐ > 2.000             |
| Số kênh bán đang hoạt động          |                                                        |
| Đồng ý ghi âm / ghi chú (có / không) |                                                        |

> **Lưu ý đạo đức:** không ghi tên, SĐT, địa chỉ của khách hoặc của người được hỏi vào phiếu. Nếu nhận được file mẫu, xoá các cột thông tin cá nhân trước khi lưu vào repo.

---

## Phần A — Kênh bán và phần mềm

**Q1. Anh/chị bán trên những kênh nào? Kênh nào nhiều đơn nhất?**

☐ Shopee  ☐ TikTok Shop  ☐ Lazada  ☐ Website riêng  ☐ Cửa hàng trực tiếp (POS)  ☐ Khác: …
Kênh nhiều đơn nhất: …

_Kiểm chứng:_ danh sách bảng `channels`, ưu tiên P1.

**Q2. Anh/chị đang dùng phần mềm bán hàng nào? Có xuất được Excel/CSV không?**

☐ KiotViet  ☐ Sapo  ☐ Haravan  ☐ Không dùng phần mềm, ghi sổ/Excel  ☐ Khác: …
Xuất được file: ☐ Có  ☐ Không  ☐ Không chắc

- Xin **1 file mẫu**, đã xoá tên/SĐT khách. Ghi: tên file, số dòng, số cột (không lưu dữ liệu thật vào repo).

_Kiểm chứng:_ định dạng file (O-01), giả định A1 và A2.

**Q11. Có hệ thống hoặc website riêng có CSDL hoặc API không?**

☐ Không  ☐ Có CSDL (MySQL, PostgreSQL, …)  ☐ Có API  ☐ Không biết
Nếu có: quyền truy cập để đọc, cho phép không? ☐ Có  ☐ Không  ☐ Cần hỏi thêm

_Kiểm chứng:_ mức ưu tiên UC10–UC13 (xem O-02).

---

## Phần B — Dữ liệu đơn hàng và mã

**Q3. Mỗi đơn trong file có mã đơn không? Một đơn nhiều sản phẩm thì file thể hiện thế nào?**

☐ Có mã đơn riêng  ☐ Không có mã đơn  ☐ Không chắc
Một đơn nhiều sản phẩm:
☐ Nhiều dòng, mỗi dòng một sản phẩm, lặp lại mã đơn
☐ Một dòng, nhiều sản phẩm gộp trong một ô
☐ Khác: …

_Câu hỏi phụ:_ "Nếu hai kênh cùng có mã `HD0001`, anh/chị có coi đó là hai đơn khác nhau không?" (kiểm chứng O-03)

_Kiểm chứng:_ BR-07, A1, O-03.

**Q4. Sản phẩm có mã SKU hoặc mã hàng không? Mã có giống nhau giữa POS và sàn không?**

☐ Có SKU ổn định  ☐ Có mã nhưng hay đổi  ☐ Không có mã  ☐ Không chắc
Giống nhau giữa các kênh: ☐ Có  ☐ Không  ☐ Một phần

_Kiểm chứng:_ A2, P3.

---

## Phần C — Báo cáo và chỉ số

**Q5. Anh/chị làm báo cáo bao lâu một lần? Mất bao lâu? Ai làm?**

- Tần suất: ☐ Mỗi ngày  ☐ Mỗi tuần  ☐ Mỗi tháng  ☐ Khi cần
- Thời gian mỗi lần: …  giờ/phút
- Người làm: …

_Kiểm chứng:_ mục tiêu G1 (hiện trạng ước tính 3–6 giờ/kỳ), P2. **Ghi con số thực tế, không ghi con số dự đoán.**

**Q6. Anh/chị hay xem những con số nào nhất?**

☐ Doanh thu  ☐ Số đơn  ☐ Sản phẩm bán chạy  ☐ Doanh thu theo kênh  ☐ Doanh thu theo thời gian
☐ Khách quay lại  ☐ Tồn kho  ☐ Khác: …

Xếp hạng 3 con số quan trọng nhất: 1) … 2) … 3) …

_Kiểm chứng:_ chọn KPI, FR-30…FR-35.

**Q7. Có tính đơn hủy và đơn hoàn vào doanh thu không? Giảm giá và voucher ghi ở đâu?**

- Đơn hủy: ☐ Không tính  ☐ Tính riêng  ☐ Khác: …
- Đơn hoàn: ☐ Không tính  ☐ Trừ khỏi doanh thu  ☐ Khác: …
- Giảm giá sản phẩm: ☐ Ghi trong file  ☐ Không ghi
- Voucher toàn đơn và phí vận chuyển: ☐ Ghi trong file  ☐ Không ghi  ☐ Tính riêng

_Kiểm chứng:_ BR-01, O-04. Nếu voucher toàn đơn không có trong file, doanh thu hệ thống có thể **cao hơn** tiền thực nhận. Ghi lại để đưa vào phần hạn chế.

---

## Phần D — Người dùng, quyền và thiết bị

**Q8. Anh/chị có muốn biết khách nào quay lại mua không? Có lưu SĐT khách không?**

- Quan tâm khách quay lại: ☐ Có  ☐ Không  ☐ Chưa nghĩ tới
- Có lưu SĐT khách: ☐ Có  ☐ Không
- Nếu có, sẵn sàng để hệ thống dùng SĐT đã băm (hash) để nhận diện không? ☐ Có  ☐ Không  ☐ Cần hỏi thêm

_Kiểm chứng:_ UC17 (Could), BR-12.

**Q9. Ai trong cửa hàng được xem số liệu? Ai được sửa?**

| Vai trò                  | Được xem | Được sửa | Được nhập file |
| ------------------------ | -------- | -------- | -------------- |
| Chủ shop / quản lý       | ☐        | ☐        | ☐              |
| Nhân viên bán hàng       | ☐        | ☐        | ☐              |
| Kế toán                  | ☐        | ☐        | ☐              |

_Kiểm chứng:_ 3 vai trò, ma trận phân quyền.

**Q10. Anh/chị hay xem báo cáo trên điện thoại hay máy tính?**

- Xem báo cáo: ☐ Điện thoại  ☐ Máy tính  ☐ Cả hai
- Nhập liệu: ☐ Máy tính  ☐ Điện thoại  ☐ Cả hai

_Kiểm chứng:_ NFR-12, giả định A4 (màn hình nhập liệu không cần tối ưu cho mobile).

---

## Phần E — Rào cản

**Q12. Nếu có công cụ này, điều gì khiến anh/chị không dùng?**

☐ Mất thời gian học  ☐ Không tin số liệu tự động  ☐ Phải thay đổi cách ghi sổ  ☐ Chi phí  ☐ Dữ liệu cá nhân của khách  ☐ Khác: …

Lời người được hỏi (trích nguyên văn nếu có):
> …

_Kiểm chứng:_ rủi ro chấp nhận, NFR về khả năng sử dụng.

---

## Phần F — Đối chiếu giả định (người phỏng vấn điền sau buổi hỏi)

Đánh dấu từng giả định: **Xác nhận** (đúng như giả định), **Bác bỏ** (sai, ghi lại thực tế), hoặc **Chưa rõ** (cần hỏi thêm hoặc xin file).

| Mã  | Giả định                                                                 | Kết luận                              | Bằng chứng (câu trả lời / file) |
| --- | ------------------------------------------------------------------------ | ------------------------------------- | ------------------------------- |
| A1  | Mỗi đơn có mã đơn duy nhất trong nguồn của nó                            | ☐ Xác nhận  ☐ Bác bỏ  ☐ Chưa rõ       |                                 |
| A2  | Mỗi sản phẩm có SKU ổn định                                              | ☐ Xác nhận  ☐ Bác bỏ  ☐ Chưa rõ       |                                 |
| A3  | Hai nguồn không dùng chung mã đơn cho hai đơn khác nhau                  | ☐ Xác nhận  ☐ Bác bỏ  ☐ Chưa rõ       |                                 |
| A4  | Người dùng nhập liệu trên máy tính, điện thoại chỉ để xem                | ☐ Xác nhận  ☐ Bác bỏ  ☐ Chưa rõ       |                                 |
| G1  | Hiện tại mất 3–6 giờ mỗi kỳ để tổng hợp số liệu                          | Thực tế: ………… giờ/kỳ                 |                                 |

---

## Phần G — Sau buổi phỏng vấn

- [ ] Điền phần F, đánh dấu câu trả lời **khác giả định** và báo lại để điều chỉnh yêu cầu.
- [ ] Ghi nhận file mẫu (nếu có) vào `docs/phan-tich/` sau khi đã xoá dữ liệu cá nhân.
- [ ] Cập nhật bảng O-01 đến O-06 trong `docs/phan-tich/07-truy-vet-va-tu-kiem-tra.md`.
- [ ] Dán phiếu đã điền (không có thông tin cá nhân) vào phụ lục báo cáo.

# Phiếu khảo sát hiện trạng - CN-019

> Dùng để phỏng vấn 1-2 chủ/quản lý cửa hàng hoặc nhân viên văn phòng (15-20 phút/người). Mỗi câu ghi rõ giả định nào trong phân tích nó kiểm chứng (A1-A5, G1, BR-xx). Không bắt buộc; nếu không phỏng vấn được, báo cáo ghi rõ phần hiện trạng là giả định (O-16).

## Thông tin buổi phỏng vấn

| Mục                          | Ghi chú                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| Ngày, giờ                    |                                                                      |
| Vai trò người được hỏi       | [ ] Chủ/giám đốc [ ] Quản lý cửa hàng [ ] Kế toán/văn phòng [ ] Khác |
| Số chi nhánh / số tỉnh       |                                                                      |
| Quy mô đơn/tháng (ước lượng) | [ ] < 500 [ ] 500-2.000 [ ] 2.000-10.000 [ ] > 10.000                |
| Đồng ý ghi chú (có / không)  |                                                                      |

> **Lưu ý đạo đức:** không ghi tên, SĐT, địa chỉ của khách hoặc của người được hỏi. File mẫu nhận được phải xoá cột thông tin cá nhân trước khi lưu vào repo.

## Phần A - Chi nhánh, kênh bán, phần mềm

**Q1. Doanh nghiệp có bao nhiêu chi nhánh, ở những tỉnh nào? Bán qua những kênh nào?**
Chi nhánh/tỉnh: … Kênh: [ ] Tại quầy [ ] Website [ ] Shopee [ ] TikTok Shop [ ] Facebook/Zalo [ ] Khác: …
_Kiểm chứng:_ `dim_branch`, `dim_channel`, giả định A4 (đơn online gắn với một chi nhánh xử lý).

**Q2. Mỗi chi nhánh dùng phần mềm bán hàng nào? Xuất được Excel/CSV không?**
[ ] KiotViet [ ] Sapo [ ] Haravan [ ] Excel tự làm [ ] Khác: … - xin **1 file mẫu đã xoá thông tin khách**.
_Kiểm chứng:_ tên cột thật cho từ điển §3.5.3.

**Q3. Website/kênh online có API để lấy đơn không?** [ ] Có [ ] Không [ ] Không biết
_Kiểm chứng:_ ưu tiên UC10, UC11.

## Phần B - Dữ liệu đơn hàng

**Q4. Mỗi đơn có mã đơn không? Một đơn nhiều sản phẩm thì file thể hiện thế nào?**
[ ] Nhiều dòng, lặp lại mã đơn [ ] Một dòng, gộp sản phẩm trong một ô [ ] Khác: …
_Câu phụ:_ "Hai chi nhánh có thể cùng có mã `HD0001` không?"
_Kiểm chứng:_ A1, BR-06 (đơn xác định bởi nguồn + mã đơn), BR-07.

**Q5. Sản phẩm có SKU không? SKU có giống nhau giữa các chi nhánh và kênh online không?**
_Kiểm chứng:_ A2.

**Q6. File xuất có giá vốn (giá nhập) từng dòng không? Nếu không, giá vốn nằm ở đâu?**
_Kiểm chứng:_ A3, BR-02.

**Q7. Đơn hủy, đơn hoàn có tính vào doanh thu không? Giảm giá/voucher ghi ở đâu?**
_Kiểm chứng:_ BR-01, BR-08; voucher toàn đơn nằm ngoài phạm vi (§3.1.7).

## Phần C - Báo cáo, chỉ số, cảnh báo

**Q8. Làm báo cáo bao lâu một lần, mất bao lâu, ai làm?** Thời gian mỗi lần: … giờ.
_Kiểm chứng:_ G1 (giả định 3-6 giờ/kỳ). **Ghi con số thực tế.**

**Q9. Hay xem những con số nào? Xếp hạng 3 con số quan trọng nhất.**
[ ] Doanh thu [ ] Lợi nhuận [ ] Số đơn [ ] Giá trị đơn trung bình [ ] Khách quay lại [ ] Sản phẩm bán chạy [ ] So sánh chi nhánh/vùng
_Kiểm chứng:_ 6 KPI của FR-19.

**Q10. Khi nào thì anh/chị coi là "bất thường, cần xử lý ngay"?** (vd. doanh thu giảm bao nhiêu %, biên lãi dưới bao nhiêu %)
_Kiểm chứng:_ ngưỡng mặc định R1-R5 (BR-20).

## Phần D - Người dùng và quyền

**Q11. Quản lý mỗi chi nhánh có được xem số liệu của chi nhánh khác không? Ai được nhập dữ liệu?**

| Vai trò             | Xem chi nhánh mình | Xem toàn chuỗi | Nhập dữ liệu | Xuất báo cáo |
| ------------------- | ------------------ | -------------- | ------------ | ------------ |
| Chủ / giám đốc      | [ ]                | [ ]            | [ ]          | [ ]          |
| Kế toán / văn phòng | [ ]                | [ ]            | [ ]          | [ ]          |
| Quản lý chi nhánh   | [ ]                | [ ]            | [ ]          | [ ]          |

_Kiểm chứng:_ 3 vai trò, BR-15, ma trận §5.4.

**Q12. Điều gì khiến anh/chị không dùng công cụ này?** [ ] Mất thời gian học [ ] Không tin số liệu tự động [ ] Phải đổi cách ghi sổ [ ] Lộ dữ liệu [ ] Khác: …
_Kiểm chứng:_ rủi ro chấp nhận, NFR-08.

## Phần E - Đối chiếu giả định (điền sau buổi hỏi)

| Mã  | Giả định                                           | Kết luận                            | Bằng chứng |
| --- | -------------------------------------------------- | ----------------------------------- | ---------- |
| A1  | Mỗi đơn có mã duy nhất trong nguồn của nó          | [ ] Xác nhận [ ] Bác bỏ [ ] Chưa rõ |            |
| A2  | SKU ổn định, giống nhau giữa các nguồn             | [ ] Xác nhận [ ] Bác bỏ [ ] Chưa rõ |            |
| A3  | Dữ liệu xuất có giá vốn từng dòng                  | [ ] Xác nhận [ ] Bác bỏ [ ] Chưa rõ |            |
| A4  | Mỗi đơn (kể cả online) gắn với một chi nhánh       | [ ] Xác nhận [ ] Bác bỏ [ ] Chưa rõ |            |
| A5  | Nhập liệu trên máy tính, điện thoại chủ yếu để xem | [ ] Xác nhận [ ] Bác bỏ [ ] Chưa rõ |            |
| G1  | Hiện mất 3-6 giờ mỗi kỳ để tổng hợp                | Thực tế: … giờ/kỳ                   |            |

Sau buổi hỏi: giả định nào bị **bác bỏ** → sửa `03-dac-ta-yeu-cau.md` trước, rồi cập nhật O-16 trong `07-…` §5.

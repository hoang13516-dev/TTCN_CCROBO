# Phân tích nghiệp vụ - CN-019 Dashboard phân tích dữ liệu bán hàng

> Tài liệu ghi lại các quyết định đã chốt trong quá trình phân tích, kèm lý do.

## 1. Phạm vi và nghiệp vụ

Phạm vi: Xây dựng hệ thống quy mô nhỏ -> vừa. Gồm 5 nghiệp vụ, trong đó quy trình ETL là nghiệp vụ chính.

| STT | Nghiệp vụ                              | Mô tả                                                                                                                       |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Nhập dữ liệu                           | Người nhập đưa dữ liệu vào từ file CSV/Excel hoặc cơ sở dữ liệu. Hệ thống đọc và hiển thị bản xem trước.                    |
| 2   | Làm sạch/chuẩn hóa dữ liệu và xác nhận | Hệ thống kiểm tra ngày, số tiền, mã sản phẩm, mã khách hàng và dòng trùng. Người nhập sửa hoặc xác nhận trên bản xem trước. |
| 3   | Nạp vào kho dữ liệu                    | Dữ liệu đã xác nhận được ghi vào star schema (bảng sự kiện và bảng chiều).                                                  |
| 4   | Quản lý lịch sử nhập                   | Quản trị viên xem từng lần nhập: ai nhập, lúc nào, số dòng thành công, thất bại, trùng.                                     |
| 5   | Xem dashboard                          | Người đọc dữ liệu lọc theo thời gian, chi nhánh, danh mục và xem các KPI.                                                   |

**Lý do chọn 5 nghiệp vụ:** phù hợp quy mô đồ án, và tập trung vào chuỗi ETL là phần cốt lõi của đề tài.

**Chức năng bổ trợ:** đăng nhập và phân quyền, cảnh báo chỉ số bất thường, xuất báo cáo PDF/Excel. Các chức năng này KHÔNG được xem là nghiệp vụ riêng.

## 2. Vai trò

| Vai trò                                   | Quyền                                                  |
| ----------------------------------------- | ------------------------------------------------------ |
| Quản trị viên                             | Quản lý toàn hệ thống, xem lịch sử nhập (nghiệp vụ 4). |
| Nhân viên nghiệp vụ (người nhập)          | Nhập liệu và xử lý dữ liệu (nghiệp vụ 1, 2, 3.)        |
| Chuyên viên phân tích (người đọc dữ liệu) | Xem dashboard (nghiệp vụ 5).                           |

## 3. Nguồn dữ liệu và định dạng

- **Nguồn bắt buộc:** file CSV/Excel và cơ sở dữ liệu. API hướng sau này (không thêm ở phạm vi hiện tại).
- **Ngày:** ô Excel chứa ngày thật thì được nhận. Ô dạng chữ phải đúng DD/MM/YYYY. Ngày phải có thật (ví dụ 31/02 là sai).
- **Số tiền:** cho phép có số âm, vì có nghiệp vụ hoàn trả (sản phẩm).

**Lý do:** ô ngày thật trong Excel sẽ rõ ràng, nên không cần ép người nhập sửa file. Ô dạng chữ có thể bị đọc sai giữa MM/DD và DD/MM, nên phải theo một chuẩn cố định để khi nhập liệu hạn chế lỗi.

## 4. Quy tắc làm sạch/chuẩn hóa dữ liệu và xác nhận

| Tình huống                                  | Xử lý                                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Mã sản phẩm không tồn tại                   | Đánh dấu chưa xác nhận. Người nhập điền mã đúng khi xác nhận.                            |
| Mã khách hàng không hợp lệ hoặc thiếu       | Đánh dấu chưa xác nhận. Người nhập điền khi xác nhận.                                    |
| Dòng trùng trong cùng file                  | Đánh dấu. Người nhập quyết định bỏ hay giữ.                                              |
| Dòng trùng với dữ liệu đã nạp trong kho     | Bỏ dòng trùng. Hiển thị dòng đó trong bản xem trước.                                     |
| Dòng HOÀN không tìm thấy dòng gốc           | Đánh dấu chưa xác nhận. Người nhập chọn dòng gốc đúng hoặc xác nhận là hoàn trả độc lập. |
| Nạp thất bại (từ chối file, hủy, gián đoạn) | Coi như thất bại trọn vẹn, không ghi dữ liệu nào vào kho.                                |

**Ghi chú:**

- Dòng chưa xác nhận vẫn được xác nhận file để nạp, và vẫn tính vào doanh thu. Dashboard hiển thị riêng tổng doanh thu của phần chưa xác nhận.
- Tìm dòng gốc của hoàn trả phải xét cả file đang nhập lẫn kho, không phụ thuộc thứ tự dòng trong file.

**Lý do không đoán mã thiếu:** việc đoán (ví dụ dựa vào dòng liền kề) có thể gộp doanh số của hai sản phẩm khác nhau mà không ai biết. Đánh dấu và để người nhập xác nhận giữ được độ tin cậy của số liệu.

## 5. Mô hình dữ liệu (star schema)

- **Bảng sự kiện:** mỗi dòng là một sản phẩm trong một đơn hàng.
- **Khóa một dòng:** mã đơn + số thứ tự dòng trong đơn.
- **Bảng chiều:** thời gian, chi nhánh, sản phẩm, nhóm hàng, khách hàng.
- **Bảng sản phẩm:** một bảng duy nhất, có cột trạng thái (đã xác nhận / chưa xác nhận).
- **Bảng nhóm hàng:** lưu tỷ lệ biên lợi nhuận của từng nhóm.

**Lý do chọn grain này:** KPI sản phẩm bán chạy, giá trị đơn trung bình và kiểm trùng theo đơn đều cần chi tiết từng sản phẩm trong đơn. Khóa mã đơn + số dòng cho phép cả kiểm trùng lẫn tham chiếu hoàn trả đúng dòng gốc.

## 6. Hoàn trả

- File có cột loại giao dịch: BÁN hoặc HOÀN.
- Dòng HOÀN ghi số âm và tham chiếu đến dòng BÁN gốc bằng khóa mã đơn + số dòng.
- Quy tắc dấu đã được chốt: dòng HOÀN phải có số âm, dòng BÁN phải có số dương.

**Lý do:** cột loại giao dịch làm rõ ý nghĩa của số âm. Tham chiếu đến dòng gốc cho phép tính doanh thu thuần đúng cho từng đơn.

## 7. KPI

| KPI                       | Ghi chú                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Doanh thu                 | Gồm cả dòng chưa xác nhận, hiển thị riêng phần này.                                              |
| Lợi nhuận                 | Ước lượng theo biên lợi nhuận cố định của nhóm hàng. Đây là giả định, phải ghi rõ trong báo cáo. |
| Lợi nhuận theo nhóm hàng  | Cho biết nguồn lợi nhuận đến từ nhóm hàng nào.                                                   |
| Giá trị đơn trung bình    | Doanh thu chia cho số mã đơn.                                                                    |
| Tỷ lệ giữ chân khách hàng | Cần mã khách hàng trong file. Dòng thiếu mã khách hàng ở trạng thái chưa xác nhận.               |
| Sản phẩm bán chạy         | Đo theo doanh thu.                                                                               |

**Lý do có thêm KPI lợi nhuận theo nhóm hàng:** KPI sản phẩm bán chạy theo doanh thu không cho biết lợi nhuận đến từ đâu, vì biên lợi nhuận khác nhau giữa các nhóm hàng.

## 8. Ngoài phạm vi

- API là nguồn dữ liệu, để sau.
- Tỷ lệ biên lợi nhuận theo nhóm hàng là giả định, không phải giá vốn thực tế.

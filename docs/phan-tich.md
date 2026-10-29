# Phân tích nghiệp vụ - CN-019 Dashboard phân tích dữ liệu bán hàng

> Tài liệu ghi lại các quyết định đã chốt trong quá trình phân tích, kèm lý do. Gồm ba phần: đối tượng của hệ thống, phân tích chi tiết theo từng đối tượng, và luồng xử lý của từng nghiệp vụ.

## 1. Phạm vi và nghiệp vụ

Phạm vi: Xây dựng hệ thống quy mô nhỏ -> vừa. Gồm 5 nghiệp vụ, trong đó quy trình ETL là nghiệp vụ chính.

| STT | Nghiệp vụ                              | Mô tả                                                                                                                       |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Nhập dữ liệu                           | Người nhập đưa dữ liệu vào từ file CSV/Excel hoặc cơ sở dữ liệu. Hệ thống đọc và hiển thị bản xem trước.                    |
| 2   | Làm sạch/chuẩn hóa dữ liệu và xác nhận | Hệ thống kiểm tra ngày, số tiền, mã sản phẩm, mã khách hàng và dòng trùng. Người nhập sửa hoặc xác nhận trên bản xem trước. |
| 3   | Nạp vào kho dữ liệu                    | Dữ liệu đã xác nhận được ghi vào star schema (bảng sự kiện và bảng chiều).                                                  |
| 4   | Quản lý lịch sử nhập                   | Quản trị viên xem từng lần nhập: ai nhập, lúc nào, số dòng thành công, thất bại, trùng.                                     |
| 5   | Xem dashboard                          | Người đọc dữ liệu lọc theo thời gian, chi nhánh, nhóm hàng và xem các KPI.                                                  |

**Lý do chọn 5 nghiệp vụ:** phù hợp quy mô đồ án, và tập trung vào chuỗi ETL là phần cốt lõi của đề tài.

**Chức năng bổ trợ:** đăng nhập và phân quyền, cảnh báo chỉ số bất thường, xuất báo cáo PDF/Excel. Các chức năng này KHÔNG được xem là nghiệp vụ riêng.

## 2. Đối tượng của hệ thống

Đối tượng của hệ thống là ba vai trò:

| Vai trò                                   | Nghiệp vụ liên quan     |
| ----------------------------------------- | ----------------------- |
| Quản trị viên                             | 4 (và cấu hình kết nối) |
| Nhân viên nghiệp vụ (người nhập)          | 1, 2, 3                 |
| Chuyên viên phân tích (người đọc dữ liệu) | 5                       |

## 3. Phân tích chi tiết theo đối tượng

### 3.1. Quản trị viên

- **Quản lý toàn hệ thống.**
- **Cấu hình kết nối cơ sở dữ liệu:** thiết lập kết nối tới các nguồn để nhân viên nghiệp vụ chọn khi nhập liệu.
- **Xem lịch sử nhập (nghiệp vụ 4):**
  - Nội dung mỗi lần nhập: ai nhập, lúc nào, số dòng thành công, số dòng thất bại, số dòng trùng.
  - Nhập thất bại gồm: từ chối file, hủy nhập, và file bị gián đoạn.
  - Mỗi lần nhập thất bại được ghi vào lịch sử. Các dòng lỗi trong một lần nhập chỉ là số liệu thành công và thất bại của lần nhập đó, không làm cả lần nhập bị coi là thất bại.

**Lý do ghi lịch sử cả lần hủy:** nếu không ghi, quản trị viên không biết một file đã được đưa vào rồi bị bỏ, và không thể đối chiếu khi số liệu có vấn đề.

### 3.2. Nhân viên nghiệp vụ (người nhập)

- **Điều kiện:** đã đăng nhập và có quyền nhập liệu.
- **Chọn nguồn:** file CSV/Excel, hoặc bảng trong cơ sở dữ liệu đã được quản trị viên cấu hình.
- **Định dạng và giới hạn:**
  - Chỉ nhận .csv, .xlsx và .xls. CSV được chuẩn hóa về UTF-8 và dấu phẩy.
  - Tối đa 150.000 dòng và 30 MB mỗi file. Vượt ngưỡng thì chia file theo chi nhánh.
  - Giả định quy mô để đặt giới hạn: một chuỗi quy mô nhỏ có 5 chi nhánh, mỗi chi nhánh 100 đơn mỗi ngày, mỗi đơn trung bình 3 dòng sản phẩm. Khi đó một quý có khoảng 135.000 dòng.
- **Cột bắt buộc:** mã đơn, số thứ tự dòng, mã khách hàng, mã sản phẩm, mã chi nhánh, ngày, số lượng, số tiền, loại giao dịch (BÁN/HOÀN). Tên cột được so khớp không phân biệt hoa thường.
- **Kiểm tra giá trị:**
  - **Ngày:** ô Excel chứa ngày thật thì được nhận. Ô dạng chữ phải đúng DD/MM/YYYY. Ngày phải có thật (ví dụ 31/02 là sai).
  - **Số tiền:** cho phép có số âm, vì có nghiệp vụ hoàn trả.

  **Lý do:** ô ngày thật trong Excel sẽ rõ ràng, nên không cần ép người nhập sửa file. Ô dạng chữ có thể bị đọc sai giữa MM/DD và DD/MM, nên phải theo một chuẩn cố định để khi nhập liệu hạn chế lỗi.

- **Quy tắc xử lý lỗi:**

  | Tình huống                              | Xử lý                                                                                    |
  | --------------------------------------- | ---------------------------------------------------------------------------------------- |
  | Mã sản phẩm không tồn tại               | Đánh dấu chưa xác nhận. Người nhập điền mã đúng khi xác nhận.                            |
  | Mã khách hàng không hợp lệ hoặc thiếu   | Đánh dấu chưa xác nhận. Người nhập điền khi xác nhận.                                    |
  | Dòng trùng trong cùng file              | Đánh dấu. Người nhập quyết định bỏ hay giữ.                                              |
  | Dòng trùng với dữ liệu đã nạp trong kho | Bỏ dòng trùng. Hiển thị dòng đó trong bản xem trước.                                     |
  | Dòng HOÀN không tìm thấy dòng gốc       | Đánh dấu chưa xác nhận. Người nhập chọn dòng gốc đúng hoặc xác nhận là hoàn trả độc lập. |
  - Người nhập vẫn có thể xác nhận file khi còn dòng chưa xác nhận. Các dòng này vẫn được nạp và tính vào doanh thu; dashboard hiển thị riêng tổng doanh thu của phần này.
  - Tìm dòng gốc của hoàn trả phải xét cả file đang nhập lẫn kho, không phụ thuộc thứ tự dòng trong file.

  **Lý do không đoán mã thiếu:** việc đoán (ví dụ dựa vào dòng liền kề) có thể gộp doanh số của hai sản phẩm khác nhau mà không ai biết. Đánh dấu và để người nhập xác nhận giữ được độ tin cậy của số liệu.

- **Hoàn trả:**
  - File có cột loại giao dịch: BÁN hoặc HOÀN.
  - Dòng HOÀN ghi số âm và tham chiếu đến dòng BÁN gốc bằng khóa mã đơn + số dòng.
  - Quy tắc dấu: dòng HOÀN phải có số âm, dòng BÁN phải có số dương.

  **Lý do:** cột loại giao dịch làm rõ ý nghĩa của số âm. Tham chiếu đến dòng gốc cho phép tính doanh thu thuần đúng cho từng đơn.

### 3.3. Chuyên viên phân tích (người đọc dữ liệu)

- **Xem dashboard (nghiệp vụ 5).**
- **Bộ lọc:** thời gian, chi nhánh, nhóm hàng.
- **KPI:**

  | KPI                       | Ghi chú                                                                                          |
  | ------------------------- | ------------------------------------------------------------------------------------------------ |
  | Doanh thu                 | Gồm cả dòng chưa xác nhận, hiển thị riêng phần này.                                              |
  | Lợi nhuận                 | Ước lượng theo biên lợi nhuận cố định của nhóm hàng. Đây là giả định, phải ghi rõ trong báo cáo. |
  | Lợi nhuận theo nhóm hàng  | Cho biết nguồn lợi nhuận đến từ nhóm hàng nào.                                                   |
  | Giá trị đơn trung bình    | Doanh thu chia cho số mã đơn.                                                                    |
  | Tỷ lệ giữ chân khách hàng | Cần mã khách hàng trong file. Dòng thiếu mã khách hàng ở trạng thái chưa xác nhận.               |
  | Sản phẩm bán chạy         | Đo theo doanh thu.                                                                               |

  **Lý do có thêm KPI lợi nhuận theo nhóm hàng:** KPI sản phẩm bán chạy theo doanh thu không cho biết lợi nhuận đến từ đâu, vì biên lợi nhuận khác nhau giữa các nhóm hàng.

## 4. Luồng xử lý từng nghiệp vụ

### 4.1. Nghiệp vụ 1: Nhập dữ liệu

- **Người thực hiện:** nhân viên nghiệp vụ (người nhập).
- **Mô tả:** người nhập đưa dữ liệu cần phân tích vào hệ thống, dữ liệu là file CSV/Excel hoặc kết nối cơ sở dữ liệu. Hệ thống đọc dữ liệu và hiển thị bản xem trước cho người nhập.
- **Đầu ra:** bản xem trước.
- **Điều kiện:** người thực hiện đã đăng nhập và có quyền nhập liệu.

**Các bước:**

1. **Chọn nguồn:** người nhập chọn file, hoặc chọn bảng trong cơ sở dữ liệu đã được quản trị viên cấu hình kết nối.
2. **Kiểm tra định dạng và kích thước:** kiểm tra theo mục 3.2. Với cơ sở dữ liệu, kiểm tra số dòng trước khi đọc. Vượt ngưỡng hoặc sai định dạng thì từ chối file.
3. **Xác định dấu phân cách của CSV:** người nhập chọn dấu phân cách. Hệ thống chuẩn hóa file về UTF-8 và dấu phẩy.
4. **Chọn dòng tiêu đề:** người nhập chọn dòng chứa tên cột. Một dòng tiêu đề áp dụng cho cả file.
5. **Tìm sheet và cột:**
   - Excel: so khớp tên cột với dòng tiêu đề đã chọn. Chọn sheet có số cột khớp nhiều nhất. Nếu hai sheet bằng nhau, người nhập chọn. Không sheet nào khớp thì từ chối file.
   - CSV: bỏ qua bước chọn sheet, chỉ kiểm tra cột.
   - Cơ sở dữ liệu: kiểm tra cột như với file.
   - Thiếu bất kỳ cột bắt buộc nào thì từ chối file.
6. **Từ chối file:** áp dụng khi vượt ngưỡng dòng hoặc dung lượng, sai định dạng, không sheet nào khớp, hoặc thiếu cột bắt buộc. Thông báo nêu rõ lý do cụ thể. Lần nhập bị từ chối được ghi vào lịch sử nhập.
7. **Hiển thị bản xem trước:** hiển thị nội dung file, và danh sách được tải theo cuộn để tránh chậm khi file lớn. Nghiệp vụ 1 không đánh dấu dòng lỗi. Người nhập có thể hủy nhập tại đây, và lần hủy được ghi vào lịch sử như nhập thất bại.

**Kết quả:** nghiệp vụ 1 kết thúc khi bản xem trước đã hiển thị và các lỗi cấu trúc đã được xác định. Nghiệp vụ 1 không ghi dữ liệu nào vào kho. Lỗi giá trị theo từng dòng do nghiệp vụ 2 xác định và đánh dấu trên bản xem trước.

### 4.2. Nghiệp vụ 2: Làm sạch/chuẩn hóa dữ liệu và xác nhận

Các bước chưa được phân tích. Quy tắc kiểm tra và xử lý lỗi nằm ở mục 3.2.

### 4.3. Nghiệp vụ 3: Nạp vào kho dữ liệu

**Mô hình dữ liệu (star schema):**

- **Bảng sự kiện:** mỗi dòng là một sản phẩm trong một đơn hàng.
- **Khóa một dòng:** mã đơn + số thứ tự dòng trong đơn.
- **Bảng chiều:** thời gian, chi nhánh, sản phẩm, nhóm hàng, khách hàng.
- **Bảng sản phẩm:** một bảng duy nhất, có cột trạng thái (đã xác nhận / chưa xác nhận).
- **Bảng nhóm hàng:** lưu tỷ lệ biên lợi nhuận của từng nhóm.

**Lý do chọn grain này:** KPI sản phẩm bán chạy, giá trị đơn trung bình và kiểm trùng theo đơn đều cần chi tiết từng sản phẩm trong đơn. Khóa mã đơn + số dòng cho phép cả kiểm trùng lẫn tham chiếu hoàn trả đúng dòng gốc.

**Nạp thất bại:** từ chối file, hủy nhập hoặc file bị gián đoạn đều được coi là thất bại trọn vẹn. Không ghi dữ liệu nào vào kho.

**Lưu bản gốc:**

- Khi nguồn là file: sau khi người nhập xác nhận và dữ liệu được nạp thành công, file gốc được lưu vào cơ sở dữ liệu của hệ thống để đối chiếu sau này.
- Khi nguồn là cơ sở dữ liệu: không lưu bản gốc, vì không có file.
- Chỉ lưu file đã nạp thành công. Không lưu file bị từ chối, bị hủy hoặc nạp thất bại.

**Các bước:** chưa được phân tích.

### 4.4. Nghiệp vụ 4: Quản lý lịch sử nhập

Các bước chưa được phân tích. Nội dung lịch sử và các trường hợp nhập thất bại nằm ở mục 3.1.

### 4.5. Nghiệp vụ 5: Xem dashboard

Các bước chưa được phân tích. Bộ lọc và KPI nằm ở mục 3.3.

## 5. Ngoài phạm vi

- API là nguồn dữ liệu, để sau.
- Tỷ lệ biên lợi nhuận theo nhóm hàng là giả định, không phải giá vốn thực tế.

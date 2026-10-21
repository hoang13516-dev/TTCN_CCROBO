# BÁO CÁO PHÂN TÍCH YÊU CẦU — CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Phiên bản: **v2.0** · Ngày: 21/10/2026 · Người thực hiện: Nguyễn Minh Hoàng · GVHD: ThS. Dương Văn Đeo
> Trạng thái: **Bản nháp chờ GVHD xác nhận** các quyết định phạm vi (O-15 ở [ch.7 §5](07-truy-vet-va-tu-kiem-tra.md#5-vấn-đề-còn-mở--cần-bạn-tự-xử-lý))
> v2.0 thay thế v1.0: phạm vi được rút gọn về mức cơ bản và bổ sung đủ "Kết quả cần đạt" của đề. Danh sách xung đột đã giải quyết: [ch.7 §4](07-truy-vet-va-tu-kiem-tra.md#4-các-xung-đột-đã-giải-quyết-21102026).
> **Quan hệ với `ke-hoach.md`:** tài liệu này quyết định hệ thống làm _gì_ (ch.1–7) và được _xây thế nào_ (ch.8); `ke-hoach.md` chỉ quyết định làm _khi nào_ và trỏ tới UC/FR/AC ở đây. Tài liệu phân tích **không** trỏ ngược vào bước kế hoạch. Đổi phạm vi thì sửa ở đây trước rồi mới sửa kế hoạch.

## Mục lục

| #   | Chương                                                                        | Trả lời câu hỏi                                                                                  |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | [Khảo sát & phân tích đề tài](01-khao-sat-va-phan-tich-de-tai.md)             | Bài toán là gì, cho ai, đang làm thế nào, đau ở đâu, phạm vi tới đâu?                            |
| 2   | [Quy trình nghiệp vụ](02-quy-trinh-nghiep-vu.md)                              | Hệ thống mới thay đổi cách làm việc ra sao (AS-IS → TO-BE)?                                      |
| 3   | [Đặc tả yêu cầu](03-dac-ta-yeu-cau.md)                                        | Hệ thống **phải** làm gì (FR), tốt tới mức nào (NFR), theo quy tắc nào (BR)? Dữ liệu vào ra sao? |
| 4   | [Chức năng cốt lõi & sơ đồ chức năng (BFD)](04-chuc-nang-va-so-do-bfd.md)     | Hệ thống gồm những chức năng nào, ưu tiên ra sao, phụ thuộc nhau thế nào?                        |
| 5   | [Tác nhân & Use Case tổng quát](05-tac-nhan-va-use-case.md)                   | Ai dùng hệ thống, được làm gì, thấy dữ liệu nào?                                                 |
| 6   | [Đặc tả Use Case](06-dac-ta-use-case.md)                                      | Từng use case chạy từng bước thế nào, lỗi thì sao, khi nào coi là xong?                          |
| 7   | [Ma trận truy vết & tự kiểm tra](07-truy-vet-va-tu-kiem-tra.md)               | Đã phủ đủ đề bài chưa? Có sót yêu cầu nào không? Còn gì phải tự xử lý?                           |
| 8   | [Kiến trúc, công nghệ & định hướng phát triển](08-kien-truc-va-dinh-huong.md) | Hệ thống được xây thế nào (phân lớp, luồng request, mô hình dữ liệu), bằng gì, mở rộng ra sao?   |

Phụ lục: [Phiếu khảo sát](phieu-khao-sat.md) · Quyết định kiến trúc: [`docs/adr/`](../adr/)

## Danh mục sơ đồ

Nguồn sơ đồ là file PlantUML trong [`so-do/`](so-do/); ảnh đã render sẵn trong [`so-do/out/`](so-do/out/) (PNG để chèn Word, SVG để phóng to không vỡ).

| Mã  | Sơ đồ                           | Loại UML                  | File                                                                 |
| --- | ------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| H1  | Sơ đồ ngữ cảnh                  | Context                   | [`01-ngu-canh`](so-do/out/01-ngu-canh.png)                           |
| H2  | Quy trình hiện tại (AS-IS)      | Activity (swimlane)       | [`02-as-is`](so-do/out/02-as-is.png)                                 |
| H3  | QT-01 Nhập dữ liệu từ file      | Activity                  | [`03-qt-nhap-file`](so-do/out/03-qt-nhap-file.png)                   |
| H4  | QT-02 Đồng bộ từ REST API       | Activity                  | [`04-qt-dong-bo`](so-do/out/04-qt-dong-bo.png)                       |
| H5  | QT-03 Phân tích & ra quyết định | Activity                  | [`05-qt-phan-tich`](so-do/out/05-qt-phan-tich.png)                   |
| H6  | Kho dữ liệu hình sao            | Class (ER)                | [`06-star-schema`](so-do/out/06-star-schema.png)                     |
| H7  | Vòng đời trạng thái lần nhập    | State machine             | [`07-trang-thai-import-job`](so-do/out/07-trang-thai-import-job.png) |
| H8  | Sơ đồ phân rã chức năng         | BFD (WBS)                 | [`08-bfd`](so-do/out/08-bfd.png)                                     |
| H9  | Use case tổng quát              | Use case                  | [`09-uc-tong-quat`](so-do/out/09-uc-tong-quat.png)                   |
| H9b | Phân cấp tác nhân               | Use case (generalization) | [`09b-phan-cap-tac-nhan`](so-do/out/09b-phan-cap-tac-nhan.png)       |
| H10 | Phân rã: tài khoản & quản trị   | Use case                  | [`10-uc-tai-khoan`](so-do/out/10-uc-tai-khoan.png)                   |
| H11 | Phân rã: quản lý dữ liệu (ETL)  | Use case                  | [`11-uc-quan-ly-du-lieu`](so-do/out/11-uc-quan-ly-du-lieu.png)       |
| H12 | Phân rã: phân tích & báo cáo    | Use case                  | [`12-uc-phan-tich`](so-do/out/12-uc-phan-tich.png)                   |
| H13 | Luồng request xem dashboard     | Sequence                  | [`13-seq-dashboard`](so-do/out/13-seq-dashboard.png)                 |
| H14 | Luồng request nhập file         | Sequence                  | [`14-seq-nhap-file`](so-do/out/14-seq-nhap-file.png)                 |

### Cách sửa và xuất lại sơ đồ

```bash
# Cần Java + Graphviz. Tải plantuml.jar tại https://plantuml.com/download
cd docs/phan-tich/so-do
java -jar plantuml.jar -tpng -o out *.puml   # PNG cho Word
java -jar plantuml.jar -tsvg -o out *.puml   # SVG
```

Không muốn cài: dán nội dung file `.puml` vào https://www.plantuml.com/plantuml (bỏ dòng `!include _style.iuml`, chỉ mất màu sắc). Trong VS Code: extension **PlantUML** (jebbs) → `Alt+D` để xem trước.

## Quy ước mã định danh

| Tiền tố | Ý nghĩa                                                                       | Ví dụ                                 |
| ------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| `G`     | Mục tiêu đo được                                                              | G5 — phát hiện sớm bất thường         |
| `P`     | Vấn đề hiện trạng (pain point)                                                | P4 — không thấy lợi nhuận             |
| `QT`    | Quy trình nghiệp vụ TO-BE                                                     | QT-01 — nhập dữ liệu từ file          |
| `FR`    | Yêu cầu chức năng                                                             | FR-26 — drill-down thời gian          |
| `NFR`   | Yêu cầu phi chức năng                                                         | NFR-01 — dashboard < 2 s              |
| `BR`    | Quy tắc nghiệp vụ                                                             | BR-15 — phạm vi chi nhánh             |
| `F`     | Chức năng trong BFD                                                           | F3.4 — nạp vào kho                    |
| `UC`    | Use case                                                                      | UC06 — nhập dữ liệu từ file           |
| `AC`    | Tiêu chí chấp nhận                                                            | AC-06.2                               |
| `O`     | Vấn đề mở                                                                     | O-15 — chờ GVHD xác nhận              |
| `S`     | Bước trong kế hoạch — **chỉ dùng trong `ke-hoach.md`**, dạng `S<sprint>.<số>` | (không dùng trong tài liệu phân tích) |

Mã của v2.0 được đánh lại từ đầu (FR, BR, UC, AC khác v1.0). Trong cùng một phiên bản, mã là **ổn định**: xoá một mục thì đánh dấu "đã bỏ", không đánh lại số, để không gãy truy vết. Riêng mã vấn đề mở `O-xx` tiếp tục đánh số nối tiếp v1.0 (O-15 trở đi) để đối chiếu được với lịch sử.

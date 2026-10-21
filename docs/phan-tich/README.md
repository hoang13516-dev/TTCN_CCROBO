# BÁO CÁO PHÂN TÍCH YÊU CẦU — CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Phiên bản: **v1.0** · Ngày: 2026-10-21 · Người thực hiện: Nguyễn Minh Hoàng
> Trạng thái: **Bản nháp chờ GVHD duyệt** (xem các mục "Cần xác nhận" ở [07](07-truy-vet-va-tu-kiem-tra.md#4-vấn-đề-còn-mở--cần-bạn-tự-xử-lý))
> Đầu vào: [`ke-hoach.md`](../../ke-hoach.md) (phạm vi, kiến trúc, mô hình dữ liệu đã chốt)
> Đầu ra: tài liệu này là **căn cứ** cho Sprint 1→7 của `ke-hoach.md` (50 ngày, 21/10 → 09/12/2026). Mọi thay đổi phạm vi sau này phải sửa ở đây trước rồi mới code.

## Mục lục

| #   | Chương                                                                    | Trả lời câu hỏi                                                                                                    |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | [Khảo sát & phân tích đề tài](01-khao-sat-va-phan-tich-de-tai.md)         | Bài toán là gì, cho ai, đang làm thế nào, đau ở đâu, phạm vi tới đâu?                                              |
| 2   | [Quy trình nghiệp vụ](02-quy-trinh-nghiep-vu.md)                          | Hệ thống mới thay đổi cách làm việc ra sao (AS-IS → TO-BE)?                                                        |
| 3   | [Đặc tả yêu cầu](03-dac-ta-yeu-cau.md)                                    | Hệ thống **phải** làm gì (FR), làm tốt tới mức nào (NFR), theo quy tắc nào (BR)? Dữ liệu đầu vào chính xác ra sao? |
| 4   | [Chức năng cốt lõi & sơ đồ chức năng (BFD)](04-chuc-nang-va-so-do-bfd.md) | Hệ thống gồm những chức năng nào, ưu tiên ra sao, làm ở sprint nào?                                                |
| 5   | [Tác nhân & Use Case tổng quát](05-tac-nhan-va-use-case.md)               | Ai dùng hệ thống, được làm gì, phân quyền thế nào?                                                                 |
| 6   | [Đặc tả Use Case cốt lõi](06-dac-ta-use-case.md)                          | Từng use case chạy từng bước thế nào, lỗi thì sao, khi nào coi là xong?                                            |
| 7   | [Ma trận truy vết & tự kiểm tra](07-truy-vet-va-tu-kiem-tra.md)           | Có sót yêu cầu nào không? Ảnh hưởng gì tới kế hoạch? Còn gì phải tự xử lý?                                         |
| 8   | [Kiến thức nền & câu hỏi ôn tập](08-kien-thuc-va-on-tap.md)               | Vì sao vẽ như vậy? Bẫy thường gặp khi bảo vệ?                                                                      |

## Danh mục sơ đồ

Nguồn sơ đồ là file PlantUML trong [`so-do/`](so-do/); ảnh đã render sẵn trong [`so-do/out/`](so-do/out/) (PNG để chèn Word, SVG để phóng to không vỡ).

| Mã      | Sơ đồ                           | Loại UML                  | File                                                                                                                                                                    |
| ------- | ------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1      | Sơ đồ ngữ cảnh                  | Context                   | [`01-ngu-canh`](so-do/out/01-ngu-canh.png)                                                                                                                              |
| H2      | Quy trình hiện tại (AS-IS)      | Activity (swimlane)       | [`02-as-is`](so-do/out/02-as-is.png)                                                                                                                                    |
| H3      | QT-01 Nhập dữ liệu từ file      | Activity                  | [`03-qt-nhap-file`](so-do/out/03-qt-nhap-file.png)                                                                                                                      |
| H4      | QT-02 Kết nối & đồng bộ nguồn   | Activity                  | [`04-qt-dong-bo`](so-do/out/04-qt-dong-bo.png)                                                                                                                          |
| H5      | QT-03 Phân tích & ra quyết định | Activity                  | [`05-qt-phan-tich`](so-do/out/05-qt-phan-tich.png)                                                                                                                      |
| H6      | QT-04 Hủy lần nhập              | Activity                  | [`06-qt-huy-nhap`](so-do/out/06-qt-huy-nhap.png)                                                                                                                        |
| H7      | Vòng đời trạng thái import job  | State machine             | [`07-trang-thai-import-job`](so-do/out/07-trang-thai-import-job.png)                                                                                                    |
| H8      | Sơ đồ phân rã chức năng         | BFD (WBS)                 | [`08-bfd`](so-do/out/08-bfd.png)                                                                                                                                        |
| H9      | Use case tổng quát              | Use case                  | [`09-uc-tong-quat`](so-do/out/09-uc-tong-quat.png)                                                                                                                      |
| H9b     | Phân cấp tác nhân               | Use case (generalization) | [`09b-phan-cap-tac-nhan`](so-do/out/09b-phan-cap-tac-nhan.png)                                                                                                          |
| H10–H13 | Phân rã use case theo nhóm      | Use case                  | [`10`](so-do/out/10-uc-tai-khoan.png) · [`11`](so-do/out/11-uc-quan-ly-du-lieu.png) · [`12`](so-do/out/12-uc-nguon-ket-noi.png) · [`13`](so-do/out/13-uc-phan-tich.png) |

### Cách sửa và xuất lại sơ đồ

```bash
# Cần Java + Graphviz. Tải plantuml.jar tại https://plantuml.com/download
cd docs/phan-tich/so-do
java -jar plantuml.jar -tpng -o out *.puml   # PNG cho Word
java -jar plantuml.jar -tsvg -o out *.puml   # SVG
```

Không muốn cài: dán nội dung file `.puml` vào https://www.plantuml.com/plantuml (bỏ dòng `!include _style.iuml`, chỉ mất màu sắc). Trong VS Code: extension **PlantUML** (jebbs) → `Alt+D` để xem trước.

## Quy ước mã định danh

| Tiền tố | Ý nghĩa                                                    | Ví dụ                                     |
| ------- | ---------------------------------------------------------- | ----------------------------------------- |
| `P`     | Vấn đề hiện trạng (pain point)                             | P3 — tên sản phẩm khác nhau giữa các kênh |
| `QT`    | Quy trình nghiệp vụ TO-BE                                  | QT-01 — nhập dữ liệu từ file              |
| `FR`    | Yêu cầu chức năng                                          | FR-12 — gợi ý ánh xạ cột                  |
| `NFR`   | Yêu cầu phi chức năng                                      | NFR-01 — dashboard < 2 s                  |
| `BR`    | Quy tắc nghiệp vụ                                          | BR-06 — nhập lại không nhân đôi doanh thu |
| `F`     | Chức năng trong BFD                                        | F2.6 — hủy lần nhập                       |
| `UC`    | Use case                                                   | UC05 — nhập dữ liệu từ file               |
| `AC`    | Tiêu chí chấp nhận (acceptance criteria)                   | AC-05.3                                   |
| `S`     | Bước trong kế hoạch (`ke-hoach.md`), dạng `S<sprint>.<số>` | S3.1                                      |

Mã là **ổn định**: không đánh lại số khi xoá một mục (đánh dấu "đã bỏ") để không làm gãy truy vết.

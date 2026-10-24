# CLAUDE.md - Quy tắc làm việc trong repo CN-019

Đồ án chuyên ngành của Nguyễn Minh Hoàng (1 sinh viên). Mục tiêu: **phiên bản đơn giản nhất đủ "Kết quả cần đạt" của đề**, hiểu nghiệp vụ, mở rộng được sau. Người dùng đang học: khi viết code hay tài liệu, giải thích _vì sao_, không chỉ đưa kết quả.

## 1. Hỏi trước khi quyết định

- Mọi thay đổi về **phạm vi, quy tắc nghiệp vụ, kiến trúc, công nghệ, kế hoạch**: hỏi người dùng (đưa phương án + khuyến nghị) **trước** khi sửa.
- Chi tiết cài đặt nằm gọn trong một bước đã được định nghĩa thì tự làm, không cần hỏi.

## 2. Mỗi thông tin chỉ có MỘT nơi định nghĩa

| Thông tin                                                                                | Nơi duy nhất          |
| ---------------------------------------------------------------------------------------- | --------------------- |
| Bài toán, mục tiêu, vấn đề, phạm vi, ràng buộc thời gian                                 | `docs/phan-tich/01-…` |
| Quy trình nghiệp vụ, trạng thái lần nhập                                                 | `docs/phan-tich/02-…` |
| FR, NFR, quy tắc nghiệp vụ (KPI, nhập liệu…), từ điển dữ liệu, Won't + cách mở rộng      | `docs/phan-tich/03-…` |
| Chức năng (BFD)                                                                          | `docs/phan-tich/04-…` |
| Tác nhân, use case, ma trận quyền (theo UC và theo API)                                  | `docs/phan-tich/05-…` |
| Đặc tả use case, tiêu chí chấp nhận (AC)                                                 | `docs/phan-tich/06-…` |
| Truy vết, xung đột đã giải quyết, vấn đề mở (O-xx)                                       | `docs/phan-tich/07-…` |
| Kiến trúc phân lớp, luồng request, thư mục, mô hình dữ liệu, công nghệ, lộ trình mở rộng | `docs/phan-tich/08-…` |
| Lý do của quyết định kiến trúc                                                           | `docs/adr/`           |
| Lịch, bước, giờ, tiến độ                                                                 | `ke-hoach.md`         |

Nơi khác chỉ **trỏ tới**, không chép lại. Chiều tham chiếu: `ke-hoach.md` → phân tích (UC/FR/AC). **Tài liệu phân tích và ADR không bao giờ trỏ vào mã bước kế hoạch** (`S1.2`…).

## 3. Không đưa vào repo

Tài liệu ôn tập, câu hỏi gửi GVHD, ghi chú cá nhân: tạo **ngoài repo** (thư mục tạm/scratchpad) rồi gửi file cho người dùng tải về. Script kiểm tra sẽ chặn file có tên chứa `on-tap`, `kien-thuc`, `cau-hoi-gvhd`.

## 4. Trước MỖI commit

1. Sửa file `.puml` → xuất lại ảnh: `cd docs/phan-tich/so-do && java -jar plantuml.jar -tpng -o out *.puml && java -jar plantuml.jar -tsvg -o out *.puml`, rồi **mở ảnh xem** (lỗi cú pháp vẫn có thể ra ảnh sai).
2. Chạy `npm run check` (hook pre-commit cũng tự chạy): kiểm tra mã định danh, FR ↔ UC, độ phủ AC, số thống kê, giờ kế hoạch, bảng, link/anchor, sơ đồ, file cấm, rồi Prettier và ESLint.
3. Script không hiểu nghĩa câu chữ. Nếu đã sửa một trong các thông tin dưới đây, **đối chiếu tay mọi nơi nhắc tới nó**:

| Thông tin dễ lệch                                | Định nghĩa ở       | Còn xuất hiện ở                                                         |
| ------------------------------------------------ | ------------------ | ----------------------------------------------------------------------- |
| 6 KPI và công thức                               | BR-01…BR-05, FR-19 | ch.1 G4, ch.6 bố cục UC12 + AC-12.x, H13                                |
| 3 vai trò, phạm vi chi nhánh                     | BR-15, ADR-0002    | ch.5 §5.1, §5.4; ch.8 bảng `users`; H9, H9b, H10                        |
| Giới hạn file (5 MB, 10.000 dòng, 30 cột)        | BR-14              | ch.2 QT-01 + E2, ch.6 AC-06.8, H3                                       |
| Bộ lọc mặc định, cấp drill-down                  | BR-18, BR-19       | ch.2 §2.4, ch.6 bố cục + AC-14.1, H5, H12                               |
| Quy tắc cảnh báo R1-R5                           | BR-20              | ch.6 UC15 + AC-15.x, ch.8 bảng `alert_rules`                            |
| Trạng thái lần nhập, thời gian dọn lần nhập treo | BR-13              | ch.2 §2.6, ch.8 bảng `import_jobs`, H7, H14                             |
| 14 trường dữ liệu nhập                           | ch.3 §3.5.1        | §3.5.2 file mẫu, §3.5.3, ch.8 `fact_sales`, ch.6 AC-07.x                |
| 5 chi nhánh khởi tạo                             | ch.8 §8.4.2        | ch.3 §3.5.2, ch.6 AC dùng `HN01`, `DN01`, `HCM01`                       |
| Danh sách API và quyền                           | ch.5 §5.4.2        | dòng "API" trong từng đặc tả ch.6, ch.8 §8.3                            |
| Ai mở transaction                                | ch.8 §8.2.1        | ch.8 §8.2.2, H14                                                        |
| 50 ngày, ~13 giờ/tuần                            | ch.1 §1.5.3 (C1)   | đầu `ke-hoach.md`                                                       |
| Mã bước trong chú thích code, README             | `ke-hoach.md`      | `apps/**`, `README.md` - nội dung bước phải đúng việc chú thích nói tới |

4. Báo lại cho người dùng mọi chỗ lệch tìm thấy và cách đã sửa; ghi lệch đáng kể vào ch.7 §4.

## 5. Quy ước

- Commit: `feat(api): …`, `fix(web): …`, `docs: …`, `test: …`, `chore: …`.
- Code: TypeScript strict; module backend theo lớp `routes → controller → service → repository` (ch.8 §8.2); SQL chỉ ở repository, luôn tham số hoá.
- Văn bản tiếng Việt, câu ngắn, thuật ngữ kỹ thuật giữ nguyên tiếng Anh khi cần.
- Không dùng icon (emoji, dấu tích, dấu chéo, ô vuông, biểu tượng cảnh báo, ổ khoá…) trong tài liệu, code, sơ đồ, commit, PR. Thay bằng chữ: `Có`/`Không`, `Đạt`, `[ ]`, `(phạm vi)`, `[warning]`… Mũi tên `→`, `↔` vẫn được dùng.

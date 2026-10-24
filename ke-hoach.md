# KẾ HOẠCH THỰC HIỆN - CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Đồ án chuyên ngành - GVHD: ThS. Dương Văn Đeo (GV001) - Thực hiện: Nguyễn Minh Hoàng (nhóm CCROBO, 1 sinh viên)
> Cập nhật 21/10/2026, **sinh lại từ tài liệu phân tích** `docs/phan-tich/` (thay thế hoàn toàn các kế hoạch trước, xem lịch sử git)
> Ràng buộc (ch.1 §1.5.3, C1): **50 ngày, 21/10 → 09/12/2026** · **~13 giờ/tuần** · phạm vi **Must + Should**
> Tổng: **7 sprint × 13 giờ + 1,5 giờ ngày nộp = 92,5 giờ** (S2.6 thêm 2 giờ vào Sprint 2, lấy từ vùng đệm S7.5)

---

## 0. HƯỚNG DẪN CHO MỖI PHIÊN LÀM VIỆC

1. Tìm **bước đầu tiên chưa tick** ở [§6](#6-bảng-theo-dõi-tiến-độ). Mỗi lần làm **một bước**.
2. Mỗi bước ghi: use case (UC) và yêu cầu (FR/NFR) nó phục vụ, các **tiêu chí chấp nhận (AC) phải pass**, số giờ. Nội dung AC: `docs/phan-tich/06-dac-ta-use-case.md`. Cách xây (lớp, thư mục, bảng dữ liệu): `docs/phan-tich/08-kien-truc-va-dinh-huong.md`.
3. Chỉ tick khi mọi AC của bước đã được kiểm chứng bằng test hoặc thao tác thật. Bước không có AC thì dùng cột "Xong khi".
4. **Kế hoạch không định nghĩa yêu cầu.** Muốn đổi phạm vi, quy tắc, kiến trúc: sửa `docs/phan-tich/` (và ADR nếu là quyết định kiến trúc) trước, rồi mới sửa kế hoạch.
5. Trước mỗi commit: `npm run check` (hook pre-commit tự chạy); đọc checklist trong `CLAUDE.md`.
6. Commit theo quy ước `feat(api): …`, `fix(web): …`, `docs: …`, `test: …`; tick bảng tiến độ, ghi giờ thực tế.
7. Cuối mỗi tuần (Thứ Ba): báo cáo sprint theo mẫu §5. Lệch > 3 giờ → áp dụng thứ tự cắt ở §4.

## 1. CÁCH KẾ HOẠCH ĐƯỢC SINH TỪ PHÂN TÍCH

```
Thứ tự phụ thuộc (ch.4 §4.4)            Ưu tiên MoSCoW (ch.3, ch.5)
  kho dữ liệu → đăng nhập → ETL file      Must làm trước, Should làm sau
  → dashboard → cảnh báo, xuất báo cáo    trong cùng nhóm phụ thuộc
  → nguồn API → quản trị
                     │
                     ▼
  Mỗi use case → 1-2 bước; mỗi bước mang theo đúng các FR và AC của use case đó
  Bước nền (CSDL, seed, deploy, kiểm thử) mang theo FR-34, FR-35 và các NFR
```

Mốc M4 phủ đủ "Kết quả cần đạt" của đề (ch.7 §1) trước 2 tuần cuối, để còn thời gian deploy, kiểm thử và vùng đệm.

## 2. CÁC MỐC

| Mốc    | Ngày  | Nội dung                                                              | Kiểm chứng                                     |
| ------ | ----- | --------------------------------------------------------------------- | ---------------------------------------------- |
| **M1** | 27/10 | Gửi GVHD câu hỏi phạm vi; CSDL hình sao + ~100.000 dòng dữ liệu demo  | O-15 đã gửi; FR-34, FR-35 đạt                  |
| **M2** | 10/11 | Nhập file **end-to-end** (UC06-UC09)                                  | Mọi AC của S3.1-S3.3 pass                      |
| **M3** | 17/11 | **Demo giữa kỳ**: dashboard, lọc đa chiều, drill-down, lọc chéo        | Mọi AC của S4.1-S4.3 pass; video demo          |
| **M4** | 24/11 | **Đủ "Kết quả cần đạt"**: thêm cảnh báo, xuất Excel/PDF, đồng bộ API   | Mọi AC của S5.1-S5.3 pass                      |
| **M5** | 01/12 | Quản trị (người dùng, chi nhánh, quy tắc cảnh báo); deploy công khai  | Mọi AC của S6.1-S6.2 pass; mở URL từ điện thoại |
| **M6** | 08/12 | Kiểm thử, tài liệu, UAT xong                                          | `npm test` xanh; ≥ 2 phiếu UAT                 |
| **M7** | 09/12 | **Nộp sản phẩm cuối**                                                 | Đã nộp                                         |

## 3. CÁC SPRINT

### Sprint 1 (21/10 → 27/10) - Nền tảng dữ liệu

| Bước | Nội dung                                                     | UC | FR / NFR      | AC phải pass / Xong khi                                                                 | Giờ |
| ---- | ------------------------------------------------------------ | -- | ------------- | --------------------------------------------------------------------------------------- | --- |
| S1.1 | Đọc lại phân tích; gửi GVHD bản câu hỏi phạm vi               | -  | -             | Đã gửi; câu trả lời ghi vào O-15 (ch.7 §5); quyết định nào đổi thì sửa ch.3 trước S1.3   | 1,5 |
| S1.2 | PostgreSQL + kết nối pool + `/api/health` kiểm tra CSDL      | -  | FR-34         | Kiểm chứng FR-34 (ch.7 §3)                                                              | 2   |
| S1.3 | Migration kho hình sao + bảng vận hành + dữ liệu khởi tạo     | -  | NFR-11        | Bảng, ràng buộc, index đúng §8.4; `migrate up/down` chạy được 2 lần                     | 4,5 |
| S1.4 | Script sinh dữ liệu demo                                     | -  | FR-35         | Kiểm chứng FR-35 (ch.7 §3); chạy < 60 s                                                 | 4   |
| S1.5 | Báo cáo Sprint 1                                             | -  | -             | `docs/bao-cao/sprint-1.md`                                                              | 1   |

### Sprint 2 (28/10 → 03/11) - Đăng nhập, phân quyền, chuẩn hoá dùng chung

| Bước | Nội dung                                                                 | UC         | FR / NFR            | AC phải pass / Xong khi                                        | Giờ |
| ---- | ------------------------------------------------------------------------ | ---------- | ------------------- | -------------------------------------------------------------- | --- |
| S2.1 | `packages/shared`: schema Zod, hàm chuẩn hoá, gợi ý ánh xạ (§3.5)          | UC06, UC07 | FR-09, FR-10        | AC-06.3, AC-07.1 (unit test)                                   | 3,5 |
| S2.2 | API đăng nhập/đăng xuất; middleware xác thực, phân quyền, phạm vi chi nhánh | UC01, UC02 | FR-01, FR-02, FR-06, NFR-03, NFR-04 | AC-01.1…AC-01.4, AC-02.1                    | 4   |
| S2.3 | Trang đăng nhập, bảo vệ route, menu theo vai trò                          | UC01       | FR-03               | AC-01.5…AC-01.7                                                | 2,5 |
| S2.4 | Câu SQL KPI trên kho + `EXPLAIN` làm mốc hiệu năng                        | UC12       | FR-19, NFR-01       | Kết quả trên dữ liệu §3.5.2 khớp bảng kỳ vọng; ghi lại thời gian | 2   |
| S2.5 | Báo cáo Sprint 2                                                         | -          | -                   | `docs/bao-cao/sprint-2.md`                                     | 1   |
| S2.6 | Nộp tuần 2/3 (hạn 01/11): wireframe giao diện cơ bản (ảnh, vẽ bằng Figma hoặc tool khác); xuất `docs/phan-tich/` sang Google Doc; xác nhận tên repo theo định dạng `TTCN_MANHOM`; trang kế hoạch (timeline, phân công) trên website | - | - | Ảnh wireframe trong `docs/wireframe/`; link Google Doc và link repo gửi GVHD trước 01/11 | 2   |

### Sprint 3 (04/11 → 10/11) - ETL file

| Bước | Nội dung                                                     | UC              | FR / NFR                    | AC phải pass / Xong khi                    | Giờ |
| ---- | ------------------------------------------------------------ | --------------- | --------------------------- | ------------------------------------------ | --- |
| S3.1 | Upload, Extract CSV/XLSX, xem trước, gợi ý ánh xạ              | UC06, UC07      | FR-08, FR-09                | AC-06.8, AC-06.10, AC-07.1                 | 3   |
| S3.2 | Transform + Load trong 1 transaction; ghi lần nhập, dòng lỗi   | UC06            | FR-10, FR-11, FR-12, NFR-02, NFR-07 | AC-06.1…AC-06.7, AC-06.9           | 4,5 |
| S3.3 | Giao diện nhập 3 bước, lịch sử, tải dòng lỗi, file mẫu         | UC06-UC09       | FR-12, FR-13, FR-14, NFR-08 | AC-07.2, AC-08.1, AC-09.1, AC-09.2         | 4,5 |
| S3.4 | Báo cáo Sprint 3                                             | -               | -                           | `docs/bao-cao/sprint-3.md`                 | 1   |

### Sprint 4 (11/11 → 17/11) - Dashboard

| Bước | Nội dung                                                         | UC         | FR / NFR                         | AC phải pass / Xong khi                                  | Giờ |
| ---- | ---------------------------------------------------------------- | ---------- | -------------------------------- | -------------------------------------------------------- | --- |
| S4.1 | API phân tích (KPI, xu hướng, top SP, vùng, danh mục, kênh) + danh mục lọc | UC12-UC14 | FR-19…FR-23, FR-26, FR-27, NFR-05, NFR-06 | AC-12.1…AC-12.4, AC-12.6, AC-13.1, AC-13.4, AC-14.2 | 4,5 |
| S4.2 | Bộ lọc đa chiều đồng bộ URL + 6 thẻ KPI                           | UC12, UC13 | FR-19, FR-24                     | AC-13.2                                                  | 3   |
| S4.3 | Biểu đồ, drill-down, lọc chéo, trạng thái tải/rỗng/lỗi            | UC12-UC14  | FR-20…FR-23, FR-25…FR-28, NFR-09 | AC-12.5, AC-13.3, AC-14.1, AC-14.3                       | 4,5 |
| S4.4 | Báo cáo Sprint 4 + video demo giữa kỳ                            | -          | -                                | `docs/bao-cao/sprint-4.md`                               | 1   |

### Sprint 5 (18/11 → 24/11) - Cảnh báo, xuất báo cáo, nguồn API

| Bước | Nội dung                                                 | UC         | FR / NFR                   | AC phải pass / Xong khi              | Giờ |
| ---- | -------------------------------------------------------- | ---------- | -------------------------- | ------------------------------------ | --- |
| S5.1 | Đánh giá quy tắc cảnh báo + khối cảnh báo trên dashboard | UC15       | FR-29, FR-30               | AC-15.1…AC-15.5                      | 3,5 |
| S5.2 | Xuất Excel; trang báo cáo in A4 (PDF)                    | UC17       | FR-32, FR-33               | AC-17.1…AC-17.4                      | 3,5 |
| S5.3 | Mock shop API; quản lý nguồn; đồng bộ tăng dần           | UC10, UC11 | FR-15…FR-18, NFR-13, NFR-14 | AC-10.1…AC-10.3, AC-11.1…AC-11.4    | 5   |
| S5.4 | Báo cáo Sprint 5                                         | -          | -                          | `docs/bao-cao/sprint-5.md`           | 1   |

### Sprint 6 (25/11 → 01/12) - Quản trị, tối ưu, deploy

| Bước | Nội dung                                          | UC               | FR / NFR             | AC phải pass / Xong khi                                        | Giờ |
| ---- | ------------------------------------------------- | ---------------- | -------------------- | -------------------------------------------------------------- | --- |
| S6.1 | Quản lý người dùng, chi nhánh; đổi mật khẩu       | UC03, UC04, UC05 | FR-04, FR-05, FR-07  | AC-03.1, AC-03.2, AC-04.1…AC-04.4, AC-05.1, AC-05.2            | 4   |
| S6.2 | Cấu hình quy tắc cảnh báo                         | UC16             | FR-31                | AC-16.1, AC-16.2                                               | 1,5 |
| S6.3 | Tối ưu truy vấn tổng hợp (`EXPLAIN` trước/sau)    | -                | NFR-01               | Bảng so sánh trước/sau; đạt NFR-01                             | 2   |
| S6.4 | Chuẩn bị production + deploy                      | -                | NFR-04, NFR-12, NFR-14 | Mở URL công khai từ điện thoại, đăng nhập và xem dashboard   | 4,5 |
| S6.5 | Báo cáo Sprint 6                                  | -                | -                    | `docs/bao-cao/sprint-6.md`                                     | 1   |

### Sprint 7 (02/12 → 08/12) - Kiểm thử, tài liệu, UAT

| Bước | Nội dung                                                      | UC | FR / NFR        | AC phải pass / Xong khi                                              | Giờ |
| ---- | ------------------------------------------------------------- | -- | --------------- | -------------------------------------------------------------------- | --- |
| S7.1 | Hoàn thiện test theo ma trận ch.7 §3 và bảng quyền §5.4.2     | -  | NFR-05, NFR-10  | `npm test` xanh; coverage đạt NFR-10                                 | 3   |
| S7.2 | Hướng dẫn sử dụng + hướng dẫn triển khai                       | -  | NFR-08, NFR-12  | Người không học IT tự nhập được file mẫu; người khác dựng lại được   | 2,5 |
| S7.3 | UAT 2 người theo kịch bản câu hỏi kinh doanh (ch.2 §2.4)       | -  | -               | ≥ 2 phiếu góp ý; lỗi chặn sử dụng đã sửa                              | 2   |
| S7.4 | Báo cáo tổng kết + slide bảo vệ                               | -  | -               | Báo cáo xuất từ `docs/phan-tich/` (O-18)                             | 2,5 |
| S7.5 | Vùng đệm                                                      | -  | -               | Dùng cho lỗi tồn đọng; nếu không cần: quay video demo hoàn chỉnh     | 1   |

### Ngày 50 (09/12) - Nộp

| Bước | Nội dung                         | UC | FR / NFR | AC phải pass / Xong khi | Giờ |
| ---- | -------------------------------- | -- | -------- | ----------------------- | --- |
| S8.1 | Nộp sản phẩm cuối, trình bày thử | -  | -        | Đã nộp                  | 1,5 |

## 4. RỦI RO VÀ THỨ TỰ CẮT

| Rủi ro                                  | Dấu hiệu                      | Ứng phó                                                                |
| --------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| Học công nghệ mới chậm hơn dự kiến      | Cuối tuần lệch > 3 giờ        | Dùng vùng đệm S7.5; nếu vẫn thiếu, cắt theo thứ tự bên dưới            |
| ETL vượt thời gian                      | Cuối Sprint 3 chưa đạt M2     | Dời phần lịch sử/file mẫu của S3.3 sang Sprint 4; dashboard dùng dữ liệu seed |
| GVHD không đồng ý một quyết định phạm vi | Phản hồi O-15                | Sửa `docs/phan-tich/` trước; schema chưa có ở S1.1 nên chi phí đổi thấp |
| Không có người dùng thật cho UAT        | Hết Sprint 6 chưa hẹn được    | Bạn bè đóng vai theo kịch bản, dữ liệu seed                            |
| Free tier đổi chính sách                | Deploy (S6.4) lỗi             | Ghi phương án thay thế trong hướng dẫn triển khai; demo bằng máy cá nhân |

**Thứ tự cắt khi trễ** - chỉ cắt yêu cầu **Should**, không bao giờ cắt Must:

1. FR-31 (giao diện cấu hình cảnh báo) → admin sửa bằng seed (tiết kiệm 1,5 giờ).
2. FR-30 (cảnh báo ngày bất thường) → chỉ giữ quy tắc so kỳ trước và ngưỡng (tiết kiệm 1 giờ).
3. FR-07, FR-04 (giao diện chi nhánh, đổi mật khẩu) → giữ API + seed (tiết kiệm 2 giờ).
4. FR-14 (file mẫu tạo động) → file mẫu tĩnh (tiết kiệm 0,5 giờ).
5. S6.3 → chỉ thêm index còn thiếu (tiết kiệm 1 giờ).

## 5. MẪU BÁO CÁO SPRINT (`docs/bao-cao/sprint-N.md`)

```markdown
# Báo cáo Sprint N (dd/MM - dd/MM/2026) - CN-019
## 1. Mục tiêu sprint
## 2. Đã hoàn thành (bước, link commit, AC đã pass, ảnh chụp)
## 3. Chưa hoàn thành & lý do
## 4. Khó khăn kỹ thuật & cách giải quyết (bài học)
## 5. Số giờ thực tế / ước lượng
## 6. Kế hoạch sprint tiếp theo
## 7. Câu hỏi cho GVHD
```

## 6. BẢNG THEO DÕI TIẾN ĐỘ

> Tick `[x]` khi đạt **toàn bộ** cột "AC phải pass / Xong khi" của bước. Ghi giờ thực tế và ngày xong.

| Bước     | Nội dung                                          | Ước lượng | Thực tế | Ngày xong  |
| -------- | ------------------------------------------------- | --------- | ------- | ---------- |
| [x] S0.1 | Khởi tạo monorepo (trước kế hoạch)                | 3h        |         | 2026-10-19 |
| [x] S0.2 | Khung API Express (trước kế hoạch)                | 3h        |         | 2026-10-19 |
| [x] S0.3 | Khung web React (trước kế hoạch)                  | 2h        |         | 2026-10-19 |
| [ ] S1.1 | Đọc lại phân tích; gửi GVHD câu hỏi phạm vi       | 1,5h      |         |            |
| [ ] S1.2 | PostgreSQL + pool + health                        | 2h        |         |            |
| [ ] S1.3 | Migration kho hình sao                            | 4,5h      |         |            |
| [ ] S1.4 | Seed dữ liệu demo                                 | 4h        |         |            |
| [ ] S1.5 | Báo cáo Sprint 1                                  | 1h        |         |            |
| [ ] S2.1 | Shared: schema, chuẩn hoá, gợi ý ánh xạ           | 3,5h      |         |            |
| [ ] S2.2 | API đăng nhập, phân quyền, phạm vi chi nhánh      | 4h        |         |            |
| [ ] S2.3 | Trang đăng nhập, bảo vệ route                     | 2,5h      |         |            |
| [ ] S2.4 | SQL KPI + EXPLAIN mốc                             | 2h        |         |            |
| [ ] S2.5 | Báo cáo Sprint 2                                  | 1h        |         |            |
| [ ] S2.6 | Nộp tuần 2/3: wireframe, Google Doc, repo, kế hoạch | 2h      |         |            |
| [ ] S3.1 | Upload, Extract, xem trước, gợi ý ánh xạ          | 3h        |         |            |
| [ ] S3.2 | Transform + Load                                  | 4,5h      |         |            |
| [ ] S3.3 | Giao diện nhập, lịch sử, file mẫu                 | 4,5h      |         |            |
| [ ] S3.4 | Báo cáo Sprint 3                                  | 1h        |         |            |
| [ ] S4.1 | API phân tích                                     | 4,5h      |         |            |
| [ ] S4.2 | Bộ lọc + thẻ KPI                                  | 3h        |         |            |
| [ ] S4.3 | Biểu đồ, drill-down, lọc chéo                     | 4,5h      |         |            |
| [ ] S4.4 | Báo cáo Sprint 4 + demo giữa kỳ                   | 1h        |         |            |
| [ ] S5.1 | Cảnh báo chỉ số bất thường                        | 3,5h      |         |            |
| [ ] S5.2 | Xuất Excel/PDF                                    | 3,5h      |         |            |
| [ ] S5.3 | Nguồn REST API + đồng bộ                          | 5h        |         |            |
| [ ] S5.4 | Báo cáo Sprint 5                                  | 1h        |         |            |
| [ ] S6.1 | Người dùng, chi nhánh, đổi mật khẩu               | 4h        |         |            |
| [ ] S6.2 | Cấu hình quy tắc cảnh báo                         | 1,5h      |         |            |
| [ ] S6.3 | Tối ưu truy vấn                                   | 2h        |         |            |
| [ ] S6.4 | Production + deploy                               | 4,5h      |         |            |
| [ ] S6.5 | Báo cáo Sprint 6                                  | 1h        |         |            |
| [ ] S7.1 | Hoàn thiện kiểm thử                               | 3h        |         |            |
| [ ] S7.2 | Hướng dẫn sử dụng + triển khai                    | 2,5h      |         |            |
| [ ] S7.3 | UAT                                               | 2h        |         |            |
| [ ] S7.4 | Báo cáo tổng kết + slide                          | 2,5h      |         |            |
| [ ] S7.5 | Vùng đệm                                          | 1h        |         |            |
| [ ] S8.1 | Nộp sản phẩm cuối                                 | 1,5h      |         |            |

**Tổng kế hoạch:** 92,5 giờ (không tính 8 giờ của S0 đã làm trước).

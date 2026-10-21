# Chương 4. CHỨC NĂNG CỐT LÕI & SƠ ĐỒ PHÂN RÃ CHỨC NĂNG (BFD)

## 4.1 Phương pháp xác định chức năng

Chức năng không được liệt kê theo cảm tính mà **suy ra** theo chuỗi:

```
Mục tiêu (G1–G5) ─► Vấn đề hiện trạng (P1–P8) ─► Quy trình TO-BE (QT-01…05)
      ─► Mỗi BƯỚC hệ thống trong quy trình = 1 chức năng lá trong BFD
      ─► Gom nhóm theo đối tượng nghiệp vụ (tài khoản, dữ liệu, nguồn, phân tích, báo cáo)
      ─► Gắn ưu tiên MoSCoW + sprint
```

**Tiêu chí để một chức năng là "cốt lõi" (Must):** thoả **ít nhất một**:

1. Đề tài yêu cầu trực tiếp (nhập nhiều nguồn, dashboard KPI, đăng nhập).
2. Thiếu nó thì **luồng chính end-to-end** "có file → thấy dashboard đúng" bị đứt.
3. Thiếu nó thì số liệu **sai** (vi phạm G2): chuẩn hoá, idempotent, chỉ tính đơn hoàn tất.

## 4.2 Sơ đồ phân rã chức năng

![H8 — BFD](so-do/out/08-bfd.png)

_Hình H8 — BFD 3 mức: hệ thống → 7 nhóm chức năng → 32 chức năng lá. Nhóm F7 là tác vụ nền: F7.1, F7.3, F7.4 **có trong BFD nhưng không là use case** vì không có tác nhân nào kích hoạt với một mục tiêu nghiệp vụ; riêng F7.2 ứng với UC13 vì có tác nhân thời gian "Bộ lập lịch"._

> **BFD khác Use Case thế nào?** BFD trả lời "hệ thống **gồm những chức năng gì**" (góc nhìn cấu trúc, phân cấp, không có tác nhân). Use case trả lời "**ai** dùng hệ thống **để đạt mục tiêu gì**" (góc nhìn người dùng). Vì vậy F2.3 "Chuẩn hoá & kiểm tra từng dòng" có trong BFD, nhưng không là một use case riêng: không ai mở hệ thống với mục tiêu "chuẩn hoá dữ liệu", đó là một bước bên trong UC05.

## 4.3 Bảng chức năng chi tiết

Cột **Sprint** tham chiếu bước trong `ke-hoach.md` (🆕 = bước mới đề xuất ở [7.3](07-truy-vet-va-tu-kiem-tra.md#3-tác-động-lên-kế-hoạch-và-mô-hình-dữ-liệu)).

### F1. Tài khoản & phân quyền

| Mã   | Chức năng          | Mô tả ngắn                                              | Ưu tiên | UC   | FR           | Sprint     |
| ---- | ------------------ | ------------------------------------------------------- | ------- | ---- | ------------ | ---------- |
| F1.1 | Đăng nhập          | Email + mật khẩu → cookie JWT httpOnly                  | Must    | UC01 | FR-01, FR-03 | B2.2, B2.3 |
| F1.2 | Đăng xuất          | Xoá cookie                                              | Must    | UC02 | FR-02        | B2.2, B2.3 |
| F1.3 | Đổi mật khẩu       | Cần mật khẩu cũ; vô hiệu phiên cũ                       | Should  | UC03 | FR-04, FR-08 | B4.8 🆕    |
| F1.4 | Quản lý người dùng | Danh sách, thêm, đổi vai trò, khoá/mở, đặt lại mật khẩu | Should  | UC04 | FR-05…FR-08  | B4.8 🆕    |

### F2. Nhập dữ liệu từ file

| Mã   | Chức năng               | Mô tả ngắn                                 | Ưu tiên | UC   | FR           | Sprint     |
| ---- | ----------------------- | ------------------------------------------ | ------- | ---- | ------------ | ---------- |
| F2.1 | Tải file & xem trước    | Kiểm tra file, đọc cột + 20 dòng           | Must    | UC05 | FR-10, FR-11 | B2.4       |
| F2.2 | Ánh xạ cột & mẫu ánh xạ | Gợi ý, sửa, giá trị cố định, lưu mẫu       | Must    | UC06 | FR-12…FR-14  | B2.5, B2.7 |
| F2.3 | Chuẩn hoá & kiểm tra    | Từ điển §3.5 + BR-07…BR-14                 | Must    | UC05 | FR-15, FR-16 | B2.5       |
| F2.4 | Nạp vào kho             | Transaction, upsert, xử lý nền, refresh MV | Must    | UC05 | FR-17…FR-19  | B2.6       |
| F2.5 | Lịch sử & dòng lỗi      | Danh sách job, chi tiết, tải CSV lỗi       | Must    | UC07 | FR-20, FR-21 | B2.7       |
| F2.6 | Hủy lần nhập            | Preview + xoá đơn do job tạo               | Should  | UC08 | FR-22        | B3.7 🆕    |
| F2.7 | Tải file mẫu            | `mau-du-lieu.xlsx`                         | Should  | UC09 | FR-23        | B2.7       |

### F3. Nguồn dữ liệu kết nối

| Mã   | Chức năng                  | Mô tả ngắn                                 | Ưu tiên | UC         | FR    | Sprint     |
| ---- | -------------------------- | ------------------------------------------ | ------- | ---------- | ----- | ---------- |
| F3.1 | Khai báo nguồn CSDL        | Form kết nối + câu SELECT + cột mốc        | Should  | UC10       | FR-24 | B4.1, B4.2 |
| F3.2 | Khai báo nguồn REST API    | URL, header, đường dẫn dữ liệu, phân trang | Should  | UC10       | FR-25 | B4.4       |
| F3.3 | Kiểm tra kết nối           | Timeout 10 s, 20 bản ghi mẫu               | Should  | UC11       | FR-26 | B4.2       |
| F3.4 | Đồng bộ ngay               | Chạy pipeline với khoá chống chạy chồng    | Should  | UC12       | FR-27 | B4.2, B4.4 |
| F3.5 | Đặt lịch đồng bộ           | Preset / cron, `node-cron`                 | Should  | UC10, UC13 | FR-28 | B4.5       |
| F3.6 | Sửa / tạm dừng / xoá nguồn | Giữ bí mật cũ khi để trống                 | Should  | UC10       | FR-29 | B4.1       |

### F4. Phân tích & trực quan hoá

| Mã   | Chức năng              | Mô tả ngắn                          | Ưu tiên                 | UC   | FR                 | Sprint     |
| ---- | ---------------------- | ----------------------------------- | ----------------------- | ---- | ------------------ | ---------- |
| F4.1 | KPI + so sánh kỳ trước | 4 thẻ, delta %                      | Must                    | UC14 | FR-30              | B3.2, B3.3 |
| F4.2 | Xu hướng doanh thu     | Đường, ngày/tuần/tháng, điền 0      | Must                    | UC14 | FR-31              | B3.2, B3.4 |
| F4.3 | Top sản phẩm           | Thanh ngang + bảng                  | Must                    | UC14 | FR-32              | B3.2, B3.4 |
| F4.4 | Theo danh mục          | Donut, gộp "Khác"                   | Must                    | UC14 | FR-33              | B3.2, B3.4 |
| F4.5 | Theo kênh              | Cột: doanh thu, số đơn              | Must                    | UC14 | FR-34              | B3.2, B3.4 |
| F4.6 | Bộ lọc & lọc chéo      | Thời gian, nhiều kênh/danh mục, URL | Must (lọc chéo: Should) | UC15 | FR-35…FR-38, FR-43 | B3.3, B3.5 |
| F4.7 | Phân tích khách hàng   | Mới/quay lại, RFM                   | Could                   | UC17 | FR-41              | Vùng đệm   |

### F5. Báo cáo & chia sẻ · F6. Danh mục · F7. Tác vụ hệ thống

| Mã   | Chức năng              | Mô tả ngắn                  | Ưu tiên | UC   | FR    | Sprint   |
| ---- | ---------------------- | --------------------------- | ------- | ---- | ----- | -------- |
| F5.1 | Xuất CSV               | 4 loại báo cáo, theo bộ lọc | Should  | UC16 | FR-40 | B4.6     |
| F5.2 | Chia sẻ link           | Bộ lọc trên URL             | Must    | UC15 | FR-38 | B3.3     |
| F6.1 | Xem danh mục dữ liệu   | DS sản phẩm/danh mục/kênh   | Could   | UC18 | FR-42 | Vùng đệm |
| F6.2 | Sửa danh mục dữ liệu   | Đổi tên SP, gán danh mục    | Could   | UC18 | FR-42 | Vùng đệm |
| F7.1 | Làm mới bảng tổng hợp  | `REFRESH … CONCURRENTLY`    | Must    | —    | FR-46 | B3.1     |
| F7.2 | Chạy đồng bộ theo lịch | Scheduler đọc nguồn có cron | Should  | UC13 | FR-28 | B4.5     |
| F7.3 | Kiểm tra sức khoẻ      | `/api/health` + DB          | Must    | —    | FR-44 | B1.4     |
| F7.4 | Dọn job mồ côi         | Khi khởi động               | Must    | —    | FR-45 | B2.6     |

**Thống kê:** 32 chức năng lá — **Must 17** · **Should 12** · **Could 3** (lọc chéo trong F4.6 là Should).

## 4.4 Bộ chức năng tối thiểu chạy được (MVP) và thứ tự phụ thuộc

Nếu chỉ còn thời gian cho phần Must, hệ thống vẫn phải demo được **luồng xuyên suốt**:

```
 F7.3 health ─► F1.1 đăng nhập ─► F2.1 tải file ─► F2.2 ánh xạ ─► F2.3 chuẩn hoá
                                                                      │
   F4.6 bộ lọc ◄── F4.1–F4.5 dashboard ◄── F7.1 refresh MV ◄── F2.4 nạp (transaction)
        │
        └─► F5.2 chia sẻ link
```

**Phụ thuộc giữa các nhóm** (quyết định thứ tự sprint, đọc là "A cần B có trước"):

| Nhóm              | Phụ thuộc vào                                          | Vì sao                                                     |
| ----------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| F2 Nhập file      | F1 (người tạo job), schema B1.5                        | `import_jobs.created_by` cần user                          |
| F3 Nguồn kết nối  | **F2.2–F2.4** (dùng lại pipeline)                      | Không viết pipeline thứ hai, chỉ thêm extractor            |
| F4 Phân tích      | F2.4 + F7.1 (có dữ liệu + MV) — hoặc dữ liệu seed B1.6 | Sprint 3 làm song song được nhờ seed                       |
| F2.6 Hủy lần nhập | F2.4 với cột `created_job_id`/`last_job_id`            | Phải có cột từ migration đầu (B1.5) để khỏi sửa dữ liệu cũ |
| F5.1 Xuất CSV     | F4 (dùng lại câu truy vấn analytics)                   | Số liệu xuất phải **khớp** dashboard                       |

> **Hệ quả quan trọng cho B1.5 (sắp làm):** các cột mới (`users.role` 3 giá trị, `users.is_active`, `orders.created_job_id/last_job_id`, `import_jobs.created_by/skipped_rows/...`) nên có **ngay trong migration đầu**. Thêm sau cũng được (migration mới), nhưng sẽ phải xử lý giá trị cho dữ liệu đã có. Danh sách đầy đủ ở [7.3](07-truy-vet-va-tu-kiem-tra.md#3-tác-động-lên-kế-hoạch-và-mô-hình-dữ-liệu).

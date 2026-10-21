# Chương 6. ĐẶC TẢ USE CASE

> **Mẫu đặc tả:** Mã · Tên · Tác nhân · Mục tiêu · Kích hoạt · Tiền điều kiện · Hậu điều kiện (thành công / thất bại) · Luồng chính · Luồng thay thế (A) · Ngoại lệ (E) · Quy tắc · Giao diện & API · **Tiêu chí chấp nhận (AC)** dạng _Cho trước – Khi – Thì_ (Given–When–Then).
>
> AC là cầu nối sang kiểm thử: **mỗi AC = ít nhất 1 test case** (Supertest cho API, Testing Library hoặc thao tác tay cho UI). Khi tick một bước trong `ke-hoach.md`, các AC tương ứng phải pass.

Đặc tả đầy đủ cho 14 use case (UC05+UC06, UC10+UC11, UC12+UC13, UC14+UC15 viết chung mục vì dùng chung luồng); 4 use case đơn giản đặc tả rút gọn ở [6.12](#612-đặc-tả-rút-gọn-uc02-uc09-uc17-uc18).

---

## 6.1 UC01 — Đăng nhập

| Mục             | Nội dung                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Tác nhân        | Viewer, Analyst, Admin                                                                         |
| Mục tiêu        | Vào hệ thống với đúng quyền của mình                                                           |
| Kích hoạt       | Mở trang `/login`, hoặc truy cập trang cần đăng nhập khi chưa có phiên                         |
| Tiền điều kiện  | Tài khoản tồn tại và đang hoạt động (`is_active = true`)                                       |
| Hậu điều kiện ✓ | Cookie `token` (httpOnly) được đặt; `users.last_login_at` cập nhật; chuyển tới `next` hoặc `/` |
| Hậu điều kiện ✗ | Không có cookie; không lộ thông tin email có tồn tại hay không                                 |

**Luồng chính**

1. Người dùng nhập email, mật khẩu, bấm "Đăng nhập".
2. FE kiểm tra định dạng (email hợp lệ, mật khẩu không rỗng) bằng schema `LoginInput`.
3. Gửi `POST /api/auth/login`.
4. BE tìm user theo email (không phân biệt hoa thường), so sánh `bcrypt.compare`.
5. BE ký JWT `{ sub, iat }`, hạn 8 giờ, đặt cookie; trả `{ id, email, fullName, role, mustChangePassword }`.
6. FE chuyển tới `next` (chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/`) hoặc `/`.

**Luồng thay thế**

- A1 (sau bước 5) `mustChangePassword = true` → chuyển tới màn hình đổi mật khẩu (UC03), chặn mọi trang khác tới khi đổi xong.

**Ngoại lệ**

- E1 Sai email hoặc mật khẩu → 401 "Sai email hoặc mật khẩu". **Vẫn chạy bcrypt với hash giả** khi email không tồn tại để thời gian phản hồi như nhau (chống dò email qua thời gian phản hồi).
- E2 Tài khoản bị khoá → 401 "Tài khoản đã bị khoá. Liên hệ quản trị viên." (chỉ khi mật khẩu **đúng**, để không lộ trạng thái cho người đoán mò).
- E3 Quá 10 lần/phút/IP → 429 "Thử lại sau 1 phút".

**Quy tắc:** BR-20, BR-21 · **API:** `POST /api/auth/login`, `GET /api/auth/me`

| AC      | Cho trước                            | Khi                               | Thì                                                                   |
| ------- | ------------------------------------ | --------------------------------- | --------------------------------------------------------------------- |
| AC-01.1 | user `a@x.vn` / `Matkhau1` hoạt động | đăng nhập đúng                    | 200, có `Set-Cookie: token=…; HttpOnly`, body không có `passwordHash` |
| AC-01.2 | như trên                             | sai mật khẩu                      | 401, thông báo chung                                                  |
| AC-01.3 | không có user `b@x.vn`               | đăng nhập `b@x.vn`                | 401, **cùng** thông báo với AC-01.2                                   |
| AC-01.4 | user bị khoá                         | đăng nhập đúng mật khẩu           | 401 "Tài khoản đã bị khoá…"                                           |
| AC-01.5 | đã đăng nhập                         | F5 trang `/`                      | vẫn ở `/`, không về `/login`                                          |
| AC-01.6 | chưa đăng nhập                       | mở `/imports`                     | chuyển `/login?next=/imports`; đăng nhập xong về `/imports`           |
| AC-01.7 | —                                    | `next=https://evil.com`           | bỏ qua `next`, về `/` (chống open redirect)                           |
| AC-01.8 | —                                    | đăng nhập sai 11 lần trong 1 phút | lần 11 → 429                                                          |

---

## 6.2 UC03 — Đổi mật khẩu

| Mục             | Nội dung                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tác nhân        | Viewer, Analyst, Admin (chính mình)                                                                                                                   |
| Tiền điều kiện  | Đã đăng nhập                                                                                                                                          |
| Hậu điều kiện ✓ | `password_hash` mới; `password_changed_at = now()`; `must_change_password = false`; **mọi phiên khác bị vô hiệu**; phiên hiện tại được cấp cookie mới |

**Luồng chính:** 1) Nhập mật khẩu hiện tại, mật khẩu mới, nhập lại. 2) FE kiểm tra BR-20 và 2 ô trùng nhau. 3) `PATCH /api/auth/password`. 4) BE kiểm tra mật khẩu hiện tại, kiểm tra BR-20, mới ≠ cũ. 5) Cập nhật, cấp cookie mới, báo "Đã đổi mật khẩu".

**Ngoại lệ:** E1 mật khẩu hiện tại sai → 400 "Mật khẩu hiện tại không đúng". E2 vi phạm BR-20 → 400 kèm lý do cụ thể. E3 mới = cũ → 400.

| AC      | Cho trước                      | Khi                                   | Thì                                          |
| ------- | ------------------------------ | ------------------------------------- | -------------------------------------------- |
| AC-03.1 | đăng nhập ở 2 trình duyệt A, B | đổi mật khẩu ở A                      | A vẫn dùng được; B gọi API bất kỳ → 401      |
| AC-03.2 | —                              | mật khẩu mới `abcdefgh` (không có số) | 400 "Mật khẩu phải có ít nhất 1 chữ và 1 số" |
| AC-03.3 | user có `must_change_password` | đổi thành công                        | vào được dashboard                           |

---

## 6.3 UC04 — Quản lý người dùng

| Mục             | Nội dung                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Tác nhân        | Admin                                                                                          |
| Mục tiêu        | Cấp và thu hồi quyền truy cập cho nhân viên                                                    |
| Tiền điều kiện  | Đăng nhập với vai trò admin                                                                    |
| Hậu điều kiện ✓ | Thay đổi được lưu; người bị khoá/đổi vai trò chịu ảnh hưởng **ngay ở request kế tiếp** (BR-21) |

**Luồng chính (xem danh sách — luôn chạy, include UC04.1):** 1) Mở "Người dùng". 2) `GET /api/users` → bảng: email, họ tên, vai trò, trạng thái, đăng nhập lần cuối.

**Luồng con (extend):**

- **UC04.2 Thêm:** nhập email, họ tên, vai trò, mật khẩu tạm (hoặc bấm "Tạo ngẫu nhiên") → `POST /api/users` → user mới với `must_change_password = true` → hiển thị mật khẩu tạm **một lần** để admin gửi cho nhân viên.
- **UC04.3 Đổi vai trò:** chọn vai trò mới → `PATCH /api/users/:id { role }`.
- **UC04.4 Khoá/Mở khoá:** `PATCH /api/users/:id { isActive }` sau hộp xác nhận.
- **UC04.5 Đặt lại mật khẩu:** `POST /api/users/:id/reset-password` → mật khẩu tạm mới, `must_change_password = true`, `password_changed_at = now()` (phiên cũ của người đó mất hiệu lực).

**Ngoại lệ:** E1 email đã tồn tại → 409 "Email đã được sử dụng". E2 admin tự khoá/hạ quyền mình → 400 "Không thể thay đổi vai trò/trạng thái của chính bạn". E3 thao tác làm số admin hoạt động = 0 → 400 (BR-23). E4 mật khẩu tạm vi phạm BR-20 → 400.

> **Vì sao không có "Xoá người dùng"?** `import_jobs.created_by` tham chiếu user. Xoá cứng thì hoặc lỗi FK, hoặc mất dấu vết "ai đã nhập dữ liệu này". Khoá tài khoản (soft disable) đạt cùng mục tiêu "thu hồi quyền" mà giữ được lịch sử.

| AC      | Cho trước                | Khi                                  | Thì                                                                         |
| ------- | ------------------------ | ------------------------------------ | --------------------------------------------------------------------------- |
| AC-04.1 | đăng nhập analyst        | `GET /api/users`                     | 403                                                                         |
| AC-04.2 | admin                    | thêm user email trùng                | 409                                                                         |
| AC-04.3 | analyst X đang đăng nhập | admin khoá X                         | request kế tiếp của X → 401                                                 |
| AC-04.4 | chỉ có 1 admin           | admin đó tự đổi vai trò thành viewer | 400, vai trò không đổi                                                      |
| AC-04.5 | admin                    | đổi viewer Y thành analyst           | Y (không cần đăng nhập lại) gọi `POST /api/imports/preview` → không còn 403 |

---

## 6.4 UC05 — Nhập dữ liệu từ file (gồm UC06 Ánh xạ cột)

| Mục             | Nội dung                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Tác nhân        | Analyst (+)                                                                                                                            |
| Mục tiêu        | Đưa đơn hàng từ file vào hệ thống, biết chính xác dòng nào lỗi và vì sao                                                               |
| Kích hoạt       | Bấm "Nhập dữ liệu"                                                                                                                     |
| Tiền điều kiện  | Đăng nhập analyst+; có file `.csv`/`.xlsx`                                                                                             |
| Hậu điều kiện ✓ | 1 `import_jobs` trạng thái `success`/`partial`; dữ liệu hợp lệ nằm trong bảng chính; MV đã làm mới; dòng lỗi lưu trong `import_errors` |
| Hậu điều kiện ✗ | Job `failed`; bảng chính **không thay đổi** (rollback)                                                                                 |
| Quy trình       | QT-01 (Hình H3)                                                                                                                        |

**Luồng chính**

| #   | Tác nhân                                                  | Hệ thống                                                                                                                                                                                                                                                           |
| --- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Chọn file (kéo thả hoặc bấm chọn)                         |                                                                                                                                                                                                                                                                    |
| 2   |                                                           | `POST /api/imports/preview` (multipart): kiểm tra BR-16, đọc tên cột + 20 dòng đầu, trả `{ previewId, columns, sampleRows, totalRowsEstimate, suggestedMapping, matchedTemplateId? }`. File tạm giữ 30 phút theo `previewId`                                       |
| 3   |                                                           | **[UC06]** Hiển thị bảng ánh xạ: mỗi **trường hệ thống** (13 trường §3.5.1) một hàng, dropdown chọn cột của file / "Giá trị cố định" / "Không dùng". Trường bắt buộc có dấu \*. Cạnh bảng: 20 dòng xem trước **sau khi chuẩn hoá** để người dùng thấy ngay kết quả |
| 4   | Sửa ánh xạ, chọn định dạng ngày, đặt kênh cố định nếu cần | Cập nhật bản xem trước theo thời gian thực (chuẩn hoá chạy ở FE bằng **cùng hàm** trong `packages/shared`)                                                                                                                                                         |
| 5   | (Tuỳ chọn) tích "Lưu mẫu ánh xạ", đặt tên                 |                                                                                                                                                                                                                                                                    |
| 6   | Bấm "Nhập dữ liệu"                                        | Kiểm tra đủ trường bắt buộc                                                                                                                                                                                                                                        |
| 7   |                                                           | `POST /api/imports { previewId, mapping, saveTemplate? }` → tạo job `pending` → **202 `{ jobId }`**                                                                                                                                                                |
| 8   |                                                           | Worker: `running` → đọc stream từng dòng → chuẩn hoá/validate → staging / errors → kiểm tra nhất quán theo đơn (BR-07) → load 1 transaction → refresh MV → `success`/`partial`                                                                                     |
| 9   | Màn hình tiến độ                                          | FE gọi `GET /api/imports/:jobId` mỗi 1 s: `{ status, processedRows, totalRows }`                                                                                                                                                                                   |
| 10  |                                                           | Khi xong: hiển thị **Tổng / Hợp lệ / Lỗi / Bỏ qua / Đơn mới / Đơn cập nhật** + nút "Tải dòng lỗi" (nếu có) + "Xem dashboard"                                                                                                                                       |

**Luồng thay thế**

- A1 (bước 2) Tập tên cột khớp một mẫu đã lưu → áp dụng mẫu, hiện thông báo "Đã áp dụng mẫu 'Shopee – xuất đơn'".
- A2 (bước 3) Định dạng ngày "Tự động" không phân định được → hiện cảnh báo vàng "Không chắc ngày dạng dd/MM hay MM/dd, đang hiểu là dd/MM. Hãy kiểm tra cột Ngày ở bản xem trước".
- A3 (bước 8) Mọi dòng là đơn trạng thái trung gian → job `success`, 0 đơn, thông báo "Không có đơn hoàn tất để nhập" (BR-08, BR-15).
- A4 (bước 10) Người dùng rời trang khi job đang chạy → job **vẫn chạy**; xem kết quả sau ở UC07.

**Ngoại lệ**

- E1 Sai đuôi / quá 10 MB / `.xls` → 400 / 413 với hướng dẫn (BR-16).
- E2 File rỗng, quá 50.000 dòng, quá 50 cột → 400 (không tạo job).
- E3 Thiếu trường bắt buộc khi bấm Nhập → nút bị vô hiệu, liệt kê trường thiếu.
- E4 `previewId` hết hạn (> 30 phút) → 410 "Phiên xem trước đã hết hạn, hãy chọn lại file".
- E5 Lỗi CSDL khi load → rollback, job `failed`, thông báo chung "Không thể lưu dữ liệu, chưa có thay đổi nào được ghi. Vui lòng thử lại."

**Quy tắc:** BR-06…BR-16, BR-19 · **API:** `POST /api/imports/preview`, `POST /api/imports`, `GET /api/imports/:id`, `GET/POST /api/mapping-templates`

| AC       | Cho trước                                               | Khi                                        | Thì                                                                                              |
| -------- | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| AC-05.1  | file mẫu §3.5.2 (3 dòng)                                | nhập                                       | job `success`; 2 đơn, 3 dòng đơn; doanh thu ngày 21/10/2026 = **630.000**                        |
| AC-05.2  | đã nhập AC-05.1                                         | nhập lại **cùng file**                     | job `success`; 0 đơn mới, 2 đơn cập nhật; doanh thu vẫn **630.000**                              |
| AC-05.3  | file 10 dòng, dòng 4 thiếu SKU, dòng 7 số lượng `2.5`   | nhập                                       | `partial`; lỗi ở **dòng 4** và **dòng 7** (đếm cả dòng tiêu đề là dòng 1), đúng tên cột và lý do |
| AC-05.4  | 2 dòng cùng mã đơn, khác ngày đặt                       | nhập                                       | cả 2 dòng vào lỗi với lý do "không nhất quán… cột: Ngày đặt"                                     |
| AC-05.5  | CSV lưu từ Excel "CSV UTF-8" (có BOM), cột đầu "Mã đơn" | preview                                    | tên cột đầu là `Mã đơn` (không phải `﻿Mã đơn`)                                                   |
| AC-05.6  | ô Excel kiểu ngày `21/10/2026 00:30`                    | nhập                                       | đơn thuộc **ngày 21/10** trên dashboard (không bị lùi về 20/10 do UTC)                           |
| AC-05.7  | ô chữ `"1.200.000"`, `"150.000 ₫"`, `"12,5"`            | chuẩn hoá đơn giá                          | 1200000; 150000; 13                                                                              |
| AC-05.8  | file `.pdf` / file 11 MB                                | preview                                    | 400 / 413                                                                                        |
| AC-05.9  | giả lập lỗi ở bước chèn `order_items`                   | nhập                                       | `failed`; `SELECT count(*) FROM orders` không đổi                                                |
| AC-05.10 | file 10.000 dòng                                        | nhập                                       | xong < 15 s; trong lúc chạy `/api/health` < 500 ms                                               |
| AC-05.11 | dòng trạng thái `Đang giao`                             | nhập                                       | dòng đếm vào **Bỏ qua**, không vào lỗi                                                           |
| AC-05.12 | đã lưu mẫu "Shopee"                                     | preview file có cùng tập cột (khác thứ tự) | tự áp dụng mẫu "Shopee"                                                                          |
| AC-05.13 | viewer                                                  | `POST /api/imports/preview`                | 403                                                                                              |

---

## 6.5 UC07 — Xem lịch sử & lỗi nhập

| Mục            | Nội dung                         |
| -------------- | -------------------------------- |
| Tác nhân       | Analyst (+)                      |
| Tiền điều kiện | Đăng nhập analyst+               |
| Hậu điều kiện  | Không thay đổi dữ liệu (chỉ đọc) |

**Luồng chính:** 1) Mở "Lịch sử nhập". 2) `GET /api/imports?status=&page=` → bảng mới nhất trước: thời gian bắt đầu, nguồn (tên file hoặc tên nguồn), người thực hiện / "Lịch tự động", trạng thái (nhãn màu), Tổng/OK/Lỗi/Bỏ qua, thời lượng. 3) Bấm một dòng → chi tiết + 50 lỗi đầu (`GET /api/imports/:id/errors?page=`).

**Luồng con:** UC07.1 "Tải dòng lỗi" → `GET /api/imports/:id/errors?format=csv` → file `loi-nhap-<id>.csv` (UTF-8 BOM) gồm **các cột gốc** + cột `Dòng` + `Lý do lỗi`. UC08 "Hủy lần nhập" từ màn hình chi tiết.

| AC      | Cho trước                                                  | Khi                        | Thì                                                  |
| ------- | ---------------------------------------------------------- | -------------------------- | ---------------------------------------------------- |
| AC-07.1 | job có 3 dòng lỗi                                          | tải CSV lỗi, mở bằng Excel | 3 dòng, tiếng Việt hiển thị đúng, có cột "Lý do lỗi" |
| AC-07.2 | job do Bộ lập lịch tạo                                     | xem lịch sử                | cột người thực hiện hiển thị "Lịch tự động"          |
| AC-07.3 | sửa 3 dòng trong file lỗi rồi nhập lại **file lỗi đã sửa** | nhập                       | 3 dòng vào thành công, không ảnh hưởng đơn khác      |

---

## 6.6 UC08 — Hủy lần nhập

| Mục             | Nội dung                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------- |
| Tác nhân        | Analyst (job của mình), Admin (mọi job)                                                   |
| Mục tiêu        | Gỡ dữ liệu của một lần nhập nhầm mà không làm hỏng dữ liệu khác                           |
| Tiền điều kiện  | Job ở trạng thái `success`/`partial`                                                      |
| Hậu điều kiện ✓ | Đơn thuộc nhóm A bị xoá (dòng đơn xoá theo `ON DELETE CASCADE`); job `undone`; MV làm mới |
| Quy trình       | QT-04 (Hình H6)                                                                           |

**Luồng chính:** 1) Ở chi tiết job, bấm "Hủy lần nhập". 2) `GET /api/imports/:id/undo-preview` → `{ deletable: A, keptModifiedLater: B, keptPreExisting: C }`. 3) Hộp xác nhận: "Sẽ xoá **A** đơn do lần nhập này tạo. **B** đơn đã được lần nhập sau cập nhật và **C** đơn đã có từ trước sẽ được giữ nguyên. Thao tác không thể hoàn tác." 4) Xác nhận → `POST /api/imports/:id/undo`. 5) BE: kiểm tra lại quyền và trạng thái, lấy khoá ghi (BR-19), xoá A trong 1 transaction, đặt `undone`, commit, refresh MV. 6) Báo "Đã hủy: xoá A đơn".

**Truy vấn cốt lõi:**

```sql
-- preview
SELECT
  count(*) FILTER (WHERE created_job_id = $1 AND last_job_id = $1)  AS deletable,
  count(*) FILTER (WHERE created_job_id = $1 AND last_job_id <> $1) AS kept_modified_later,
  count(*) FILTER (WHERE created_job_id <> $1 AND last_job_id = $1) AS kept_pre_existing
FROM orders WHERE created_job_id = $1 OR last_job_id = $1;
-- thực hiện (trong transaction, sau pg_advisory_xact_lock)
DELETE FROM orders WHERE created_job_id = $1 AND last_job_id = $1;
```

> Lưu ý: nhóm C chỉ đếm được đơn mà **J là job ghi gần nhất**. Đơn bị J cập nhật rồi lại bị job sau cập nhật tiếp thì không còn dấu vết về J. Điều này không ảnh hưởng kết quả (đơn đó vẫn được giữ), chỉ làm con số C trong thông báo có thể nhỏ hơn thực tế. Ghi vào hạn chế.

**Ngoại lệ:** E1 analyst hủy job của người khác → 403. E2 job `failed`/`undone`/`running` → 409 "Lần nhập này không thể hủy (trạng thái: …)". E3 A = 0 → vẫn cho hủy (đánh dấu `undone`), thông báo "Không có đơn nào bị xoá".

| AC      | Cho trước                    | Khi     | Thì                                                        |
| ------- | ---------------------------- | ------- | ---------------------------------------------------------- |
| AC-08.1 | job J1 tạo đơn D1, D2        | hủy J1  | D1, D2 bị xoá; doanh thu giảm đúng phần D1+D2; J1 `undone` |
| AC-08.2 | J1 tạo D1; J2 cập nhật D1    | hủy J1  | D1 **còn**; preview `keptModifiedLater = 1`                |
| AC-08.3 | D1 có từ J0; J1 cập nhật D1  | hủy J1  | D1 còn; preview `keptPreExisting = 1`                      |
| AC-08.4 | analyst X, job của analyst Y | X hủy   | 403                                                        |
| AC-08.5 | J1 đã `undone`               | hủy lại | 409                                                        |

---

## 6.7 UC10 — Quản lý nguồn dữ liệu kết nối (gồm UC11 Kiểm tra kết nối)

| Mục             | Nội dung                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tác nhân        | Admin (chính); Hệ thống nguồn ngoài (phụ, ở UC11)                                                                                                |
| Tiền điều kiện  | Đăng nhập admin; biến môi trường `ENCRYPTION_KEY` hợp lệ (32 byte)                                                                               |
| Hậu điều kiện ✓ | `data_sources` có bản ghi với `config_encrypted`, `column_mapping`, `schedule_cron`; lịch được đăng ký lại ngay (không cần khởi động lại server) |
| Quy trình       | QT-02 phần (a) (Hình H4)                                                                                                                         |

**Luồng chính (UC10.1 Thêm nguồn CSDL):**

1. Bấm "Thêm nguồn" → chọn "CSDL".
2. Nhập: tên nguồn, loại CSDL, host, port, database, user, password, SSL (bật/tắt), câu `SELECT`, cột mốc thời gian (tuỳ chọn).
3. **[UC11]** Bấm "Kiểm tra kết nối" → `POST /api/sources/test` (cấu hình chưa lưu) → BE kết nối (timeout 10 s), chạy câu lệnh trong transaction chỉ đọc với `LIMIT 20` → trả `{ columns, sampleRows }`.
4. **[UC06]** Ánh xạ cột trên 20 bản ghi mẫu.
5. Chọn lịch: "Không tự động" / "Mỗi giờ" / "Mỗi ngày lúc HH:mm" / "Nâng cao (cron)".
6. Bấm "Lưu" (chỉ bật khi bước 3 thành công **với đúng cấu hình hiện tại**; sửa bất kỳ ô kết nối nào → phải kiểm tra lại).
7. BE: validate, mã hoá cấu hình (AES-256-GCM, IV ngẫu nhiên mỗi lần), lưu, đăng ký lại lịch.

**Luồng con:** UC10.2 Thêm nguồn REST API (như trên với: base URL, tên + giá trị header xác thực, đường dẫn tới mảng dữ liệu, kiểu phân trang, tên tham số mốc thời gian). UC10.3 Sửa (ô bí mật hiển thị `••••`; để trống = giữ nguyên). UC10.4 Tạm dừng/kích hoạt (`is_active`; tạm dừng → huỷ đăng ký lịch). UC10.5 Xoá (hộp xác nhận; dữ liệu đã nhập **giữ nguyên**, `import_jobs.source_id` → `NULL`). UC10.6 Đặt lịch.

**Ngoại lệ (UC11):** E1 sai host/port/timeout → "Không kết nối được tới máy chủ (hết thời gian chờ 10 giây)". E2 sai user/password → "Sai tên đăng nhập hoặc mật khẩu CSDL". E3 câu lệnh không bắt đầu bằng `SELECT`/`WITH` → 400 trước khi kết nối. E4 câu lệnh lỗi cú pháp → hiện thông báo lỗi của CSDL (đã lọc bỏ thông tin kết nối). E5 REST trả 401/403 → "API từ chối xác thực, kiểm tra header". E6 đường dẫn mảng dữ liệu không tồn tại trong JSON → "Không tìm thấy mảng dữ liệu tại 'data'". E7 cron sai cú pháp → 400.

| AC      | Cho trước             | Khi                               | Thì                                                                                                   |
| ------- | --------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AC-10.1 | admin                 | lưu nguồn có password `Secret!23` | `SELECT config_encrypted` không chứa chuỗi `Secret!23`; `GET /api/sources/:id` không chứa `Secret!23` |
| AC-10.2 | nguồn đã lưu          | sửa tên, để trống password        | kiểm tra kết nối vẫn thành công (password cũ được giữ)                                                |
| AC-10.3 | —                     | câu lệnh `DELETE FROM orders`     | 400, không kết nối tới nguồn                                                                          |
| AC-10.4 | analyst               | `POST /api/sources`               | 403                                                                                                   |
| AC-10.5 | nguồn lịch mỗi 2 phút | tạm dừng nguồn                    | không có job mới sau 5 phút                                                                           |

---

## 6.8 UC12 — Đồng bộ ngay · UC13 — Đồng bộ theo lịch

Hai use case dùng **chung luồng xử lý**, khác tác nhân kích hoạt và cách phản ứng khi nguồn đang bận.

| Mục                                  | UC12 Đồng bộ ngay                           | UC13 Đồng bộ theo lịch                            |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------------- |
| Tác nhân chính                       | Analyst (+)                                 | Bộ lập lịch                                       |
| Tác nhân phụ                         | Hệ thống nguồn ngoài                        | Hệ thống nguồn ngoài                              |
| Kích hoạt                            | Bấm "Đồng bộ ngay" ở danh sách nguồn        | Đến thời điểm theo `schedule_cron` (giờ Việt Nam) |
| Tiền điều kiện                       | Nguồn tồn tại, `is_active = true`           | Như trái + có `schedule_cron`                     |
| Nguồn đang đồng bộ                   | 409 "Nguồn đang được đồng bộ, vui lòng chờ" | Bỏ qua lần này, ghi log mức info                  |
| `import_jobs.trigger` / `created_by` | `manual` / id người bấm                     | `schedule` / `NULL`                               |

**Luồng chính (chung):** 1) Lấy khoá `pg_try_advisory_lock(source_id)`. 2) Tạo job `pending` (UC12 trả 202 `{ jobId }`). 3) Giải mã cấu hình trong bộ nhớ. 4) Extract tăng dần từ `last_synced_at` (BR-18): CSDL đọc theo lô 1.000 bản ghi bằng cursor; REST gọi từng trang tới khi hết `next_page`. 5) Mỗi lô → Map (mẫu ánh xạ đã lưu) → chuẩn hoá/validate → staging/errors. 6) Load 1 transaction (như UC05) → refresh MV. 7) Thành công: `last_synced_at = started_at`. 8) Mở khoá (trong `finally`, kể cả khi lỗi).

**Ngoại lệ:** E1 mất kết nối/timeout/429/5xx → retry 3 lần (1 s, 2 s, 4 s) → vẫn lỗi: job `failed`, **giữ** `last_synced_at`. E2 401/403/404 → `failed` ngay, không retry. E3 vượt 200.000 bản ghi/lần → dừng, `failed` "Vượt giới hạn, hãy thêm điều kiện lọc hoặc cột mốc thời gian". E4 nguồn đổi cấu trúc cột (thiếu cột đã ánh xạ) → `failed` "Cột 'X' không còn tồn tại ở nguồn, hãy cập nhật ánh xạ".

| AC      | Cho trước                        | Khi                  | Thì                                                          |
| ------- | -------------------------------- | -------------------- | ------------------------------------------------------------ |
| AC-12.1 | mock API có 120 đơn              | đồng bộ lần 1        | 120 đơn vào hệ thống                                         |
| AC-12.2 | sau AC-12.1, mock thêm 5 đơn mới | đồng bộ lần 2        | job chỉ đọc 5 bản ghi (log), tổng 125 đơn                    |
| AC-12.3 | tắt mock API giữa chừng          | đồng bộ              | job `failed`; `last_synced_at` không đổi; lần sau lấy lại đủ |
| AC-12.4 | job đồng bộ nguồn S đang chạy    | bấm "Đồng bộ ngay" S | 409; không có job thứ 2                                      |
| AC-13.1 | lịch mỗi 2 phút                  | chờ 5 phút           | xuất hiện 2 job `trigger = schedule`                         |

---

## 6.9 UC14 — Xem dashboard tổng quan (gồm UC15 Lọc & so sánh)

| Mục            | Nội dung                                                             |
| -------------- | -------------------------------------------------------------------- |
| Tác nhân       | Viewer (+)                                                           |
| Mục tiêu       | Nắm tình hình kinh doanh trong một khoảng thời gian, so với kỳ trước |
| Kích hoạt      | Mở `/` hoặc một link chia sẻ có tham số lọc                          |
| Tiền điều kiện | Đã đăng nhập                                                         |
| Hậu điều kiện  | Không thay đổi dữ liệu; URL phản ánh bộ lọc hiện tại                 |
| Quy trình      | QT-03 (Hình H5)                                                      |

**Luồng chính**

1. FE đọc tham số URL; thiếu → mặc định BR-22 (30 ngày, mọi kênh, mọi danh mục, độ chi tiết tự động).
2. FE gọi **song song** 5 API với cùng bộ lọc (TanStack Query, khoá cache = bộ lọc).
3. Hiển thị bố cục:

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Thời gian ▾ 30 ngày gần nhất]  [Kênh ▾ Tất cả]  [Danh mục ▾ Tất cả]  │
│                                   [Xoá lọc]  [Xuất CSV ▾] (analyst+)  │
├────────────────┬────────────────┬────────────────┬────────────────────┤
│ Doanh thu      │ Số đơn         │ Giá trị TB/đơn │ Khách hàng ⓘ       │
│ 125.400.000 ₫  │ 812            │ 154.433 ₫      │ 530                │
│ ▲ +12,5 %      │ ▲ +8,1 %       │ ▲ +4,1 %       │ ▼ −2,0 %           │
├────────────────┴────────────────┴────────────────┴────────────────────┤
│ Xu hướng doanh thu                       [Ngày | Tuần | Tháng]        │
│ (biểu đồ đường)                                                       │
├───────────────────────────────────┬───────────────────────────────────┤
│ Top 10 sản phẩm [Doanh thu|SL]    │ Theo danh mục (donut)             │
├───────────────────────────────────┴───────────────────────────────────┤
│ Theo kênh (cột: doanh thu + số đơn)                                   │
├───────────────────────────────────────────────────────────────────────┤
│ Dữ liệu cập nhật lúc 08:42 21/10/2026                                 │
└───────────────────────────────────────────────────────────────────────┘
  Màn hình 375 px: các khối xếp dọc, KPI thành lưới 2×2.
```

**Luồng mở rộng UC15:**

- UC15.1 Chọn preset hoặc khoảng tuỳ chọn → URL cập nhật `from`, `to` → gọi lại API.
- UC15.2 Chọn nhiều kênh/danh mục (danh sách từ `GET /api/catalog/channels|categories`) → `channel=shopee,store`.
- UC15.3 Click một lát donut / một cột kênh → thêm giá trị đó vào bộ lọc tương ứng.
- UC14.6 Đổi độ chi tiết ngày/tuần/tháng → chỉ gọi lại API xu hướng.

**Hợp đồng API (tóm tắt, chi tiết ở `docs/api.md` – S4.1):**

| API             | Tham số ngoài bộ lọc chung                | Trả về                                                                                                        |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `summary`       | —                                         | `{ revenue, orders, aov, customers, previous: {…}, delta: { revenue, orders, aov, customers }, refreshedAt }` |
| `revenue-trend` | `granularity=day\|week\|month`            | `[{ period: "2026-10-01", revenue, orders }]`, **đủ mọi kỳ** (kỳ trống = 0)                                   |
| `top-products`  | `limit=5\|10\|20`, `by=revenue\|quantity` | `[{ sku, name, quantity, revenue, share }]`                                                                   |
| `by-category`   | —                                         | `[{ categoryId, name, revenue, share }]`                                                                      |
| `by-channel`    | —                                         | `[{ channelCode, name, revenue, orders }]`                                                                    |

Bộ lọc chung: `from`, `to` (bắt buộc), `channel`, `category` (danh sách phân tách bằng dấu phẩy, tuỳ chọn).

**Ngoại lệ:** E1 `from > to`, sai định dạng, khoảng > 3 năm, `granularity=day` với khoảng > 400 ngày → 400, FE hiện lỗi dưới bộ chọn ngày. E2 không có dữ liệu → mọi KPI = 0, AOV "—", delta "—", biểu đồ hiện "Chưa có dữ liệu trong khoảng này" (**không** lỗi 500). E3 một API lỗi → chỉ khối đó hiện "Không tải được – Thử lại", các khối khác vẫn hiển thị. E4 tham số URL rác (`channel=<script>`) → bỏ qua giá trị không có trong danh sách kênh.

| AC       | Cho trước                               | Khi                                          | Thì                                                                                           |
| -------- | --------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| AC-14.1  | dữ liệu AC-05.1                         | xem 21/10/2026–21/10/2026                    | Doanh thu 630.000; Số đơn 1; AOV 630.000; Khách 1                                             |
| AC-14.2  | không có đơn trong tháng 01/2020        | xem tháng 01/2020                            | 200; KPI 0; AOV `null` → "—"                                                                  |
| AC-14.3  | đơn ngày 01/10 và 03/10, không có 02/10 | xu hướng theo ngày 01–03/10                  | 3 điểm, điểm 02/10 = 0                                                                        |
| AC-14.4  | kỳ trước doanh thu 0, kỳ này 100.000    | xem                                          | delta `null`, hiển thị "Mới"                                                                  |
| AC-14.5  | —                                       | `from=2026-10-10&to=2026-10-01`              | 400                                                                                           |
| AC-14.6  | —                                       | `granularity=day;DROP TABLE orders`          | 400 (whitelist), không lỗi SQL                                                                |
| AC-14.7  | đang lọc kênh `shopee`                  | copy URL, mở ở trình duyệt khác đã đăng nhập | thấy đúng bộ lọc `shopee`                                                                     |
| AC-14.8  | chọn kênh `shopee`                      | xem                                          | mọi KPI/biểu đồ khớp câu SQL đối chiếu chỉ lấy kênh shopee                                    |
| AC-14.9  | màn hình 375 px                         | xem                                          | không cuộn ngang; KPI lưới 2×2                                                                |
| AC-14.10 | đơn A gồm 2 sản phẩm                    | xem số đơn                                   | đếm **1** (không phải 2), xem cảnh báo "Bẫy MV" ở §3.3.1                                      |
| AC-14.11 | đang xem mọi danh mục                   | click lát "Áo" trên donut                    | URL thêm `category=<id Áo>`; mọi KPI/biểu đồ chỉ còn danh mục Áo; nút "Xoá lọc" đưa về như cũ |

---

## 6.10 UC16 — Xuất báo cáo CSV

| Mục            | Nội dung                                     |
| -------------- | -------------------------------------------- |
| Tác nhân       | Analyst (+)                                  |
| Tiền điều kiện | Đang xem dashboard với một bộ lọc            |
| Hậu điều kiện  | Tải về file `bao-cao-<loai>-<from>_<to>.csv` |

**Luồng chính:** 1) Bấm "Xuất CSV" → chọn loại: Doanh thu theo ngày / Top sản phẩm / Theo danh mục / Theo kênh. 2) `GET /api/export/csv?report=…&from=…&to=…&channel=…&category=…`. 3) BE dùng **cùng hàm truy vấn** với API analytics tương ứng (đảm bảo số khớp), ghi BOM `﻿` + tiêu đề tiếng Việt + dữ liệu; tiền là số nguyên không định dạng (để Excel tính toán được). 4) Trình duyệt tải file.

**Ngoại lệ:** E1 viewer gọi → 403 (nút cũng bị ẩn). E2 bộ lọc không hợp lệ → 400 như UC14.

| AC      | Cho trước       | Khi                             | Thì                                                                       |
| ------- | --------------- | ------------------------------- | ------------------------------------------------------------------------- |
| AC-16.1 | bộ lọc tháng 10 | xuất "Theo kênh", mở bằng Excel | tiếng Việt đúng; tổng doanh thu trong file = KPI Doanh thu trên dashboard |
| AC-16.2 | —               | xuất "Top sản phẩm"             | file **không** chứa tên/SĐT khách (NFR-18)                                |

---

## 6.11 UC06 — Ánh xạ cột (đặc tả riêng các điểm dùng chung)

UC06 được include bởi UC05 (file) và UC10 (nguồn kết nối). Hành vi đã mô tả ở UC05 bước 3–5; các điểm **bắt buộc thống nhất**:

| #   | Quy định                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Danh sách trường và quy tắc lấy từ **một nguồn duy nhất**: `packages/shared/src/schemas/import.ts` (FE hiển thị, BE validate cùng một schema) |
| 2   | Một cột của file có thể được ánh xạ cho **tối đa một** trường (chọn trùng → cảnh báo)                                                         |
| 3   | Mỗi trường: đúng một trong `column` / `constant` / không dùng; trường bắt buộc không được "không dùng"                                        |
| 4   | Gợi ý (FR-12) chỉ là **đề xuất**; người dùng luôn xác nhận trước khi nhập                                                                     |
| 5   | Mẫu ánh xạ lưu theo §3.5.4; tên mẫu duy nhất                                                                                                  |

| AC      | Cho trước                                          | Khi                              | Thì                                               |
| ------- | -------------------------------------------------- | -------------------------------- | ------------------------------------------------- |
| AC-06.1 | file có cột "Mã đơn hàng", "SL", "Đơn giá"         | preview                          | gợi ý đúng `order_code`, `quantity`, `unit_price` |
| AC-06.2 | file Shopee không có cột kênh                      | đặt `channel` = cố định "shopee" | mọi đơn nhập vào có kênh `shopee`                 |
| AC-06.3 | chọn cùng cột "Giá" cho `unit_price` và `discount` | —                                | cảnh báo chọn trùng                               |

---

## 6.12 Đặc tả rút gọn: UC02, UC09, UC17, UC18

| UC                                    | Tác nhân    | Luồng chính                                                                                                                               | Ngoại lệ / quy tắc                                   | AC chính                                                                                         |
| ------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **UC02** Đăng xuất                    | Viewer (+)  | Bấm "Đăng xuất" → `POST /api/auth/logout` → xoá cookie (`Max-Age=0`) → về `/login`                                                        | Gọi khi đã hết phiên → vẫn 204                       | Sau đăng xuất, nút Back của trình duyệt không xem được dữ liệu (API trả 401, FE chuyển `/login`) |
| **UC09** Tải file mẫu                 | Analyst (+) | Ở trang nhập, bấm "Tải file mẫu" → `GET /api/imports/template` → `mau-du-lieu.xlsx` (§3.5.2 + sheet hướng dẫn)                            | —                                                    | Nhập **ngay** file mẫu vừa tải (không sửa) → `success`                                           |
| **UC17** Phân tích khách hàng (Could) | Viewer (+)  | Tab "Khách hàng": số khách mới (đơn `completed` đầu tiên rơi vào kỳ) vs quay lại, theo tháng; bảng phân nhóm RFM 3×3×3 (theo tam phân vị) | Bỏ qua khách lẻ (BR-05); không hiển thị SĐT (NFR-18) | Khách có đơn đầu tiên ở tháng 9 và đơn tiếp ở tháng 10 → tháng 10 tính là "quay lại"             |
| **UC18** Quản lý danh mục SP (Could)  | Analyst (+) | Danh sách sản phẩm (tìm theo SKU/tên) → sửa tên, chọn danh mục; danh sách kênh → sửa tên hiển thị                                         | Sửa xong phải refresh MV (danh mục nằm trong MV)     | Đổi danh mục SP X từ "Chưa phân loại" sang "Áo" → biểu đồ danh mục cập nhật                      |

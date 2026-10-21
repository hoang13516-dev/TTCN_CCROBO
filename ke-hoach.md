# KẾ HOẠCH THỰC HIỆN — CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Đồ án chuyên ngành — GVHD: ThS. Dương Văn Đeo — Thực hiện: Nguyễn Minh Hoàng (1 sinh viên)
> Thời gian: **50 ngày, 21/10/2026 → 09/12/2026** · **7 sprint × 1 tuần** (Thứ Tư → Thứ Ba) + ngày nộp cuối
> Ngân sách: **131 giờ ≈ 18,5 giờ/tuần** (2–3,5 giờ/ngày) · Phạm vi: **Must + Should**
> Căn cứ: tài liệu phân tích yêu cầu `docs/phan-tich/` (v1.0, 21/10/2026) — kế hoạch này **thay thế** kế hoạch 10 tuần trước đó (vẫn xem được trong lịch sử git)
> Stack: TypeScript · React (Vite) · Node.js/Express · PostgreSQL · SQL

---

## 0. HƯỚNG DẪN CHO PHIÊN LÀM VIỆC TIẾP THEO (đọc trước khi làm)

1. **Tìm bước đầu tiên chưa tick** trong [§10 Bảng theo dõi tiến độ](#10-bảng-theo-dõi-tiến-độ). Mỗi lần chỉ làm **một bước**. Lịch theo ngày ở §7 cho biết bước đó *nên* làm vào ngày nào.
2. Mỗi bước có: **Làm gì** · **File** · **Xong khi** (Definition of Done) · **Bẫy** · **Học trước**. Cột "Xong khi" trỏ tới các **tiêu chí chấp nhận AC** trong `docs/phan-tich/06-dac-ta-use-case.md`. Chỉ tick khi mọi AC đã được kiểm chứng bằng lệnh hoặc thao tác thật, không phải "chắc là chạy".
3. Muốn biết một bước phải đáp ứng yêu cầu nào: tra ma trận truy vết `docs/phan-tich/07-truy-vet-va-tu-kiem-tra.md` §2 (FR → UC → bước → AC).
4. Không đổi quyết định kỹ thuật ở §2 nếu không ghi lý do vào `docs/adr/`. Không đổi phạm vi nếu chưa sửa `docs/phan-tich/03-dac-ta-yeu-cau.md` trước.
5. Sinh viên **chưa quen** TS/React/Express/PostgreSQL: khi viết code, giải thích *vì sao*, không chỉ đưa code.
6. Cuối mỗi bước: commit theo quy ước `feat(api): …`, `fix(web): …`, `docs: …`, `test: …`; tick bảng tiến độ, ghi giờ thực tế.
7. Cuối mỗi tuần (Thứ Ba): báo cáo sprint theo mẫu §9. Nếu lệch > 4 giờ so với lịch thì áp dụng thứ tự cắt ở §8.
8. Máy dev: laptop 8 GB RAM → ưu tiên PostgreSQL cài trực tiếp hoặc 1 container duy nhất.

---

## 1. TỔNG QUAN

### 1.1 Mục tiêu sản phẩm
Web app giúp **chủ cửa hàng bán lẻ nhỏ bán đa kênh** nạp dữ liệu đơn hàng từ nhiều nguồn (file CSV/Excel, CSDL, REST API), tự động chuẩn hoá, và xem dashboard KPI để trả lời: *bán gì chạy, lúc nào/kênh nào bán tốt, kỳ này so với kỳ trước ra sao*. Chi tiết bài toán, 5 mục tiêu đo được (G1–G5) và 8 vấn đề hiện trạng (P1–P8): `docs/phan-tich/01-khao-sat-va-phan-tich-de-tai.md`.

### 1.2 Phạm vi theo use case

| Mức | Use case | Sprint |
|---|---|---|
| **Must** | UC01 Đăng nhập · UC02 Đăng xuất · UC05 Nhập dữ liệu từ file · UC06 Ánh xạ cột · UC07 Lịch sử & lỗi nhập · UC14 Dashboard · UC15 Lọc & so sánh | S2–S4 |
| **Should** | UC08 Hủy lần nhập · UC09 File mẫu · UC16 Xuất CSV | S3, S5 |
| **Should** | UC10 Quản lý nguồn · UC11 Kiểm tra kết nối · UC12 Đồng bộ ngay · UC13 Đồng bộ theo lịch | S5–S6 |
| **Should** | UC03 Đổi mật khẩu · UC04 Quản lý người dùng | S6 |
| **Could** | UC17 Phân tích khách hàng · UC18 Danh mục sản phẩm | Chỉ khi còn vùng đệm |
| **Won't** | Multi-tenant, dự báo ML, ứng dụng mobile, giảm giá cấp đơn, lợi nhuận/giá vốn | Hướng phát triển |

18 use case, 46 yêu cầu chức năng, 19 yêu cầu phi chức năng, 26 quy tắc nghiệp vụ, 63 tiêu chí chấp nhận: xem `docs/phan-tich/`.

### 1.3 Yêu cầu phi chức năng then chốt (đo được)
- Dashboard tải < **2 s** với **100.000** dòng `order_items`; mỗi API phân tích < **300 ms** (NFR-01, NFR-02).
- Nhập 10.000 dòng < **15 s**, không làm treo server (NFR-03).
- bcrypt; JWT trong cookie httpOnly; phân quyền kiểm tra ở server; cấu hình nguồn mã hoá **AES-256-GCM** (NFR-04…NFR-08).
- Múi giờ `Asia/Ho_Chi_Minh`; tiền VND lưu `BIGINT` (NFR-16).

### 1.4 Các mốc chính

| Mốc | Ngày | Nội dung | Kiểm chứng |
|---|---|---|---|
| **M1** | 27/10 (cuối S1) | Nộp bản phân tích v1.1; có CSDL + 100.000 dòng dữ liệu giả | Báo cáo đã nộp; `SELECT count(*) FROM order_items` ≈ 100.000 |
| **M2** | 10/11 (cuối S3) | Nhập file **end-to-end**: upload → ánh xạ → nạp → lịch sử | AC-05.1…AC-05.13 pass |
| **M3** | 17/11 (cuối S4) | **Demo giữa kỳ**: dashboard hoàn chỉnh | AC-14.1…AC-14.11 pass; video demo |
| **M4** | 01/12 (cuối S6) | Đủ 3 loại nguồn dữ liệu; **deploy lần 1** công khai | Mở URL từ điện thoại 4G |
| **M5** | 08/12 (cuối S7) | Kiểm thử, tài liệu, UAT xong | `npm test` xanh; ≥ 2 phiếu UAT |
| **M6** | 09/12 (ngày 50) | **Nộp sản phẩm cuối** | Đã nộp |

---

## 2. QUYẾT ĐỊNH KỸ THUẬT (đã chốt)

| Hạng mục | Lựa chọn | Lý do / Trade-off |
|---|---|---|
| Cấu trúc repo | **Monorepo npm workspaces**: `apps/api`, `apps/web`, `packages/shared` | Chia sẻ type & schema Zod giữa FE/BE; đơn giản hơn Nx/Turborepo cho 1 người |
| Backend | Express + TypeScript, dev bằng `tsx watch` | Đề yêu cầu Express; `tsx` nhanh, ít cấu hình |
| Truy cập DB | **`pg`** + SQL viết tay (repository pattern) | Đồ án nhấn mạnh SQL, cần hiểu execution plan. Trade-off: tự lo mapping |
| Migration | **`node-pg-migrate`** | Schema có version, tái lập được khi deploy |
| Validation | **Zod** trong `packages/shared` | Một nguồn sự thật cho FE và BE (cả hàm chuẩn hoá dữ liệu nhập) |
| Frontend | React + Vite + TS, React Router, **TanStack Query**, **Recharts**, Tailwind | TanStack Query lo cache/loading/error |
| Đọc file | `papaparse` (CSV, stream) · `exceljs` (xlsx) | Stream, không nạp cả file vào RAM |
| Auth | JWT trong **cookie httpOnly** + bcrypt; **3 vai trò** `viewer < analyst < admin` | Chống XSS đọc token; đặc quyền tối thiểu (ADR-0001) |
| Phiên | Mỗi request **đọc lại user từ CSDL** (vai trò, khoá, `password_changed_at`) | Thu hồi quyền có hiệu lực ngay; đổi lấy 1 truy vấn theo khoá chính (BR-21) |
| Nhập dữ liệu | **Xử lý nền** trong process API: trả `202 + jobId`, FE hỏi trạng thái mỗi 1 s | File 50.000 dòng không làm request treo (FR-18). Trade-off: server khởi động lại → job mồ côi, xử lý ở FR-45 |
| Idempotency | Upsert theo mã đơn; nhập lại = **thay toàn bộ** dòng đơn | Nhập lại cùng file không nhân đôi doanh thu (BR-06) |
| Tổng hợp | `mv_daily_sales` cho doanh thu; **Số đơn/Số khách tính từ `orders`** | `COUNT DISTINCT` không cộng dồn được qua các dòng MV |
| Lịch đồng bộ | `node-cron` trong process API + `pg_try_advisory_lock` | Đủ cho quy mô nhỏ; chỉ chạy **1 instance** |
| Test | **Vitest** + **Supertest** (API), Testing Library (web) | Cùng hệ sinh thái Vite |
| Tenancy | **Single-tenant**: mỗi cửa hàng 1 bản deploy | Giảm độ phức tạp |
| Deploy | API + Postgres trên PaaS (Render/Railway/Neon…), web tĩnh trên Vercel/Netlify | Kiểm tra lại free tier ở S6 |

---

## 3. KIẾN TRÚC

### 3.1 Tổng quan

```
┌──────────────┐  HTTPS/JSON   ┌───────────────────────────────────────┐
│  React SPA   │ ────────────► │            Express API                │
│ (apps/web)   │ ◄──────────── │  routes → controllers → services      │
│ TanStack Q.  │   cookie JWT  │        → repositories (SQL) ──┐       │
└──────────────┘               │  importers: csv | excel | db | api    │
                               │  worker nền: import job               │
                               │  jobs: node-cron (sync), refresh MV   │
                               └───────────────┬───────────────────────┘
                                               │ pg Pool
                       ┌───────────────────────▼───────────────────────┐
                       │ PostgreSQL                                    │
                       │  bảng chính (orders, order_items, ...)        │
                       │  staging_rows → upsert vào bảng chính         │
                       │  mv_daily_sales (materialized view)           │
                       └───────────────────────────────────────────────┘
       Nguồn ngoài: CSV/Excel upload │ CSDL khách (chỉ đọc) │ REST API (apps/mock-shop-api để demo)
```

Sơ đồ ngữ cảnh, quy trình và use case: `docs/phan-tich/so-do/out/` (H1–H13).

### 3.2 Luồng nhập dữ liệu (dùng chung cho MỌI nguồn) — chi tiết ở QT-01, QT-02

```
Nguồn ─► Extract (stream/lô) ─► Map cột (mẫu ánh xạ) ─► Chuẩn hoá + Validate từng dòng
     ┬─► hợp lệ  → staging_rows
     ├─► lỗi     → import_errors (dòng, cột, lý do)
     └─► trạng thái trung gian → bỏ qua (skipped_rows)
 ─► Kiểm tra nhất quán theo đơn (BR-07)
 ─► Load: 1 TRANSACTION upsert danh mục → SP → khách → kênh → đơn → dòng đơn
 ─► REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales
 ─► import_jobs.status = success | partial | failed
```

### 3.3 Luồng một request dashboard

```
Browser ─GET /api/analytics/summary?from=2026-10-01&to=2026-10-21─► requireAuth (cookie JWT + đọc user)
 ─► validate query (Zod, BR-22) ─► analyticsService.summary(range, filters)
 ─► doanh thu: mv_daily_sales · số đơn/số khách: orders (kỳ này + kỳ trước cùng độ dài)
 ─► tính delta (BR-04) ─► JSON ─► TanStack Query cache ─► KPI cards
```

---

## 4. CẤU TRÚC THƯ MỤC MỤC TIÊU

```
cn019-sales-dashboard/
├─ package.json  .env.example  docker-compose.yml (1 service postgres, tuỳ chọn)
├─ ke-hoach.md                         # file này
├─ docs/
│  ├─ phan-tich/                       # tài liệu phân tích yêu cầu (căn cứ của kế hoạch)
│  ├─ adr/                             # quyết định kiến trúc
│  ├─ bao-cao/sprint-1.md … sprint-7.md, tong-ket.md
│  ├─ erd.md  api.md  test-cases.md
│  ├─ sql/kpi-queries.sql  explain-baseline.md  explain-after.md
│  ├─ huong-dan-su-dung.md  huong-dan-trien-khai.md  uat.md
├─ packages/shared/src/
│  ├─ schemas/ (auth.ts, import.ts, analytics.ts, source.ts, user.ts)
│  ├─ normalize/ (money.ts, date.ts, status.ts, channel.ts, phone.ts)   # dùng chung FE/BE
│  └─ index.ts
├─ apps/api/
│  ├─ migrations/  scripts/ (seed.ts, create-admin.ts)
│  ├─ src/
│  │  ├─ app.ts  server.ts  config/env.ts  db/pool.ts
│  │  ├─ middlewares/ (auth.ts, error.ts, validate.ts)
│  │  ├─ modules/
│  │  │  ├─ auth/  users/
│  │  │  ├─ imports/ (routes, service, worker, loader, mapping, undo, templates)
│  │  │  │   └─ extractors/ (csv.ts, excel.ts, database.ts, rest-api.ts)
│  │  │  ├─ sources/ (routes, service, crypto.ts)
│  │  │  ├─ analytics/  catalog/  export/
│  │  └─ jobs/ (scheduler.ts, sync-job.ts, refresh-mv.ts, cleanup-orphans.ts)
│  └─ tests/
├─ apps/mock-shop-api/
└─ apps/web/src/
   ├─ main.tsx  router.tsx  lib/api.ts
   ├─ features/
   │  ├─ auth/ (LoginPage, ChangePasswordPage)
   │  ├─ dashboard/ (DashboardPage, KpiCards, DateRangeFilter,
   │  │              RevenueChart, TopProducts, CategoryChart, ChannelChart)
   │  ├─ imports/ (UploadPage, MappingStep, ImportResult, ImportHistory)
   │  ├─ sources/ (SourcesPage, DbSourceForm, ApiSourceForm)
   │  └─ users/ (UsersPage)
   └─ components/ (Layout, ProtectedRoute, RequireRole, …)
```

---

## 5. MÔ HÌNH DỮ LIỆU

```
users(id, email UNIQUE, full_name, password_hash,
      role CHECK IN ('admin','analyst','viewer'), is_active DEFAULT true,
      must_change_password DEFAULT false, password_changed_at, last_login_at NULL, created_at)

categories(id, name UNIQUE)
products(id, sku UNIQUE, name, category_id FK, created_at)
customers(id, external_code UNIQUE, name, phone, created_at)
channels(id, code UNIQUE, display_name)

orders(id, external_code, channel_id FK, customer_id FK NULL,
       ordered_at TIMESTAMPTZ, status CHECK IN ('completed','cancelled','returned'),
       source_id FK NOT NULL, created_job_id FK NULL, last_job_id FK NULL, updated_at,
       UNIQUE(source_id, external_code))         -- O-03 đã chốt: theo nguồn (NOT NULL vì UNIQUE bỏ qua NULL)
order_items(id, order_id FK ON DELETE CASCADE, product_id FK,
            quantity INT CHECK > 0, unit_price BIGINT CHECK >= 0, discount BIGINT DEFAULT 0 CHECK >= 0)

data_sources(id, type CHECK IN ('csv','excel','database','api'), name UNIQUE, is_active, created_by FK NULL,
             config_encrypted TEXT, column_mapping JSONB, schedule_cron TEXT NULL, last_synced_at)
import_jobs(id, source_id FK NULL, trigger CHECK IN ('upload','manual','schedule'), created_by FK NULL, file_name,
            status CHECK IN ('pending','running','success','partial','failed','undone'),
            total_rows, processed_rows, ok_rows, error_rows, skipped_rows, new_orders, updated_orders,
            error_message, started_at, finished_at, undone_at, undone_by FK NULL)
import_errors(id, import_job_id FK, row_number, column_name, message, raw JSONB)
staging_rows(import_job_id, row_number, data JSONB)

mv_daily_sales  -- day, product_id, category_id, channel_id, revenue, items_sold (chỉ status='completed')
```

**Index bắt buộc** (Postgres không tự tạo index cho cột FK): `orders(ordered_at)`, `orders(customer_id)`, `orders(created_job_id)`, `orders(last_job_id)`, `order_items(order_id)`, `order_items(product_id)`, `products(category_id)`.

**Định nghĩa KPI, quy tắc nhập, từ điển dữ liệu:** `docs/phan-tich/03-dac-ta-yeu-cau.md` (BR-01…BR-26, §3.5). Không định nghĩa lại ở đây để tránh hai nguồn sự thật.

---

## 6. LỘ TRÌNH 7 SPRINT

| Sprint | Thời gian | Mục tiêu | Demo được cuối sprint | Use case xong | Giờ |
|---|---|---|---|---|---|
| **S1** | 21/10 → 27/10 | Phân tích v1.1 + nền CSDL | CSDL có schema đầy đủ + 100.000 dòng; bản phân tích đã nộp | — | 18,5 |
| **S2** | 28/10 → 03/11 | Đo mốc hiệu năng, xác thực, đọc file | Đăng nhập theo 3 vai trò; upload file thấy cột + 20 dòng | UC01, UC02 | 18,5 |
| **S3** | 04/11 → 10/11 | Pipeline nhập dữ liệu hoàn chỉnh | Nhập file thật qua giao diện 3 bước; nhập lại không nhân đôi doanh thu | UC05, UC06, UC07, UC09 | 18,5 |
| **S4** | 11/11 → 17/11 | Dashboard | **Demo giữa kỳ**: KPI + 4 biểu đồ + lọc chéo | UC14, UC15 | 18,5 |
| **S5** | 18/11 → 24/11 | Hủy nhập, nguồn CSDL, xuất CSV, tối ưu | Đồng bộ từ một CSDL Postgres thứ hai; xuất CSV | UC08, UC10, UC11, UC12 (CSDL), UC16 | 18,5 |
| **S6** | 25/11 → 01/12 | REST API, lịch, người dùng, deploy lần 1 | Đồng bộ tăng dần theo lịch; quản lý người dùng; URL công khai | UC03, UC04, UC12 (API), UC13 | 18,5 |
| **S7** | 02/12 → 08/12 | Kiểm thử, tài liệu, UAT | Người dùng thật dùng thử theo tài liệu | — | 18,5 |
| **Ngày 50** | 09/12 | Nộp sản phẩm cuối | — | — | 1,5 |
| | | | | **Tổng** | **131** |

**Vì sao thứ tự này?** Pipeline nhập (S3) đi trước dashboard (S4) vì điểm nghẽn thật của người dùng là chuẩn hoá dữ liệu (chương 2 phân tích). Dashboard vẫn có thể phát triển độc lập nhờ dữ liệu seed (S1.4). Nguồn CSDL/API (S5–S6) **dùng lại** pipeline của S3, chỉ thêm extractor. Deploy lần 1 ở S6 (không để tới tuần cuối) để S7 có thời gian cho UAT trên bản chạy thật.

---

## 7. CHI TIẾT TỪNG SPRINT

Ký hiệu: ⏱ ước lượng · ✅ Xong khi · ⚠️ Bẫy · 📚 Học trước

### SPRINT 1 (21/10 → 27/10) — Hoàn thiện phân tích & nền CSDL

**Mục tiêu:** biến các giả định trong phân tích thành dữ liệu đã kiểm chứng; có CSDL đầy đủ schema và dữ liệu giả để mọi sprint sau dựa vào.

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 1 | 21/10 | Thứ Tư | **S1.1** Hoàn thiện phân tích v1.1 (phỏng vấn, file thật, chốt O-03) — đọc hiểu phân tích, làm 8 câu ôn tập, đối chiếu đề gốc (O-09) | 2,5 |
| 2 | 22/10 | Thứ Năm | **S1.2** PostgreSQL + kết nối pool; **S1.1** Hoàn thiện phân tích v1.1 (phỏng vấn, file thật, chốt O-03) — hẹn lịch phỏng vấn, gửi câu hỏi GVHD | 2,5 |
| 3 | 23/10 | Thứ Sáu | **S1.1** Hoàn thiện phân tích v1.1 (phỏng vấn, file thật, chốt O-03) — phỏng vấn ≥ 1 người, xin file xuất thật, đối chiếu §3.5 | 2,5 |
| 4 | 24/10 | Thứ Bảy | **S1.1** Hoàn thiện phân tích v1.1 (phỏng vấn, file thật, chốt O-03) — cập nhật phân tích v1.1, chốt O-03; **S1.3** Migration schema lõi + ERD — bảng users, catalog, orders | 3 |
| 5 | 25/10 | Chủ Nhật | **S1.3** Migration schema lõi + ERD — bảng import/sources, index, ERD; **S1.4** Script sinh 100.000 dòng dữ liệu giả — khung script, faker.seed(42) | 3 |
| 6 | 26/10 | Thứ Hai | **S1.4** Script sinh 100.000 dòng dữ liệu giả — sinh danh mục, SP, khách, đơn có mùa vụ | 2,5 |
| 7 | 27/10 | Thứ Ba | **S1.4** Script sinh 100.000 dòng dữ liệu giả — batch insert, đo < 60 s; **S1.5** Báo cáo Sprint 1 + nộp bản phân tích — báo cáo + nộp phân tích | 2,5 |

#### S1.1 — Hoàn thiện phân tích v1.1 ⏱ 6,5h
- **Làm gì:** đọc hiểu 7 chương phân tích, làm 8 câu ôn tập (ch.8); đối chiếu đề gốc (O-09); phỏng vấn ≥ 1 chủ shop theo phiếu 12 câu (§1.7); xin ≥ 1 file xuất thật (xoá thông tin khách), đối chiếu từ điển §3.5 (O-01, O-04, O-06); **chốt O-03** (ràng buộc mã đơn); gửi câu hỏi cho GVHD (O-02, O-05).
- **File:** `docs/phan-tich/01-…`, `03-…`, `07-…` (cập nhật), phụ lục biên bản phỏng vấn.
- ✅ 9 vấn đề O-01…O-09 có kết luận hoặc đang áp dụng phương án mặc định (ghi ở ch.7 §4); O-03 đã chốt **trước S1.3**; kiểm tra chéo tài liệu 0 lỗi.
- ⚠️ Không lưu dữ liệu cá nhân của khách trong repo.

#### S1.2 — PostgreSQL + kết nối pool ⏱ 2h
- **Làm gì:** cài Postgres (native hoặc `docker-compose.yml` 1 service), tạo DB `cn019`, `db/pool.ts` dùng `pg.Pool`; `/api/health` kiểm tra thêm `SELECT 1`.
- **File:** `docker-compose.yml`, `apps/api/src/db/pool.ts`, `.env.example`.
- ✅ `/api/health` trả `{"status":"ok","db":"ok"}`; tắt Postgres → `db:"down"`, HTTP 503, server không crash (FR-44).
- 📚 Vì sao dùng Pool thay vì `new Client()` mỗi request (chi phí mở kết nối TCP + xác thực).

#### S1.3 — Migration schema lõi + ERD ⏱ 4,5h
- **Làm gì:** cài `node-pg-migrate`; migration tạo **toàn bộ** bảng ở §5 (trừ MV) với PK/FK/CHECK/UNIQUE và các index bắt buộc; vẽ ERD (mermaid).
- **File:** `apps/api/migrations/001_core_schema.sql`, `docs/erd.md`.
- ✅ `migrate:up` tạo đủ bảng; `migrate:down` xoá sạch; chạy `up` lần 2 không lỗi; `\d orders` thấy `created_job_id`, `last_job_id`, ràng buộc mã đơn theo O-03; `\d users` thấy CHECK 3 vai trò.
- ⚠️ Các cột phục vụ hủy lần nhập, vai trò, thống kê job phải có **ngay từ migration đầu**, nếu không sẽ phải xử lý giá trị cho dữ liệu cũ.

#### S1.4 — Script sinh dữ liệu giả ⏱ 4h
- **Làm gì:** `scripts/seed.ts` (`@faker-js/faker`): 8 danh mục, 200 sản phẩm, 3.000 khách, 4 kênh, ~40.000 đơn / ~100.000 dòng đơn trong 18 tháng, có **mùa vụ** (Tết, cuối tuần), 5 % đơn hủy, 2 % đơn hoàn, **15 % đơn khách lẻ**, đơn lúc 0h–7h sáng (để test múi giờ); insert theo lô 1.000 dòng trong transaction.
- **File:** `apps/api/scripts/seed.ts`, script `npm run seed`.
- ✅ Chạy < 60 s; `count(*) order_items` ≈ 100.000; `--reset` + `faker.seed(42)` cho kết quả tái lập.
- ⚠️ Insert từng dòng mất vài phút do round-trip → bắt buộc multi-row INSERT hoặc `COPY`.

#### S1.5 — Báo cáo Sprint 1 + nộp phân tích ⏱ 1,5h
- **File:** `docs/bao-cao/sprint-1.md` (mẫu §9); báo cáo Word nộp GVHD.
- ✅ Đã nộp; góp ý của GVHD ghi vào `docs/phan-tich/07-…` §4.

### SPRINT 2 (28/10 → 03/11) — Mốc hiệu năng, xác thực, đọc file

**Mục tiêu:** đo hiệu năng gốc; người dùng đăng nhập theo 3 vai trò; hệ thống đọc được file CSV/Excel.

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 8 | 28/10 | Thứ Tư | **S2.1** SQL KPI + EXPLAIN mốc hiệu năng — 5 câu KPI + EXPLAIN | 2,5 |
| 9 | 29/10 | Thứ Năm | **S2.1** SQL KPI + EXPLAIN mốc hiệu năng — ghi mốc; **S2.2** Shared schemas + hàm chuẩn hoá dữ liệu — schema ImportRow, LoginInput, DateRangeQuery | 2,5 |
| 10 | 30/10 | Thứ Sáu | **S2.2** Shared schemas + hàm chuẩn hoá dữ liệu — test hàm chuẩn hoá BR-09, BR-10; **S2.3** API xác thực, 3 vai trò — login/logout/me | 2,5 |
| 11 | 31/10 | Thứ Bảy | **S2.3** API xác thực, 3 vai trò — requireAuth, requireRole, test phân quyền | 3 |
| 12 | 01/11 | Chủ Nhật | **S2.4** Trang đăng nhập + ProtectedRoute — api.ts, LoginPage, ProtectedRoute | 3 |
| 13 | 02/11 | Thứ Hai | **S2.5** Upload & xem trước file (extractor) — multer, extractor CSV | 2,5 |
| 14 | 03/11 | Thứ Ba | **S2.5** Upload & xem trước file (extractor) — extractor Excel, fixtures; **S2.6** Báo cáo Sprint 2 — báo cáo | 2,5 |

#### S2.1 — SQL KPI + EXPLAIN mốc ⏱ 3h
- **Làm gì:** viết tay câu SQL cho: tổng KPI (doanh thu từ `order_items`; **số đơn, số khách từ `orders`**), doanh thu theo ngày (điền ngày trống bằng `generate_series`), top 10 sản phẩm, theo danh mục, theo kênh; chạy `EXPLAIN (ANALYZE, BUFFERS)` trên 100.000 dòng.
- **File:** `docs/sql/kpi-queries.sql`, `docs/sql/explain-baseline.md`.
- ✅ ≥ 5 câu, mỗi câu có kết quả EXPLAIN và thời gian (mốc so sánh cho S5.6); câu nhóm theo ngày dùng `AT TIME ZONE 'Asia/Ho_Chi_Minh'`.
- 📚 Đọc execution plan: Seq Scan vs Index Scan, Hash Join, cost vs actual time.

#### S2.2 — Shared schemas + hàm chuẩn hoá ⏱ 3h
- **Làm gì:** `packages/shared`: Zod `LoginInput`, `ImportRow` (13 trường §3.5.1), `MappingTemplate` (§3.5.4), `DateRangeQuery` (BR-22); hàm chuẩn hoá **thuần** (không phụ thuộc IO) cho tiền/số (BR-09), ngày (BR-10), trạng thái (BR-08), kênh (BR-13), SĐT (BR-12).
- **File:** `packages/shared/src/schemas/*.ts`, `packages/shared/src/normalize/*.ts` + test.
- ✅ `apps/api` và `apps/web` import được `@cn019/shared`; `npm run typecheck` pass; unit test: `"1.200.000"` → 1200000, `"12,5"` → 13, serial `46316` → 21/10/2026, `"Đang giao"` → bỏ qua (AC-05.6, AC-05.7, AC-05.11).
- ⚠️ Hàm chuẩn hoá phải dùng chung FE (xem trước khi ánh xạ) và BE (nhập thật), nếu không màn hình xem trước sẽ khác kết quả nhập.

#### S2.3 — API xác thực, 3 vai trò ⏱ 4,5h
- **Làm gì:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`; bcrypt; JWT ký bằng `JWT_SECRET`, cookie `httpOnly; SameSite=Lax; Secure (prod)`; `requireAuth` **đọc lại user mỗi request** (khoá, vai trò, `password_changed_at`); `requireRole(min)` theo thứ bậc; rate limit đăng nhập 10/phút/IP; script `create-admin`.
- **File:** `modules/auth/*`, `middlewares/auth.ts`, `scripts/create-admin.ts`, `tests/auth.test.ts`.
- ✅ AC-01.1…AC-01.4, AC-01.8; viewer gọi route analyst → 403; không response nào chứa `password_hash`.
- ⚠️ Email không tồn tại vẫn chạy bcrypt với hash giả để thời gian phản hồi như nhau.

#### S2.4 — Trang đăng nhập + ProtectedRoute ⏱ 3h
- **File:** `apps/web/src/lib/api.ts` (fetch `credentials: 'include'`), `features/auth/LoginPage.tsx`, `components/ProtectedRoute.tsx`, `components/RequireRole.tsx`.
- ✅ AC-01.5…AC-01.7 (F5 giữ phiên; `next` quay lại đúng trang; chặn open redirect); menu ẩn mục không có quyền; đăng xuất → `/login` (UC02).

#### S2.5 — Upload & xem trước file ⏱ 4h
- **Làm gì:** `POST /api/imports/preview` (multer, ≤ 10 MB, `.csv/.xlsx`) → `{ previewId, columns, sampleRows }`; extractor CSV (papaparse stream, BOM, tự nhận `,` `;` tab) và Excel (exceljs, sheet đầu); file tạm giữ 30 phút.
- **File:** `modules/imports/routes.ts`, `extractors/csv.ts`, `extractors/excel.ts`, `tests/fixtures/*`.
- ✅ AC-05.5, AC-05.8, AC-05.13; file rỗng/quá 50.000 dòng/quá 50 cột → 400 (BR-16).
- ⚠️ Excel lưu ngày dạng số serial hoặc Date theo UTC → lấy giờ hiển thị và hiểu là giờ Việt Nam (BR-10).

#### S2.6 — Báo cáo Sprint 2 ⏱ 1h — `docs/bao-cao/sprint-2.md`

### SPRINT 3 (04/11 → 10/11) — Pipeline nhập dữ liệu

**Mục tiêu:** nhập file thật qua giao diện, đúng mọi quy tắc dữ liệu, an toàn khi nhập lại. **Mốc M2.**

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 15 | 04/11 | Thứ Tư | **S3.1** Ánh xạ + validate + staging, xử lý nền — mapping.ts, gợi ý ánh xạ | 2,5 |
| 16 | 05/11 | Thứ Năm | **S3.1** Ánh xạ + validate + staging, xử lý nền — worker nền, staging/errors, BR-07 | 2,5 |
| 17 | 06/11 | Thứ Sáu | **S3.2** Loader: staging → bảng chính (transaction) — loader upsert trong transaction | 2,5 |
| 18 | 07/11 | Thứ Bảy | **S3.2** Loader: staging → bảng chính (transaction) — test idempotent/rollback, job mồ côi; **S3.3** Giao diện nhập 3 bước + lịch sử + file mẫu — bước 1: chọn file | 2,5 |
| 19 | 08/11 | Chủ Nhật | **S3.3** Giao diện nhập 3 bước + lịch sử + file mẫu — bước 2: bảng ánh xạ + xem trước | 3 |
| 20 | 09/11 | Thứ Hai | **S3.3** Giao diện nhập 3 bước + lịch sử + file mẫu — bước 3: kết quả, lịch sử, tải lỗi, file mẫu; **S3.4** Materialized view + làm mới — migration MV | 2,5 |
| 21 | 10/11 | Thứ Ba | **S3.4** Materialized view + làm mới — refresh sau load, test so khớp; **S3.5** Báo cáo Sprint 3 — báo cáo | 3 |

#### S3.1 — Ánh xạ + validate + staging, xử lý nền ⏱ 5h
- **Làm gì:** gợi ý ánh xạ (mẫu đã lưu cùng tập cột → áp dụng; không thì từ điển đồng nghĩa §3.5.3); `POST /api/imports` nhận `previewId + mapping` → tạo job `pending` → **202 `{ jobId }`**; worker: đọc từng dòng → ánh xạ → chuẩn hoá → validate → `staging_rows` / `import_errors` / bỏ qua; kiểm tra nhất quán theo đơn (BR-07); `GET /api/imports/:id` trả tiến độ.
- **File:** `modules/imports/mapping.ts`, `service.ts`, `worker.ts`, `tests/mapping.test.ts`.
- ✅ AC-05.3, AC-05.4, AC-05.11, AC-05.12, AC-06.1…AC-06.3; `row_number` đếm theo file, tính cả dòng tiêu đề.

#### S3.2 — Loader: staging → bảng chính ⏱ 4h
- **Làm gì:** trong **một transaction** + `pg_advisory_xact_lock`: upsert danh mục → sản phẩm (không ghi đè tên, BR-11) → khách (BR-12) → kênh (BR-13) → đơn (`created_job_id` khi tạo, `last_job_id` mỗi lần ghi) → xoá dòng đơn cũ rồi chèn lại (BR-06); cập nhật thống kê job (BR-15); xoá staging; dọn job mồ côi khi khởi động (FR-45).
- **File:** `modules/imports/loader.ts`, `jobs/cleanup-orphans.ts`, `tests/imports.int.test.ts`.
- ✅ AC-05.1, AC-05.2 (nhập lại → doanh thu không đổi), AC-05.9 (lỗi giữa chừng → rollback), AC-05.10 (10.000 dòng < 15 s, `/api/health` < 500 ms).

#### S3.3 — Giao diện nhập 3 bước + lịch sử + file mẫu ⏱ 5,5h
- **Làm gì:** Bước 1 chọn file (kèm "Tải file mẫu") → Bước 2 bảng ánh xạ 13 trường + xem trước **sau chuẩn hoá** + giá trị cố định + định dạng ngày + lưu mẫu → Bước 3 tiến độ và kết quả (Tổng/OK/Lỗi/Bỏ qua/Đơn mới/Đơn cập nhật); trang lịch sử; tải CSV dòng lỗi.
- **File:** `features/imports/UploadPage.tsx`, `MappingStep.tsx`, `ImportResult.tsx`, `ImportHistory.tsx`; API `GET /api/imports`, `GET /api/imports/:id/errors[?format=csv]`, `/api/mapping-templates`, `GET /api/imports/template`.
- ✅ AC-07.1…AC-07.3; nhập ngay file mẫu vừa tải → `success` (UC09); nhập trọn vẹn file thật (từ S1.1) qua giao diện.

#### S3.4 — Materialized view + làm mới ⏱ 3h
- **Làm gì:** migration `mv_daily_sales` + `UNIQUE INDEX (day, product_id, channel_id)` (bắt buộc cho `REFRESH … CONCURRENTLY`); gọi refresh cuối loader; lưu thời điểm refresh để hiển thị "Dữ liệu cập nhật lúc …".
- **File:** `migrations/002_mv_daily_sales.sql`, `jobs/refresh-mv.ts`, ADR-0002 (trade-off MV, chỉ số không cộng dồn).
- ✅ Tổng `revenue` trong MV = câu SQL gốc (test so sánh); sau khi nhập, MV mới trong ≤ 1 phút (NFR-17).

#### S3.5 — Báo cáo Sprint 3 ⏱ 1h — `docs/bao-cao/sprint-3.md`

### SPRINT 4 (11/11 → 17/11) — Dashboard

**Mục tiêu:** dashboard hoàn chỉnh dùng được với dữ liệu seed và dữ liệu nhập thật. **Mốc M3 — demo giữa kỳ.**

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 22 | 11/11 | Thứ Tư | **S4.1** API phân tích (5 endpoint) — summary, revenue-trend | 2,5 |
| 23 | 12/11 | Thứ Năm | **S4.1** API phân tích (5 endpoint) — top-products, by-category, by-channel, docs/api.md | 2,5 |
| 24 | 13/11 | Thứ Sáu | **S4.2** Thẻ KPI + bộ lọc thời gian — KpiCards, định dạng tiền | 2,5 |
| 25 | 14/11 | Thứ Bảy | **S4.2** Thẻ KPI + bộ lọc thời gian — DateRangeFilter, URL; **S4.3** 4 biểu đồ — RevenueChart | 3 |
| 26 | 15/11 | Chủ Nhật | **S4.3** 4 biểu đồ — TopProducts, CategoryChart, ChannelChart, trạng thái tải/rỗng/lỗi | 3,5 |
| 27 | 16/11 | Thứ Hai | **S4.4** Lọc chéo + API danh mục — catalog API, lọc nhiều giá trị, lọc chéo | 3 |
| 28 | 17/11 | Thứ Ba | **S4.5** Báo cáo Sprint 4 + demo giữa kỳ — báo cáo + quay video demo giữa kỳ | 1,5 |

#### S4.1 — API phân tích ⏱ 5h
- **Làm gì:** tất cả nhận `from`, `to` (bắt buộc), `channel`, `category` (danh sách, tuỳ chọn), validate bằng `DateRangeQuery`: `summary` (KPI + kỳ trước + delta + `refreshedAt`), `revenue-trend?granularity=`, `top-products?limit=&by=`, `by-category`, `by-channel`.
- **File:** `modules/analytics/*`, `docs/api.md`.
- ✅ AC-14.1…AC-14.6, AC-14.10 với bộ dữ liệu nhỏ tính tay được.
- ⚠️ Không nối chuỗi vào SQL, kể cả `granularity` → whitelist. Xu hướng phải điền kỳ trống = 0.

#### S4.2 — Thẻ KPI + bộ lọc thời gian ⏱ 4h
- **File:** `DashboardPage.tsx`, `KpiCards.tsx`, `DateRangeFilter.tsx` (preset: Hôm nay, 7 ngày, 30 ngày, Tháng này, Tháng trước, Quý này, Năm nay, Tuỳ chọn).
- ✅ Đổi bộ lọc → 4 thẻ cập nhật, mũi tên xanh/đỏ, "Mới"/"—" đúng BR-04; bộ lọc nằm trên URL (AC-14.7); tiền `1.250.000 ₫` (BR-26).

#### S4.3 — 4 biểu đồ ⏱ 5h
- **File:** `RevenueChart.tsx` (ngày/tuần/tháng), `TopProducts.tsx` (thanh ngang + bảng), `CategoryChart.tsx` (donut, gộp "Khác"), `ChannelChart.tsx`.
- ✅ Số liệu khớp API (đối chiếu 2 điểm); trạng thái tải/rỗng/lỗi (FR-39); AC-14.9 (375 px không cuộn ngang).

#### S4.4 — Lọc chéo + API danh mục ⏱ 3h
- **Làm gì:** `GET /api/catalog/channels|categories`; dropdown chọn nhiều; click lát donut/cột kênh → thêm vào bộ lọc; nút "Xoá lọc".
- ✅ AC-14.8, AC-14.11.

#### S4.5 — Báo cáo Sprint 4 + demo giữa kỳ ⏱ 1,5h — `docs/bao-cao/sprint-4.md` kèm video demo.

### SPRINT 5 (18/11 → 24/11) — Hủy nhập, nguồn CSDL, xuất CSV, tối ưu

**Mục tiêu:** hoàn thiện vòng đời dữ liệu (hủy lần nhập); thêm nguồn thứ hai (CSDL); xuất số liệu; đạt mục tiêu hiệu năng.

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 29 | 18/11 | Thứ Tư | **S5.1** Hủy lần nhập — undo-preview, undo, test 5 AC | 3 |
| 30 | 19/11 | Thứ Năm | **S5.2** Quản lý nguồn + mã hoá cấu hình — CRUD nguồn, AES-256-GCM | 3 |
| 31 | 20/11 | Thứ Sáu | **S5.3** Kết nối CSDL ngoài (chỉ đọc) — test kết nối, câu SELECT chỉ đọc | 2,5 |
| 32 | 21/11 | Thứ Bảy | **S5.3** Kết nối CSDL ngoài (chỉ đọc) — đọc theo lô, pipeline chung, DB shop_external | 2,5 |
| 33 | 22/11 | Chủ Nhật | **S5.4** Mock shop API; **S5.5** Xuất báo cáo CSV — export service | 3 |
| 34 | 23/11 | Thứ Hai | **S5.5** Xuất báo cáo CSV — nút Xuất CSV, BOM; **S5.6** Tối ưu hiệu năng — EXPLAIN lại, index, 500k dòng | 3,5 |
| 35 | 24/11 | Thứ Ba | **S5.7** Báo cáo Sprint 5 — báo cáo | 1 |

#### S5.1 — Hủy lần nhập ⏱ 3h
- **Làm gì:** `GET /api/imports/:id/undo-preview`, `POST /api/imports/:id/undo`: kiểm tra quyền sở hữu (analyst chỉ job của mình), trạng thái, xoá đơn `created_job_id = J AND last_job_id = J` trong transaction, job → `undone`, refresh MV.
- **File:** `modules/imports/undo.ts`, `ImportHistory.tsx`.
- ✅ AC-08.1…AC-08.5.

#### S5.2 — Quản lý nguồn + mã hoá cấu hình ⏱ 3h
- **Làm gì:** CRUD `data_sources` loại `database`/`api` (admin); `crypto.ts` AES-256-GCM với `ENCRYPTION_KEY`; API không trả bí mật; để trống ô bí mật khi sửa = giữ nguyên.
- **File:** `modules/sources/*`, `crypto.ts`, `features/sources/SourcesPage.tsx`.
- ✅ AC-10.1, AC-10.2, AC-10.4; test encrypt → decrypt khớp; IV ngẫu nhiên mỗi lần mã hoá.

#### S5.3 — Kết nối CSDL ngoài ⏱ 5h
- **Làm gì:** form host/port/db/user/password/SSL + câu `SELECT` + cột mốc thời gian; "Kiểm tra kết nối" (timeout 10 s, 20 bản ghi mẫu); extractor chạy trong `SET TRANSACTION READ ONLY`, `statement_timeout 30 s`, đọc theo lô 1.000 bằng cursor, đi qua **cùng pipeline** S3; "Đồng bộ ngay" với khoá chống chạy chồng. PostgreSQL bắt buộc; MySQL không làm trong 50 ngày.
- **File:** `extractors/database.ts`, `DbSourceForm.tsx`, `POST /api/sources/test`, `POST /api/sources/:id/sync`, script tạo DB `shop_external`.
- ✅ AC-10.3, AC-10.5 (một phần), AC-12.4; đồng bộ `shop_external` thành công vào dashboard; sai mật khẩu → thông báo theo UC11 E2, không lộ stack trace.
- ⚠️ Kiểm tra "chỉ SELECT" bằng chuỗi không đủ an toàn → tài khoản chỉ đọc mới là lớp bảo vệ thật (BR-25, ghi ADR-0003).

#### S5.4 — Mock shop API ⏱ 2h
- **Làm gì:** `apps/mock-shop-api`: `GET /orders?updated_since=&page=` (API key ở header, phân trang, faker; có endpoint thêm đơn mới để demo đồng bộ tăng dần).
- ✅ `curl -H "x-api-key: demo" localhost:5000/orders?page=1` trả `data`, `next_page`.

#### S5.5 — Xuất báo cáo CSV ⏱ 2h
- **File:** `modules/export/*`, nút "Xuất CSV" (chỉ analyst+).
- ✅ AC-16.1, AC-16.2: mở bằng Excel không lỗi tiếng Việt (BOM), số khớp dashboard, không có thông tin cá nhân khách.

#### S5.6 — Tối ưu hiệu năng ⏱ 2,5h
- **Làm gì:** chạy lại EXPLAIN so với mốc S2.1; thêm index thiếu; seed 500.000 dòng để thử tải; `compression`.
- **File:** `docs/sql/explain-after.md`.
- ✅ Bảng so sánh trước/sau; mọi API phân tích < 300 ms trên 100.000 dòng (NFR-02); dashboard < 2 s (NFR-01).

#### S5.7 — Báo cáo Sprint 5 ⏱ 1h — `docs/bao-cao/sprint-5.md`

### SPRINT 6 (25/11 → 01/12) — REST API, lịch đồng bộ, người dùng, deploy lần 1

**Mục tiêu:** đủ 3 loại nguồn; quản trị người dùng; có URL công khai. **Mốc M4.**

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 36 | 25/11 | Thứ Tư | **S6.1** Đồng bộ REST API tăng dần — extractor REST, phân trang | 2,5 |
| 37 | 26/11 | Thứ Năm | **S6.1** Đồng bộ REST API tăng dần — incremental, retry/backoff, test mất mạng | 2,5 |
| 38 | 27/11 | Thứ Sáu | **S6.2** Lập lịch đồng bộ — scheduler, advisory lock | 3 |
| 39 | 28/11 | Thứ Bảy | **S6.3** Quản lý người dùng + đổi mật khẩu — API người dùng + đổi mật khẩu | 3 |
| 40 | 29/11 | Chủ Nhật | **S6.3** Quản lý người dùng + đổi mật khẩu — trang Người dùng, đổi mật khẩu; **S6.4** Chuẩn bị production — helmet, CORS, rate limit | 3 |
| 41 | 30/11 | Thứ Hai | **S6.4** Chuẩn bị production — pino, build/start; **S6.5** Deploy lần 1 — tạo DB managed, migrate, deploy API+web | 3 |
| 42 | 01/12 | Thứ Ba | **S6.5** Deploy lần 1 — kiểm tra từ điện thoại 4G; **S6.6** Báo cáo Sprint 6 — báo cáo | 1,5 |

#### S6.1 — Đồng bộ REST API tăng dần ⏱ 5h
- **Làm gì:** cấu hình base URL, header xác thực, đường dẫn tới mảng dữ liệu, kiểu phân trang, tham số mốc; đồng bộ tăng dần từ `last_synced_at` (= thời điểm **bắt đầu** job khi thành công); retry 3 lần (1 s, 2 s, 4 s) với lỗi mạng/429/5xx.
- **File:** `extractors/rest-api.ts`, `ApiSourceForm.tsx`.
- ✅ AC-12.1…AC-12.3: lần 1 lấy toàn bộ, lần 2 chỉ bản ghi mới; tắt mock API giữa chừng → `failed`, `last_synced_at` không đổi.

#### S6.2 — Lập lịch đồng bộ ⏱ 3h
- **Làm gì:** `jobs/scheduler.ts` đọc nguồn có `schedule_cron` và `is_active`, đăng ký `node-cron` (múi giờ VN); đăng ký lại ngay khi nguồn được sửa/tạm dừng; `pg_try_advisory_lock(source_id)`; job do lịch tạo có `trigger = schedule`, `created_by = NULL`.
- ✅ AC-13.1, AC-10.5; bấm "Đồng bộ ngay" khi lịch đang chạy → 409.

#### S6.3 — Quản lý người dùng + đổi mật khẩu ⏱ 5h
- **Làm gì:** `GET/POST /api/users`, `PATCH /api/users/:id`, `POST /api/users/:id/reset-password`, `PATCH /api/auth/password`; trang "Người dùng" (admin); trang đổi mật khẩu; bắt đổi mật khẩu tạm.
- **File:** `modules/users/*`, `features/users/UsersPage.tsx`, `features/auth/ChangePasswordPage.tsx`.
- ✅ AC-03.1…AC-03.3, AC-04.1…AC-04.5; không thể còn 0 admin (BR-23).

#### S6.4 — Chuẩn bị production ⏱ 2,5h
- **Làm gì:** `helmet`, CORS chỉ cho domain web, rate limit, log có cấu trúc (`pino`, không log bí mật), `tsc` build API, `vite build` web, biến môi trường production.
- ✅ `npm run build && npm start` chạy bằng JS đã build; lỗi 500 không trả stack trace (NFR-09).

#### S6.5 — Deploy lần 1 ⏱ 2h
- **Làm gì:** Postgres managed, chạy migration, deploy API (**1 instance** vì node-cron) + web; cookie `Secure; SameSite=None` nếu FE/BE khác domain; tạo admin; nạp dữ liệu demo.
- ✅ Mở URL công khai từ điện thoại (4G) đăng nhập và xem dashboard được.
- ⚠️ Free tier có thể "ngủ" → lần đầu mở chậm (NFR-19).

#### S6.6 — Báo cáo Sprint 6 ⏱ 1h — `docs/bao-cao/sprint-6.md`

### SPRINT 7 (02/12 → 08/12) — Kiểm thử, tài liệu, UAT

**Mục tiêu:** sản phẩm đã kiểm chứng, có tài liệu, có người dùng thật thử. **Mốc M5.**

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 43 | 02/12 | Thứ Tư | **S7.1** Hoàn thiện kiểm thử — bổ sung test, decision table import | 2,5 |
| 44 | 03/12 | Thứ Năm | **S7.1** Hoàn thiện kiểm thử — coverage ≥ 70 %; **S7.2** Deploy hoàn tất + hướng dẫn triển khai — hoàn tất deploy + huong-dan-trien-khai.md | 3 |
| 45 | 04/12 | Thứ Sáu | **S7.3** Tài liệu hướng dẫn sử dụng — huong-dan-su-dung.md + ảnh chụp | 3 |
| 46 | 05/12 | Thứ Bảy | **S7.4** Thử nghiệm người dùng thật (UAT) + sửa lỗi — UAT 2–3 người dùng | 3 |
| 47 | 06/12 | Chủ Nhật | **S7.4** Thử nghiệm người dùng thật (UAT) + sửa lỗi — sửa lỗi chặn, deploy lại; **S7.5** Báo cáo tổng kết + slide bảo vệ — báo cáo tổng kết | 2,5 |
| 48 | 07/12 | Thứ Hai | **S7.5** Báo cáo tổng kết + slide bảo vệ — slide bảo vệ; **S7.6** Vùng đệm | 2,5 |
| 49 | 08/12 | Thứ Ba | **S7.6** Vùng đệm — vùng đệm: sửa lỗi tồn, rà soát cuối | 2 |

#### S7.1 — Hoàn thiện kiểm thử ⏱ 4h
- **Làm gì:** bổ sung test còn thiếu theo ma trận truy vết (mọi AC của Must/Should); bảng decision table cho nhập dữ liệu (định dạng ngày × số tiền × thiếu cột × trùng mã × trạng thái); test component KPI/bộ lọc; test phân quyền theo bảng API §5.4.2 của phân tích.
- **File:** `apps/api/tests/*`, `apps/web/src/**/*.test.tsx`, `docs/test-cases.md`.
- ✅ `npm test` xanh; coverage `modules/imports`, `modules/analytics` ≥ 70 % (NFR-14); `docs/test-cases.md` có bảng (ID, đầu vào, kỳ vọng, kết quả, AC).

#### S7.2 — Deploy hoàn tất + hướng dẫn triển khai ⏱ 1,5h
- **File:** `docs/huong-dan-trien-khai.md`.
- ✅ Bản deploy chạy code mới nhất; người khác làm theo tài liệu dựng lại được (NFR-15).

#### S7.3 — Tài liệu hướng dẫn sử dụng ⏱ 3h
- **File:** `docs/huong-dan-su-dung.md` (có ảnh): đăng nhập, chuẩn bị file (kèm `mau-du-lieu.xlsx`), nhập & sửa dòng lỗi, lưu ý "file phải đủ mọi dòng của một đơn" (BR-06), đọc từng biểu đồ, kết nối CSDL/API, câu hỏi thường gặp.
- ✅ Người không học IT tự nhập được file và trả lời đúng "sản phẩm nào bán chạy nhất tháng trước?".

#### S7.4 — UAT + sửa lỗi ⏱ 4h
- **Làm gì:** 2–3 người dùng (ưu tiên người đã phỏng vấn ở S1.1) dùng dữ liệu thật đã ẩn danh theo kịch bản 6 câu hỏi kinh doanh (phân tích §2.4); ghi góp ý; sửa lỗi chặn sử dụng.
- **File:** `docs/uat.md`.
- ✅ ≥ 2 phiếu góp ý; mọi lỗi mức "chặn sử dụng" đã sửa và deploy lại.

#### S7.5 — Báo cáo tổng kết + slide ⏱ 3,5h
- **File:** `docs/bao-cao/tong-ket.md`, báo cáo đồ án cuối, slide bảo vệ.
- ✅ Có: kiến trúc, ERD, luồng ETL, kết quả hiệu năng trước/sau, kết quả test, UAT, hạn chế (voucher cấp đơn, không khôi phục giá trị cũ khi hủy nhập…) & hướng phát triển.

#### S7.6 — Vùng đệm ⏱ 2,5h
Dùng cho lỗi tồn đọng. Nếu không cần: làm UC17 (Could) bản tối giản, hoặc rà soát lại báo cáo.

### NGÀY 50 (09/12) — Nộp sản phẩm cuối

**Lịch theo ngày:**

| Ngày | Ngày tháng | Thứ | Công việc | Giờ |
|---|---|---|---|---|
| 50 | 09/12 | Thứ Tư | **S8.1** Nộp sản phẩm cuối, trình bày thử — nộp, trình bày thử | 1,5 |

---

## 8. QUẢN LÝ RỦI RO

| Rủi ro | Dấu hiệu | Ứng phó |
|---|---|---|
| Học công nghệ mới chậm hơn dự kiến | Cuối tuần lệch > 4 giờ | Áp dụng thứ tự cắt bên dưới, mỗi lần cắt 1 mục |
| Pipeline nhập (S3) vượt thời gian | Cuối S3 chưa đạt M2 | Dời S3.3 (phần lịch sử, file mẫu) sang S4; dashboard dùng dữ liệu seed |
| Không có người dùng thật | Hết S1 chưa phỏng vấn được | Liên hệ online; dự phòng: bạn bè đóng vai chủ shop với dữ liệu giả |
| Free tier đổi chính sách | Deploy lần 1 (S6) lỗi | Phương án thay thế ghi trong `huong-dan-trien-khai.md`; còn S7 để xử lý |
| GVHD yêu cầu bắt buộc 3 loại nguồn (O-02) | — | S5.3, S6.1 trở thành **không được cắt**; cắt UI của S6.3 trước |
| Laptop 8 GB chậm | Swap khi chạy Postgres + 2 dev server | Postgres native; tắt mock API khi không dùng |

**Thứ tự cắt khi trễ** (cắt từ trên xuống, không bao giờ cắt Must):
1. Could (UC17, UC18) — mặc định đã nằm ngoài lịch.
2. S5.1 Hủy lần nhập → thay bằng hướng dẫn "sửa file rồi nhập lại" (tiết kiệm 3 giờ).
3. Giao diện của S6.3 → giữ API + script `create-admin`/`create-user` (tiết kiệm khoảng 3 giờ).
4. S6.2 Lập lịch → chỉ đồng bộ thủ công (tiết kiệm 3 giờ; không áp dụng nếu O-02 = bắt buộc).
5. S5.6 Tối ưu → chỉ thêm index thiếu, bỏ thử tải 500.000 dòng (tiết kiệm 1,5 giờ).

---

## 9. MẪU BÁO CÁO SPRINT (`docs/bao-cao/sprint-N.md`)

```markdown
# Báo cáo Sprint N (dd/MM – dd/MM/2026) — CN-019
## 1. Mục tiêu sprint
## 2. Đã hoàn thành (bước, link commit, AC đã pass, ảnh chụp)
## 3. Chưa hoàn thành & lý do
## 4. Khó khăn kỹ thuật & cách giải quyết (bài học)
## 5. Số giờ thực tế / ước lượng
## 6. Kế hoạch sprint tiếp theo
## 7. Câu hỏi cho GVHD
```

---

## 10. BẢNG THEO DÕI TIẾN ĐỘ

> Tick `[x]` khi đạt **toàn bộ** tiêu chí ✅. Ghi ngày hoàn thành và giờ thực tế. Cột "Mã cũ" để đối chiếu với kế hoạch 10 tuần trước đây và các báo cáo đã nộp.

| Bước | Nội dung | Mã cũ | Ước lượng | Thực tế | Ngày xong |
|---|---|---|---|---|---|
| [x] S0.1 | Khởi tạo monorepo | B1.1 | 3h | | 2026-10-19 |
| [x] S0.2 | Khung API Express | B1.2 | 3h | | 2026-10-19 |
| [x] S0.3 | Khung web React | B1.3 | 2h | | 2026-10-19 |
| [ ] S1.1 | Hoàn thiện phân tích v1.1 (phỏng vấn, file thật, chốt O-03) | — | 6,5h | | |
| [ ] S1.2 | PostgreSQL + kết nối pool | B1.4 | 2h | | |
| [ ] S1.3 | Migration schema lõi + ERD | B1.5 | 4,5h | | |
| [ ] S1.4 | Script sinh 100.000 dòng dữ liệu giả | B1.6 | 4h | | |
| [ ] S1.5 | Báo cáo Sprint 1 + nộp bản phân tích | B1.8 | 1,5h | | |
| [ ] S2.1 | SQL KPI + EXPLAIN mốc hiệu năng | B1.7 | 3h | | |
| [ ] S2.2 | Shared schemas + hàm chuẩn hoá dữ liệu | B2.1 | 3h | | |
| [ ] S2.3 | API xác thực, 3 vai trò | B2.2 | 4,5h | | |
| [ ] S2.4 | Trang đăng nhập + ProtectedRoute | B2.3 | 3h | | |
| [ ] S2.5 | Upload & xem trước file (extractor) | B2.4 | 4h | | |
| [ ] S2.6 | Báo cáo Sprint 2 | — | 1h | | |
| [ ] S3.1 | Ánh xạ + validate + staging, xử lý nền | B2.5 | 5h | | |
| [ ] S3.2 | Loader: staging → bảng chính (transaction) | B2.6 | 4h | | |
| [ ] S3.3 | Giao diện nhập 3 bước + lịch sử + file mẫu | B2.7 | 5,5h | | |
| [ ] S3.4 | Materialized view + làm mới | B3.1 | 3h | | |
| [ ] S3.5 | Báo cáo Sprint 3 | B2.8 | 1h | | |
| [ ] S4.1 | API phân tích (5 endpoint) | B3.2 | 5h | | |
| [ ] S4.2 | Thẻ KPI + bộ lọc thời gian | B3.3 | 4h | | |
| [ ] S4.3 | 4 biểu đồ | B3.4 | 5h | | |
| [ ] S4.4 | Lọc chéo + API danh mục | B3.5 | 3h | | |
| [ ] S4.5 | Báo cáo Sprint 4 + demo giữa kỳ | B3.6 | 1,5h | | |
| [ ] S5.1 | Hủy lần nhập | B3.7 | 3h | | |
| [ ] S5.2 | Quản lý nguồn + mã hoá cấu hình | B4.1 | 3h | | |
| [ ] S5.3 | Kết nối CSDL ngoài (chỉ đọc) | B4.2 | 5h | | |
| [ ] S5.4 | Mock shop API | B4.3 | 2h | | |
| [ ] S5.5 | Xuất báo cáo CSV | B4.6 | 2h | | |
| [ ] S5.6 | Tối ưu hiệu năng | B5.1 | 2,5h | | |
| [ ] S5.7 | Báo cáo Sprint 5 | B4.7 | 1h | | |
| [ ] S6.1 | Đồng bộ REST API tăng dần | B4.4 | 5h | | |
| [ ] S6.2 | Lập lịch đồng bộ | B4.5 | 3h | | |
| [ ] S6.3 | Quản lý người dùng + đổi mật khẩu | B4.8 | 5h | | |
| [ ] S6.4 | Chuẩn bị production | B5.3 | 2,5h | | |
| [ ] S6.5 | Deploy lần 1 | B5.4 | 2h | | |
| [ ] S6.6 | Báo cáo Sprint 6 | — | 1h | | |
| [ ] S7.1 | Hoàn thiện kiểm thử | B5.2 | 4h | | |
| [ ] S7.2 | Deploy hoàn tất + hướng dẫn triển khai | B5.4 | 1,5h | | |
| [ ] S7.3 | Tài liệu hướng dẫn sử dụng | B5.5 | 3h | | |
| [ ] S7.4 | Thử nghiệm người dùng thật (UAT) + sửa lỗi | B5.6 | 4h | | |
| [ ] S7.5 | Báo cáo tổng kết + slide bảo vệ | B5.7 | 3,5h | | |
| [ ] S7.6 | Vùng đệm | — | 2,5h | | |
| [ ] S8.1 | Nộp sản phẩm cuối, trình bày thử | — | 1,5h | | |

**Tổng:** đã xong trước kế hoạch 8 giờ (S0) · kế hoạch 50 ngày **131 giờ** = 7 × 18,5 giờ + 1,5 giờ ngày nộp.

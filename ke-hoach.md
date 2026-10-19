# KẾ HOẠCH THỰC HIỆN — CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Đồ án chuyên ngành — GVHD: ThS. Dương Văn Đeo — Thực hiện: 1 sinh viên
> Thời gian: 10 tuần (Tuần 2 → Tuần 11), Agile, 5 sprint × 2 tuần, báo cáo cuối mỗi sprint
> Ngân sách thời gian: 10–15 giờ/tuần (~24 giờ/sprint) → mỗi bước ước lượng giờ để không vỡ kế hoạch
> Stack: TypeScript · React (Vite) · Node.js/Express · PostgreSQL · SQL

---

## 0. HƯỚNG DẪN CHO PHIÊN LÀM VIỆC TIẾP THEO (đọc trước khi làm)

1. **Tìm bước đầu tiên chưa tick** trong mục [9. Bảng theo dõi tiến độ](#9-bảng-theo-dõi-tiến-độ). Chỉ làm **một bước** mỗi lần.
2. Mỗi bước có 4 phần: **Làm gì** · **File** · **Xong khi** (Definition of Done) · **Ghi chú/Bẫy**. Chỉ tick khi **mọi** tiêu chí "Xong khi" đã được kiểm chứng bằng lệnh/thao tác thật, không phải "chắc là chạy".
3. Không đổi quyết định kỹ thuật ở mục 2 nếu không ghi lý do vào `docs/adr/` (Architecture Decision Record).
4. Sinh viên **chưa quen** TS/React/Express/PostgreSQL → mỗi bước có mục "Học trước" ngắn. Khi viết code, giải thích *vì sao* chứ không chỉ đưa code.
5. Cuối mỗi bước: commit theo quy ước `feat(api): ...`, `fix(web): ...`, `docs: ...`, `test: ...`; cập nhật bảng tiến độ.
6. Máy dev: laptop 8 GB RAM → tránh chạy quá nhiều container; ưu tiên cài PostgreSQL native hoặc 1 container Postgres duy nhất.

---

## 1. PHẠM VI & YÊU CẦU

### 1.1 Mục tiêu
Một web app giúp **chủ cửa hàng nhỏ** nạp dữ liệu bán hàng từ nhiều nguồn và xem dashboard KPI để ra quyết định (bán gì chạy, lúc nào bán tốt, khách nào quay lại).

### 1.2 Chức năng (MoSCoW)

| Mức | Chức năng |
|---|---|
| **Must** | Đăng nhập (JWT), phân quyền `admin` / `viewer` |
| **Must** | Nhập dữ liệu từ **CSV/Excel** với bước **ánh xạ cột** (column mapping) + kiểm tra lỗi từng dòng |
| **Must** | Dashboard: KPI cards, doanh thu theo thời gian, top sản phẩm, theo danh mục, theo kênh bán |
| **Must** | Bộ lọc khoảng thời gian, so sánh với kỳ trước |
| **Must** | Deploy công khai + tài liệu hướng dẫn người dùng |
| **Should** | **Kết nối trực tiếp CSDL** bên ngoài (PostgreSQL/MySQL, chỉ đọc) |
| **Should** | **Đồng bộ qua API** (REST JSON) theo lịch |
| **Should** | Xuất báo cáo CSV |
| **Could** | Phân tích khách hàng mới/quay lại, RFM đơn giản |
| **Won't (đồ án này)** | Multi-tenant SaaS, dự báo bằng ML, ứng dụng mobile |

### 1.3 Yêu cầu phi chức năng
- Dashboard tải < 2 giây với **100.000 dòng order_items** (có index + bảng tổng hợp).
- Import 10.000 dòng CSV < 15 giây, không làm treo server.
- Mật khẩu hash bằng bcrypt; thông tin kết nối CSDL ngoài được **mã hoá** (AES-256-GCM).
- Múi giờ nghiệp vụ: `Asia/Ho_Chi_Minh`. Tiền tệ: VND, lưu `BIGINT` (VND không có phần lẻ → tránh lỗi làm tròn của float).

---

## 2. QUYẾT ĐỊNH KỸ THUẬT (đã chốt)

| Hạng mục | Lựa chọn | Lý do / Trade-off |
|---|---|---|
| Cấu trúc repo | **Monorepo npm workspaces**: `apps/api`, `apps/web`, `packages/shared` | Chia sẻ type & schema Zod giữa FE/BE; đơn giản hơn Nx/Turborepo cho 1 người |
| Backend | Express + TypeScript, chạy dev bằng `tsx watch` | Đề yêu cầu Express; `tsx` nhanh, không cần cấu hình build phức tạp lúc dev |
| Truy cập DB | Thư viện **`pg`** + SQL viết tay (repository pattern) | Đồ án nhấn mạnh SQL → viết SQL trực tiếp để hiểu execution plan. Trade-off: tự lo mapping, không có ORM |
| Migration | **`node-pg-migrate`** (file SQL/TS có version) | Schema có lịch sử, tái lập được trên máy deploy |
| Validation | **Zod** (dùng chung FE/BE trong `packages/shared`) | Một nguồn sự thật cho DTO |
| Frontend | React + Vite + TypeScript, **React Router**, **TanStack Query**, **Recharts**, Tailwind CSS | TanStack Query lo cache/loading/error của API; Recharts dễ học |
| Đọc file | `papaparse` (CSV, stream) · `exceljs` (xlsx) | Stream để không nạp cả file vào RAM |
| Auth | JWT trong **cookie httpOnly** + bcrypt | Tránh XSS đọc token như khi để ở localStorage |
| Lịch đồng bộ | `node-cron` trong process API | Đủ cho quy mô nhỏ. Trade-off: chạy nhiều instance sẽ trùng job → ghi chú khi deploy chỉ 1 instance |
| Test | **Vitest** + **Supertest** (API), Testing Library (web) | Cùng hệ sinh thái Vite |
| Tenancy | **Single-tenant**: mỗi cửa hàng 1 bản deploy | Giảm độ phức tạp cho 1 sinh viên; ghi trong báo cáo là hướng mở rộng |
| Deploy | API + Postgres trên dịch vụ PaaS (Render/Railway/Neon…), web tĩnh trên Vercel/Netlify | Kiểm tra lại free tier tại thời điểm deploy (Tuần 10) |

---

## 3. KIẾN TRÚC

### 3.1 Tổng quan

```
┌──────────────┐  HTTPS/JSON   ┌───────────────────────────────────────┐
│  React SPA   │ ────────────► │            Express API                │
│ (apps/web)   │ ◄──────────── │  routes → controllers → services      │
│ TanStack Q.  │   cookie JWT  │        → repositories (SQL) ──┐       │
└──────────────┘               │  importers: csv | excel | db | api    │
                               │  jobs: node-cron (sync, refresh MV)   │
                               └───────────────┬───────────────────────┘
                                               │ pg Pool
                       ┌───────────────────────▼───────────────────────┐
                       │ PostgreSQL                                    │
                       │  core tables (orders, order_items, ...)       │
                       │  staging_rows  →  upsert vào core              │
                       │  mv_daily_sales (materialized view tổng hợp)  │
                       └───────────────────────────────────────────────┘
         Nguồn ngoài:  CSV/Excel upload │ CSDL khách (read-only) │ REST API (apps/mock-shop-api để demo)
```

### 3.2 Luồng nhập dữ liệu (ETL) — áp dụng cho MỌI nguồn

```
Nguồn ──► Extract (đọc stream) ──► Map cột (theo mapping người dùng lưu)
      ──► Validate từng dòng (Zod) ──┬─► dòng hợp lệ → staging_rows
                                     └─► dòng lỗi    → import_errors (số dòng, lý do)
      ──► Load: 1 TRANSACTION upsert staging → customers/products/orders/order_items
      ──► REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales
      ──► Cập nhật import_jobs.status = success | partial | failed
```
**Vì sao có staging?** Tách "đọc & kiểm tra" khỏi "ghi vào bảng thật": lỗi giữa chừng thì ROLLBACK, bảng core không bị dữ liệu nửa vời; và cùng một bước Load dùng chung cho cả 4 loại nguồn.

### 3.3 Luồng một request dashboard

```
Browser ─GET /api/analytics/summary?from=2026-01-01&to=2026-01-31─► authMiddleware (verify cookie JWT)
 ─► validate query (Zod) ─► analyticsService.summary(range)
 ─► analyticsRepo: SELECT ... FROM mv_daily_sales WHERE day BETWEEN $1 AND $2  (+ kỳ trước)
 ─► tính % tăng trưởng ─► JSON { revenue, orders, aov, customers, deltas } ─► TanStack Query cache ─► KPI cards
```

---

## 4. CẤU TRÚC THƯ MỤC MỤC TIÊU

```
cn019-sales-dashboard/
├─ package.json                 # workspaces + script chung
├─ .env.example
├─ docker-compose.yml           # chỉ 1 service postgres (tuỳ chọn)
├─ ke-hoach.md                  # file này
├─ docs/
│  ├─ adr/                      # quyết định kiến trúc
│  ├─ bao-cao/sprint-1.md ... sprint-5.md
│  ├─ erd.md                    # ERD (mermaid)
│  ├─ api.md                    # đặc tả endpoint
│  ├─ huong-dan-su-dung.md      # cho người dùng thật
│  └─ huong-dan-trien-khai.md
├─ packages/shared/src/
│  ├─ schemas/                  # Zod: auth.ts, import.ts, analytics.ts
│  └─ index.ts
├─ apps/api/
│  ├─ migrations/               # node-pg-migrate
│  ├─ scripts/seed.ts           # sinh dữ liệu giả
│  ├─ src/
│  │  ├─ app.ts  server.ts  config/env.ts  db/pool.ts
│  │  ├─ middlewares/ (auth.ts, error.ts, validate.ts)
│  │  ├─ modules/
│  │  │  ├─ auth/      (routes, controller, service, repo)
│  │  │  ├─ imports/   (routes, service, loader.ts, mapping.ts)
│  │  │  │   └─ extractors/ (csv.ts, excel.ts, database.ts, rest-api.ts)
│  │  │  ├─ sources/   (CRUD data_sources, crypto.ts)
│  │  │  ├─ analytics/ (routes, service, repo)
│  │  │  └─ export/
│  │  └─ jobs/ (scheduler.ts, sync-job.ts, refresh-mv.ts)
│  └─ tests/
├─ apps/mock-shop-api/          # API giả của "cửa hàng" để demo đồng bộ
└─ apps/web/src/
   ├─ main.tsx  router.tsx  lib/api.ts
   ├─ features/
   │  ├─ auth/ (LoginPage.tsx)
   │  ├─ dashboard/ (DashboardPage.tsx, KpiCards.tsx, RevenueChart.tsx, TopProducts.tsx, CategoryChart.tsx, DateRangeFilter.tsx)
   │  ├─ imports/ (UploadPage.tsx, MappingStep.tsx, ImportHistory.tsx)
   │  └─ sources/ (SourcesPage.tsx, DbSourceForm.tsx, ApiSourceForm.tsx)
   └─ components/ (Layout.tsx, ProtectedRoute.tsx, ...)
```

---

## 5. MÔ HÌNH DỮ LIỆU

```
users(id, email UNIQUE, password_hash, role CHECK IN('admin','viewer'), created_at)

categories(id, name UNIQUE)
products(id, sku UNIQUE, name, category_id FK, created_at)
customers(id, external_code UNIQUE, name, phone, created_at)
channels(id, code UNIQUE)            -- 'store','facebook','shopee',...

orders(id, external_code UNIQUE, customer_id FK NULL, channel_id FK,
       ordered_at TIMESTAMPTZ, status CHECK IN('completed','cancelled','returned'),
       source_id FK NULL, import_job_id FK NULL)
order_items(id, order_id FK ON DELETE CASCADE, product_id FK,
            quantity INT CHECK > 0, unit_price BIGINT CHECK >= 0, discount BIGINT DEFAULT 0)

data_sources(id, type CHECK IN('csv','excel','database','api'), name,
             config_encrypted TEXT, column_mapping JSONB, schedule_cron TEXT NULL, last_synced_at)
import_jobs(id, source_id FK NULL, status, total_rows, ok_rows, error_rows, started_at, finished_at)
import_errors(id, import_job_id FK, row_number, message, raw JSONB)
staging_rows(import_job_id, row_number, data JSONB)

mv_daily_sales  -- MATERIALIZED VIEW: day, product_id, category_id, channel_id,
                --   revenue, items_sold, order_count   (chỉ status='completed')
```

**Định nghĩa KPI (ghi rõ để FE/BE/báo cáo thống nhất):**
- Doanh thu (revenue) = `Σ(quantity × unit_price − discount)` của đơn `completed`.
- Số đơn = `COUNT(DISTINCT order_id)` đơn `completed`.
- AOV (giá trị đơn trung bình) = Doanh thu / Số đơn (trả `null` khi số đơn = 0, không chia cho 0).
- Tăng trưởng = (kỳ này − kỳ trước) / kỳ trước; kỳ trước = khoảng thời gian **cùng độ dài** ngay trước đó.
- Ngày = `(ordered_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date` — **bẫy hay gặp**: group theo UTC làm đơn lúc 0h–7h sáng VN bị đếm sang ngày hôm trước.

**Idempotency:** khoá tự nhiên `orders.external_code` + `ON CONFLICT DO UPDATE` → nhập lại cùng file không nhân đôi doanh thu.

---

## 6. KẾ HOẠCH CHI TIẾT THEO SPRINT

Ký hiệu: ⏱ ước lượng giờ · ✅ Xong khi · ⚠️ Bẫy/Ghi chú · 📚 Học trước

---

### SPRINT 1 (Tuần 2–3) — Nền móng: môi trường, schema, dữ liệu giả
**Mục tiêu sprint:** chạy được `npm run dev` thấy API `/health` + trang web trống; DB có schema và 100k dòng dữ liệu giả.

#### B1.1 — Khởi tạo monorepo ⏱ 3h
- **Làm gì:** tạo repo git, npm workspaces, TypeScript config chung, ESLint + Prettier, `.gitignore`, `.env.example`.
- **File:** `package.json`, `tsconfig.base.json`, `.eslintrc.cjs`, `.prettierrc`, `.gitignore`, `.env.example`, `README.md`.
- ✅ `npm install` ở gốc chạy không lỗi; `npm run lint` chạy được (0 lỗi); repo đã push lên GitHub.
- 📚 npm workspaces, `tsconfig` `strict: true`.

#### B1.2 — Khung API Express + TypeScript ⏱ 3h
- **Làm gì:** tạo `apps/api`, endpoint `GET /api/health`, middleware lỗi tập trung, đọc env bằng Zod (thiếu biến → crash sớm với thông báo rõ).
- **File:** `apps/api/package.json`, `src/app.ts`, `src/server.ts`, `src/config/env.ts`, `src/middlewares/error.ts`.
- ✅ `npm run dev -w apps/api` → `curl localhost:4000/api/health` trả `{"status":"ok"}`; xoá `DATABASE_URL` khỏi `.env` thì server báo lỗi rõ ràng và dừng.
- ⚠️ Tách `app.ts` (tạo app) khỏi `server.ts` (listen) để Supertest import app mà không mở cổng.

#### B1.3 — Khung web React + Vite ⏱ 2h
- **Làm gì:** tạo `apps/web` (Vite React TS), Tailwind, React Router, layout có sidebar; proxy `/api` sang `localhost:4000` trong `vite.config.ts`.
- **File:** `apps/web/vite.config.ts`, `src/main.tsx`, `src/router.tsx`, `src/components/Layout.tsx`, `tailwind.config.js`.
- ✅ `npm run dev -w apps/web` mở trang có sidebar (Dashboard / Nhập dữ liệu / Nguồn dữ liệu); trang gọi `/api/health` hiển thị "API: ok".
- ⚠️ Proxy của Vite giúp tránh lỗi CORS khi dev; lúc deploy phải cấu hình CORS thật (B5.3).

#### B1.4 — PostgreSQL + kết nối pool ⏱ 2h
- **Làm gì:** cài Postgres (native hoặc `docker-compose.yml` 1 service), tạo DB `cn019`, file `db/pool.ts` dùng `pg.Pool`; `/api/health` kiểm tra thêm `SELECT 1`.
- **File:** `docker-compose.yml`, `apps/api/src/db/pool.ts`, `.env.example`.
- ✅ `/api/health` trả `{"status":"ok","db":"ok"}`; tắt Postgres thì trả `db:"down"` với HTTP 503 (không crash server).
- 📚 Vì sao dùng Pool thay vì `new Client()` mỗi request (chi phí mở kết nối TCP + auth).

#### B1.5 — Migration schema lõi ⏱ 4h
- **Làm gì:** cài `node-pg-migrate`; viết migration tạo toàn bộ bảng ở mục 5 (trừ MV), kèm PK/FK/CHECK/UNIQUE và index: `orders(ordered_at)`, `order_items(order_id)`, `order_items(product_id)`, `products(category_id)`.
- **File:** `apps/api/migrations/001_core_schema.sql` (hoặc `.ts`), `docs/erd.md` (sơ đồ mermaid).
- ✅ `npm run migrate:up` tạo đủ bảng; `npm run migrate:down` xoá sạch; chạy `up` lần 2 không lỗi; `\d order_items` thấy đủ constraint.
- ⚠️ Postgres **không tự tạo index cho cột FK** (khác với PK/UNIQUE) → phải tạo tay, nếu không JOIN/DELETE CASCADE sẽ chậm.

#### B1.6 — Script sinh dữ liệu giả ⏱ 4h
- **Làm gì:** `scripts/seed.ts` dùng `@faker-js/faker` tạo: 8 danh mục, 200 sản phẩm, 3.000 khách, 4 kênh, ~40.000 đơn / ~100.000 order_items trải đều 18 tháng, có **tính mùa vụ** (Tết, cuối tuần cao hơn), 5% đơn `cancelled`. Insert theo lô (batch 1.000 dòng) trong transaction.
- **File:** `apps/api/scripts/seed.ts`, script `npm run seed`.
- ✅ `npm run seed` chạy < 60 giây; `SELECT COUNT(*) FROM order_items` ≈ 100.000; chạy lại với `--reset` cho kết quả tái lập được (dùng `faker.seed(42)`).
- ⚠️ Insert từng dòng một sẽ mất vài phút do round-trip → bắt buộc batch/multi-row INSERT hoặc `COPY`.

#### B1.7 — Viết sẵn SQL các KPI & đo hiệu năng ⏱ 3h
- **Làm gì:** viết tay các câu SQL KPI (mục 5) trong file SQL, chạy `EXPLAIN (ANALYZE, BUFFERS)` trên 100k dòng, ghi lại thời gian.
- **File:** `docs/sql/kpi-queries.sql`, `docs/sql/explain-baseline.md`.
- ✅ Có ít nhất 5 câu: tổng KPI, doanh thu theo ngày, top 10 sản phẩm, theo danh mục, theo kênh; mỗi câu có kết quả EXPLAIN và thời gian được ghi lại (làm mốc so sánh ở B5.1).
- 📚 Đọc execution plan: Seq Scan vs Index Scan, Hash Join, cost vs actual time.

#### B1.8 — Báo cáo Sprint 1 ⏱ 1h
- **File:** `docs/bao-cao/sprint-1.md` (mẫu ở mục 8).
- ✅ Báo cáo có: đã làm / chưa làm / khó khăn / kế hoạch sprint 2 / ảnh chụp màn hình.

---

### SPRINT 2 (Tuần 4–5) — Xác thực & nhập CSV/Excel
**Mục tiêu sprint:** người dùng đăng nhập, upload file CSV/Excel, ánh xạ cột, xem kết quả nhập và các dòng lỗi.

#### B2.1 — Shared schemas ⏱ 2h
- **Làm gì:** tạo `packages/shared` export Zod schema `LoginInput`, `ImportRow` (order_code, ordered_at, customer_code, product_sku, product_name, category, channel, quantity, unit_price, discount, status), `DateRangeQuery`.
- **File:** `packages/shared/src/schemas/*.ts`, `packages/shared/src/index.ts`.
- ✅ Cả `apps/api` và `apps/web` import được `@cn019/shared` và type-check pass (`npm run typecheck`).

#### B2.2 — API đăng nhập/đăng xuất ⏱ 4h
- **Làm gì:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`; bcrypt so sánh mật khẩu; JWT ký bằng `JWT_SECRET`, set cookie `httpOnly; SameSite=Lax; Secure (prod)`; middleware `requireAuth`, `requireRole('admin')`; script tạo admin đầu tiên.
- **File:** `apps/api/src/modules/auth/*`, `src/middlewares/auth.ts`, `scripts/create-admin.ts`.
- ✅ Test Supertest: đúng mật khẩu → 200 + có cookie; sai → 401 với thông báo chung "Sai email hoặc mật khẩu" (không lộ email có tồn tại); gọi `/me` không cookie → 401; viewer gọi route admin → 403.
- ⚠️ Không trả `password_hash` trong bất kỳ response nào → dùng DTO.

#### B2.3 — Trang đăng nhập + route bảo vệ ⏱ 3h
- **File:** `apps/web/src/lib/api.ts` (fetch wrapper `credentials: 'include'`), `features/auth/LoginPage.tsx`, `components/ProtectedRoute.tsx`.
- ✅ Chưa đăng nhập vào `/dashboard` → chuyển về `/login`; đăng nhập xong vào được; F5 vẫn giữ phiên; bấm Đăng xuất → về `/login`.

#### B2.4 — Upload & đọc file (extractor) ⏱ 4h
- **Làm gì:** `POST /api/imports/preview` (multer, giới hạn 10 MB, chỉ `.csv/.xlsx`) → trả về danh sách cột + 20 dòng đầu. Extractor CSV (papaparse stream, hỗ trợ UTF-8 có BOM) và Excel (exceljs, sheet đầu tiên).
- **File:** `modules/imports/routes.ts`, `extractors/csv.ts`, `extractors/excel.ts`, `tests/fixtures/sample-orders.csv`, `sample-orders.xlsx`.
- ✅ Upload file mẫu nhận đúng tên cột & 20 dòng; file `.pdf` → 400; file > 10 MB → 413; CSV tiếng Việt xuất từ Excel (có BOM) không bị lỗi font cột đầu tiên.
- ⚠️ Excel lưu ngày dạng số serial (vd 45678) → phải chuyển đổi; định dạng số kiểu "1.200.000" (VN) phải bỏ dấu chấm.

#### B2.5 — Ánh xạ cột + validate + staging ⏱ 4h
- **Làm gì:** `POST /api/imports` nhận file + `mapping` (`{ "Mã đơn": "order_code", ... }`); với mỗi dòng: map → chuẩn hoá (ngày, số) → validate Zod → ghi `staging_rows` hoặc `import_errors`. Tạo `import_jobs`.
- **File:** `modules/imports/mapping.ts`, `modules/imports/service.ts`, `migrations/002_*` nếu cần.
- ✅ Unit test `mapping.ts`: ngày `dd/MM/yyyy`, ISO, serial Excel đều ra đúng; dòng thiếu `product_sku` vào `import_errors` với `row_number` đúng (đếm theo dòng trong file, tính cả header).

#### B2.6 — Loader: staging → bảng core (transaction) ⏱ 4h
- **Làm gì:** `loader.ts` trong **một transaction**: upsert categories → products → customers → channels → orders → order_items (`INSERT ... SELECT ... FROM staging_rows ... ON CONFLICT`); cập nhật `import_jobs`; xoá staging của job.
- **File:** `modules/imports/loader.ts`, `tests/imports.int.test.ts`.
- ✅ Integration test: nhập file 1.000 dòng → đúng số đơn; **nhập lại cùng file → tổng doanh thu không đổi** (idempotent); cố tình gây lỗi giữa chừng → không có dòng nào lọt vào `orders` (rollback).
- ⚠️ Nhập lại đơn đã có: xoá `order_items` cũ của đơn đó rồi chèn lại, tránh cộng dồn món.

#### B2.7 — Giao diện nhập dữ liệu 3 bước ⏱ 4h
- **Làm gì:** Bước 1 chọn file → Bước 2 bảng ánh xạ cột (dropdown, tự đoán theo tên cột) + preview → Bước 3 kết quả (OK / lỗi, tải danh sách dòng lỗi). Trang lịch sử nhập.
- **File:** `features/imports/UploadPage.tsx`, `MappingStep.tsx`, `ImportHistory.tsx`; `GET /api/imports`, `GET /api/imports/:id/errors`.
- ✅ Nhập trọn vẹn file mẫu qua giao diện; file có 3 dòng lỗi hiển thị đúng 3 dòng với lý do; mapping được lưu cho lần sau (`data_sources.column_mapping`).

#### B2.8 — Báo cáo Sprint 2 ⏱ 1h — `docs/bao-cao/sprint-2.md`

---

### SPRINT 3 (Tuần 6–7) — API phân tích & Dashboard
**Mục tiêu sprint:** dashboard hoàn chỉnh dùng được với dữ liệu giả; đây là bản demo chính giữa kỳ.

#### B3.1 — Materialized view tổng hợp ⏱ 3h
- **Làm gì:** migration tạo `mv_daily_sales` + `UNIQUE INDEX (day, product_id, channel_id)` (bắt buộc để `REFRESH ... CONCURRENTLY`); gọi refresh cuối loader.
- **File:** `migrations/003_mv_daily_sales.sql`, `jobs/refresh-mv.ts`.
- ✅ Tổng `revenue` trong MV = kết quả câu SQL gốc trên bảng core (viết test so sánh); sau khi import, MV được làm mới.
- ⚠️ Trade-off: MV nhanh nhưng **dữ liệu trễ** đến lần refresh tiếp theo — chấp nhận được vì dữ liệu cập nhật theo lần nhập, ghi vào báo cáo.

#### B3.2 — Endpoint phân tích ⏱ 5h
- **Làm gì:** tất cả nhận `from`, `to` (bắt buộc), `channel`, `category` (tuỳ chọn), validate bằng `DateRangeQuery`:
  - `GET /api/analytics/summary` → revenue, orders, aov, customers + delta % so kỳ trước
  - `GET /api/analytics/revenue-trend?granularity=day|week|month`
  - `GET /api/analytics/top-products?limit=10&by=revenue|quantity`
  - `GET /api/analytics/by-category`, `GET /api/analytics/by-channel`
- **File:** `modules/analytics/routes.ts`, `service.ts`, `repo.ts`, `docs/api.md`.
- ✅ Test integration với dataset nhỏ cố định (tính tay được kết quả mong đợi) cho từng endpoint; khoảng thời gian không có dữ liệu trả mảng rỗng / `aov: null`, không lỗi 500; `from > to` → 400.
- ⚠️ Luôn dùng tham số `$1, $2` — **không nối chuỗi** vào SQL (SQL injection), kể cả `granularity` → map qua whitelist (`date_trunc('week', ...)`).
- ⚠️ Xu hướng theo ngày phải **điền ngày trống = 0** (`generate_series`) nếu không biểu đồ nối thẳng qua ngày không bán, gây hiểu nhầm.

#### B3.3 — KPI cards + bộ lọc thời gian ⏱ 4h
- **File:** `features/dashboard/DashboardPage.tsx`, `KpiCards.tsx`, `DateRangeFilter.tsx` (preset: 7 ngày, 30 ngày, tháng này, quý này, năm nay, tuỳ chọn).
- ✅ Đổi bộ lọc → 4 thẻ cập nhật, mũi tên xanh/đỏ theo delta; trạng thái bộ lọc lưu trên URL (`?from=&to=`) để copy link chia sẻ được; định dạng tiền `1.250.000 ₫` (`Intl.NumberFormat('vi-VN')`).

#### B3.4 — Biểu đồ ⏱ 5h
- **File:** `RevenueChart.tsx` (line, chọn ngày/tuần/tháng), `TopProducts.tsx` (bar ngang + bảng), `CategoryChart.tsx` (donut), `ChannelChart.tsx` (bar).
- ✅ Cả 4 biểu đồ hiển thị đúng số liệu khớp với API (đối chiếu thủ công 2 điểm dữ liệu); có trạng thái loading (skeleton), rỗng ("Chưa có dữ liệu trong khoảng này"), lỗi (nút thử lại); hiển thị ổn ở màn hình 375px.

#### B3.5 — Lọc chéo theo kênh/danh mục ⏱ 3h
- **Làm gì:** dropdown kênh & danh mục áp dụng cho toàn dashboard; click 1 cột danh mục → lọc theo danh mục đó.
- ✅ Chọn kênh "shopee" → mọi KPI/biểu đồ chỉ còn dữ liệu Shopee (kiểm bằng SQL đối chiếu).

#### B3.6 — Báo cáo Sprint 3 + demo giữa kỳ ⏱ 2h — `docs/bao-cao/sprint-3.md` kèm video/ảnh demo.

---

### SPRINT 4 (Tuần 8–9) — Kết nối CSDL ngoài, đồng bộ API, xuất báo cáo
**Mục tiêu sprint:** hỗ trợ đủ 3 loại nguồn dữ liệu theo yêu cầu đề.

#### B4.1 — Quản lý nguồn dữ liệu + mã hoá cấu hình ⏱ 3h
- **Làm gì:** CRUD `data_sources` (chỉ admin); `crypto.ts` mã hoá/giải mã `config` bằng AES-256-GCM với khoá `ENCRYPTION_KEY` trong env; API **không bao giờ trả lại mật khẩu** (trả `"••••"`).
- **File:** `modules/sources/*`, `modules/sources/crypto.ts`, `features/sources/SourcesPage.tsx`.
- ✅ Unit test encrypt→decrypt khớp; xem DB thấy `config_encrypted` không đọc được bằng mắt; `GET /api/sources/:id` không chứa mật khẩu.

#### B4.2 — Extractor CSDL trực tiếp ⏱ 5h
- **Làm gì:** form nhập host/port/db/user/password + **câu SELECT** hoặc tên bảng/view; nút "Kiểm tra kết nối"; extractor chạy query với `statement_timeout`, đọc theo cursor/lô, rồi đi qua **cùng pipeline** mapping → validate → staging → loader. Hỗ trợ PostgreSQL (bắt buộc), MySQL (`mysql2`, nếu kịp).
- **File:** `extractors/database.ts`, `features/sources/DbSourceForm.tsx`, `POST /api/sources/:id/test`, `POST /api/sources/:id/sync`.
- ✅ Tạo một DB Postgres thứ hai `shop_external` (script có sẵn) → đồng bộ thành công vào dashboard; sai mật khẩu → thông báo thân thiện, không lộ stack trace; câu lệnh không bắt đầu bằng SELECT → bị từ chối.
- ⚠️ Bảo mật: hướng dẫn người dùng tạo **tài khoản chỉ đọc**; thêm `SET TRANSACTION READ ONLY` khi chạy query; kiểm tra "chỉ SELECT" bằng chuỗi là chưa đủ an toàn → read-only user mới là lớp bảo vệ thật (ghi trong ADR).

#### B4.3 — Mock shop API ⏱ 2h
- **Làm gì:** app Express nhỏ `apps/mock-shop-api` trả `GET /orders?updated_since=...&page=...` (JSON phân trang, API key ở header), dữ liệu sinh bằng faker.
- **File:** `apps/mock-shop-api/src/server.ts`.
- ✅ `curl -H "x-api-key: demo" localhost:5000/orders?page=1` trả JSON có `data`, `next_page`.

#### B4.4 — Extractor REST API + đồng bộ tăng dần ⏱ 5h
- **Làm gì:** cấu hình: base URL, header auth, đường dẫn tới mảng dữ liệu (`data`), kiểu phân trang; đồng bộ **incremental** dùng `last_synced_at` (`updated_since`); retry có backoff khi lỗi mạng/429.
- **File:** `extractors/rest-api.ts`, `features/sources/ApiSourceForm.tsx`.
- ✅ Đồng bộ lần 1 lấy toàn bộ; lần 2 chỉ lấy bản ghi mới (log số bản ghi); tắt mock API giữa chừng → job `failed`, `last_synced_at` **không** bị cập nhật (để lần sau lấy lại).

#### B4.5 — Lập lịch đồng bộ ⏱ 3h
- **Làm gì:** `jobs/scheduler.ts` đọc các nguồn có `schedule_cron`, đăng ký `node-cron`; khoá chống chạy chồng (`pg_try_advisory_lock(source_id)`).
- **File:** `jobs/scheduler.ts`, `jobs/sync-job.ts`.
- ✅ Đặt lịch mỗi 2 phút → thấy `import_jobs` mới xuất hiện; bấm "Đồng bộ ngay" trong lúc job đang chạy → báo "đang đồng bộ", không tạo job thứ 2.

#### B4.6 — Xuất báo cáo CSV ⏱ 2h
- **File:** `modules/export/*`; nút "Xuất CSV" trên dashboard.
- ✅ File CSV tải về mở bằng Excel không lỗi tiếng Việt (ghi BOM UTF-8), số liệu khớp dashboard với cùng bộ lọc.

#### B4.7 — Báo cáo Sprint 4 ⏱ 1h — `docs/bao-cao/sprint-4.md`

---

### SPRINT 5 (Tuần 10–11) — Tối ưu, kiểm thử, triển khai, tài liệu, thử nghiệm thật
**Mục tiêu sprint:** bản deploy công khai, người dùng thật dùng thử theo tài liệu.

#### B5.1 — Tối ưu hiệu năng ⏱ 3h
- **Làm gì:** chạy lại EXPLAIN các truy vấn analytics so với mốc B1.7; thêm index thiếu; seed 500k dòng để thử tải; nén response (`compression`).
- **File:** `docs/sql/explain-after.md`, migration index mới nếu có.
- ✅ Bảng so sánh trước/sau; mọi endpoint analytics < 300 ms trên 100k dòng (đo bằng log thời gian request).

#### B5.2 — Hoàn thiện kiểm thử ⏱ 4h
- **Làm gì:** bổ sung test còn thiếu; bảng test case cho import (decision table: định dạng ngày × số âm × thiếu cột × trùng mã); test component KPI/Filter.
- **File:** `apps/api/tests/*`, `apps/web/src/**/*.test.tsx`, `docs/test-cases.md`.
- ✅ `npm test` xanh toàn bộ; coverage `modules/imports` và `modules/analytics` ≥ 70% (statement); `docs/test-cases.md` có bảng testcase (ID, đầu vào, kỳ vọng, kết quả).

#### B5.3 — Chuẩn bị production ⏱ 3h
- **Làm gì:** `helmet`, CORS chỉ cho domain web, rate limit `/auth/login`, log có cấu trúc (`pino`), build TS (`tsc`) cho API, build web (`vite build`), biến env production.
- **File:** `apps/api/src/app.ts`, `apps/api/package.json` (script `build`, `start`), `.env.example`.
- ✅ `npm run build && npm start` chạy được bằng JS đã build; đăng nhập sai 10 lần/phút → 429; lỗi 500 không trả stack trace ra client.

#### B5.4 — Deploy ⏱ 4h
- **Làm gì:** tạo Postgres managed, chạy migration, deploy API (1 instance — vì node-cron), deploy web; cookie `Secure; SameSite=None` nếu FE/BE khác domain; tạo admin; nạp dữ liệu demo.
- **File:** `docs/huong-dan-trien-khai.md`.
- ✅ Truy cập URL công khai từ điện thoại (4G, không phải wifi nhà) đăng nhập và xem dashboard được; người khác làm theo `huong-dan-trien-khai.md` dựng lại được.
- ⚠️ Free tier có thể "ngủ" sau thời gian không dùng → lần đầu mở chậm; ghi chú trong tài liệu và mở trước khi demo.

#### B5.5 — Tài liệu người dùng ⏱ 3h
- **File:** `docs/huong-dan-su-dung.md` (có ảnh chụp): đăng nhập, chuẩn bị file Excel mẫu (kèm `mau-du-lieu.xlsx`), nhập dữ liệu & sửa dòng lỗi, đọc từng biểu đồ, kết nối CSDL/API, câu hỏi thường gặp.
- ✅ Một người không học IT làm theo tài liệu tự nhập được file và trả lời đúng câu "sản phẩm nào bán chạy nhất tháng trước?".

#### B5.6 — Thử nghiệm với người dùng thật (UAT) ⏱ 3h
- **Làm gì:** 2–3 người dùng (vd. cửa hàng nhỏ quen biết) dùng dữ liệu thật hoặc dữ liệu đã ẩn danh; ghi nhận góp ý; sửa lỗi nghiêm trọng.
- **File:** `docs/uat.md` (kịch bản, người tham gia, góp ý, đã sửa / để sau).
- ✅ Có ≥ 2 phiếu góp ý; mọi lỗi mức "chặn sử dụng" đã sửa và deploy lại.
- ⚠️ Dữ liệu thật của cửa hàng: xin phép, ẩn tên/SĐT khách trước khi đưa lên server demo.

#### B5.7 — Báo cáo tổng kết ⏱ 3h
- **File:** `docs/bao-cao/sprint-5.md`, báo cáo đồ án cuối, slide bảo vệ.
- ✅ Có: kiến trúc, ERD, luồng ETL, kết quả hiệu năng, kết quả test, UAT, hạn chế & hướng phát triển (multi-tenant, dự báo doanh thu, thông báo khi doanh thu bất thường).

---

## 7. QUẢN LÝ RỦI RO

| Rủi ro | Dấu hiệu | Ứng phó |
|---|---|---|
| Học công nghệ mới tốn thời gian hơn dự kiến | Sprint 1 trễ > 4h | Cắt MySQL ở B4.2, cắt Could-have; giữ nguyên Must |
| Trễ tiến độ tổng | Cuối Sprint 3 chưa có dashboard | Sprint 4 chỉ làm B4.1–B4.2 (CSDL) + B4.6; API sync làm bản tối giản không lập lịch |
| Laptop 8 GB chậm | Swap nhiều khi chạy Postgres + 2 dev server + trình duyệt | Postgres native thay Docker; tắt mock API khi không dùng |
| Không có người dùng thật | Tuần 9 chưa liên hệ được ai | Liên hệ từ Tuần 8; phương án dự phòng: bạn bè đóng vai chủ shop với dữ liệu giả |
| Deploy free tier thay đổi chính sách | — | Kiểm tra lại ở Tuần 9, có phương án thay thế trong `huong-dan-trien-khai.md` |

---

## 8. MẪU BÁO CÁO SPRINT (`docs/bao-cao/sprint-N.md`)

```markdown
# Báo cáo Sprint N (Tuần a–b) — CN-019
## 1. Mục tiêu sprint
## 2. Đã hoàn thành (bước, link commit, ảnh chụp)
## 3. Chưa hoàn thành & lý do
## 4. Khó khăn kỹ thuật & cách giải quyết (bài học)
## 5. Số giờ thực tế / ước lượng
## 6. Kế hoạch sprint tiếp theo
## 7. Câu hỏi cho GVHD
```

---

## 9. BẢNG THEO DÕI TIẾN ĐỘ

> Tick `[x]` khi đạt **toàn bộ** tiêu chí ✅. Ghi ngày hoàn thành và giờ thực tế.

| Bước | Nội dung | Ước lượng | Thực tế | Ngày xong |
|---|---|---|---|---|
| [x] B1.1 | Khởi tạo monorepo | 3h | | 2026-10-20 |
| [ ] B1.2 | Khung API Express | 3h | | |
| [ ] B1.3 | Khung web React | 2h | | |
| [ ] B1.4 | PostgreSQL + pool | 2h | | |
| [ ] B1.5 | Migration schema | 4h | | |
| [ ] B1.6 | Seed dữ liệu giả | 4h | | |
| [ ] B1.7 | SQL KPI + EXPLAIN mốc | 3h | | |
| [ ] B1.8 | Báo cáo Sprint 1 | 1h | | |
| [ ] B2.1 | Shared schemas | 2h | | |
| [ ] B2.2 | API auth | 4h | | |
| [ ] B2.3 | Trang login + ProtectedRoute | 3h | | |
| [ ] B2.4 | Upload & extractor CSV/Excel | 4h | | |
| [ ] B2.5 | Mapping + validate + staging | 4h | | |
| [ ] B2.6 | Loader transaction | 4h | | |
| [ ] B2.7 | UI nhập dữ liệu 3 bước | 4h | | |
| [ ] B2.8 | Báo cáo Sprint 2 | 1h | | |
| [ ] B3.1 | Materialized view | 3h | | |
| [ ] B3.2 | Endpoint analytics | 5h | | |
| [ ] B3.3 | KPI cards + bộ lọc | 4h | | |
| [ ] B3.4 | Biểu đồ | 5h | | |
| [ ] B3.5 | Lọc chéo | 3h | | |
| [ ] B3.6 | Báo cáo Sprint 3 + demo | 2h | | |
| [ ] B4.1 | Nguồn dữ liệu + mã hoá | 3h | | |
| [ ] B4.2 | Kết nối CSDL ngoài | 5h | | |
| [ ] B4.3 | Mock shop API | 2h | | |
| [ ] B4.4 | Đồng bộ REST API | 5h | | |
| [ ] B4.5 | Lập lịch đồng bộ | 3h | | |
| [ ] B4.6 | Xuất CSV | 2h | | |
| [ ] B4.7 | Báo cáo Sprint 4 | 1h | | |
| [ ] B5.1 | Tối ưu hiệu năng | 3h | | |
| [ ] B5.2 | Hoàn thiện test | 4h | | |
| [ ] B5.3 | Chuẩn bị production | 3h | | |
| [ ] B5.4 | Deploy | 4h | | |
| [ ] B5.5 | Tài liệu người dùng | 3h | | |
| [ ] B5.6 | UAT người dùng thật | 3h | | |
| [ ] B5.7 | Báo cáo tổng kết | 3h | | |

**Tổng ước lượng:** Sprint 1 = 22h · Sprint 2 = 26h · Sprint 3 = 22h · Sprint 4 = 21h · Sprint 5 = 23h → **114h / 10 tuần (~11,4h/tuần)**, còn dư ~10–30h làm vùng đệm cho việc học công nghệ mới.

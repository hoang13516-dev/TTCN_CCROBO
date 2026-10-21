# KẾ HOẠCH THỰC HIỆN — CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Đồ án chuyên ngành — GVHD: ThS. Dương Văn Đeo (GV001) — Thực hiện: Nguyễn Minh Hoàng (nhóm CCROBO, 1 sinh viên)
> Phiên bản: **v2.0** (21/10/2026) — **thay thế** kế hoạch v1 (7 sprint, 131 giờ, xem trong lịch sử git)
> Thời gian: **50 ngày, 21/10/2026 → 09/12/2026** · **7 sprint × 1 tuần** (Thứ Tư → Thứ Ba) + ngày nộp
> Ngân sách: **92,5 giờ ≈ 13 giờ/tuần** (1,5–2,5 giờ/ngày) · Phạm vi: **Must + Should**, mức **cơ bản, mở rộng được**
> Stack: TypeScript · React (Vite) · Node.js/Express · PostgreSQL · SQL
> Căn cứ: tài liệu phân tích `docs/phan-tich/` (v2.0). Định nghĩa KPI, quy tắc nhập, từ điển dữ liệu **chỉ** nằm ở `docs/phan-tich/03-dac-ta-yeu-cau.md`.

---

## 0. HƯỚNG DẪN CHO PHIÊN LÀM VIỆC TIẾP THEO (đọc trước khi làm)

1. **Tìm bước đầu tiên chưa tick** trong [§10](#10-bảng-theo-dõi-tiến-độ). Mỗi lần chỉ làm **một bước**. Lịch theo ngày ở §7 cho biết bước đó _nên_ làm vào ngày nào.
2. Mỗi bước có: **Làm gì** · **File** · ✅ **Xong khi** (trỏ tới AC trong `docs/phan-tich/06-dac-ta-use-case.md`) · ⚠️ **Bẫy** · 📚 **Học trước**. Chỉ tick khi mọi AC đã kiểm chứng bằng lệnh hoặc thao tác thật.
3. Muốn biết một bước phục vụ yêu cầu nào: ma trận truy vết `docs/phan-tich/07-truy-vet-va-tu-kiem-tra.md`.
4. Không đổi quyết định ở §2 nếu chưa ghi lý do vào `docs/adr/`. Không đổi phạm vi nếu chưa sửa `docs/phan-tich/03-dac-ta-yeu-cau.md` trước.
5. Sinh viên **chưa quen** TS/React/Express/PostgreSQL: khi viết code, giải thích _vì sao_, không chỉ đưa code.
6. Cuối mỗi bước: commit theo quy ước `feat(api): …`, `fix(web): …`, `docs: …`, `test: …`; tick bảng tiến độ, ghi giờ thực tế.
7. Cuối mỗi tuần (Thứ Ba): báo cáo sprint theo mẫu §9. Lệch > 3 giờ so với lịch → áp dụng thứ tự cắt ở §8.
8. Máy dev: laptop 8 GB RAM → PostgreSQL cài trực tiếp hoặc 1 container duy nhất.

---

## 1. TỔNG QUAN

### 1.1 Mục tiêu sản phẩm

Web BI cho **doanh nghiệp bán lẻ có nhiều chi nhánh ở ba miền và bán thêm online**: gom dữ liệu bán hàng từ **file CSV/Excel** và **REST API**, làm sạch/chuẩn hoá (ETL), nạp vào kho dữ liệu **hình sao**, rồi hiển thị dashboard KPI (doanh thu, lợi nhuận, AOV, tỷ lệ giữ chân khách, sản phẩm bán chạy theo vùng miền/thời gian) có lọc đa chiều, drill-down, lọc chéo, cảnh báo bất thường và xuất báo cáo Excel/PDF. Bài toán, mục tiêu G1–G6 và vấn đề P1–P8: `docs/phan-tich/01-khao-sat-va-phan-tich-de-tai.md`.

### 1.2 Đối chiếu "Kết quả cần đạt" của đề → phạm vi

| Đề bài yêu cầu                                     | Use case                          | Sprint |
| -------------------------------------------------- | --------------------------------- | ------ |
| Đăng nhập & phân quyền xem báo cáo                  | UC01–UC04 (3 vai, phạm vi chi nhánh) | S2, S6 |
| Quản lý nguồn dữ liệu & import/ETL                  | UC06–UC11 (file + REST API)       | S3, S5 |
| Bộ lọc đa chiều thời gian/chi nhánh/danh mục        | UC13                              | S4     |
| Biểu đồ KPI: doanh thu, lợi nhuận, AOV, giữ chân khách, SP bán chạy theo vùng/thời gian | UC12 | S4 |
| Biểu đồ tương tác drill-down, cross-filtering       | UC13, UC14                        | S4     |
| Cảnh báo chỉ số bất thường                          | UC15, UC16                        | S5, S6 |
| Xuất báo cáo PDF/Excel                              | UC17                              | S5     |
| ETL, mô hình OLAP/Star Schema, tối ưu truy vấn tổng hợp | S1.3, S2.1, S3.2, S6.3        | S1–S6  |
| Báo cáo phân tích thiết kế                          | `docs/phan-tich/`, `docs/adr/`, báo cáo tổng kết | S1, S7 |

### 1.3 Phạm vi theo use case (17 UC — chi tiết ở `docs/phan-tich/05-…`)

| Mức        | Use case                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Must**   | UC01 Đăng nhập · UC02 Đăng xuất · UC06 Nhập file · UC07 Ánh xạ cột · UC09 Lịch sử nhập · UC10 Quản lý nguồn · UC11 Đồng bộ API · UC12 Dashboard KPI · UC13 Lọc đa chiều & lọc chéo · UC14 Drill-down · UC15 Xem cảnh báo · UC17 Xuất Excel/PDF |
| **Should** | UC03 Đổi mật khẩu · UC04 Quản lý người dùng · UC05 Quản lý chi nhánh · UC08 Tải file mẫu · UC16 Cấu hình cảnh báo                               |
| **Won't**  | Kết nối CSDL ngoài, đồng bộ theo lịch, nhập nền, hủy lần nhập, ML, email, multi-tenant (lý do và cách mở rộng: `03-…` §3.1.7)                   |

### 1.4 Yêu cầu phi chức năng then chốt

- Dashboard < **2 s**, mỗi API phân tích < **500 ms** với **100.000** dòng `fact_sales` (NFR-01).
- Nhập 10.000 dòng < **15 s** (NFR-02); nạp atomic + idempotent (NFR-07).
- bcrypt; JWT trong cookie httpOnly; quyền **và phạm vi chi nhánh** kiểm tra ở server (NFR-03…NFR-06).
- Múi giờ `Asia/Ho_Chi_Minh`; tiền VND lưu `BIGINT` (NFR-11).

### 1.5 Các mốc

| Mốc    | Ngày  | Nội dung                                                                  | Kiểm chứng                                    |
| ------ | ----- | ------------------------------------------------------------------------- | --------------------------------------------- |
| **M1** | 27/10 | Nộp phân tích v2; CSDL hình sao + ~100.000 dòng dữ liệu giả                | Báo cáo đã gửi; `SELECT count(*) FROM fact_sales` ≈ 100.000 |
| **M2** | 10/11 | Nhập file **end-to-end**: upload → ánh xạ → nạp → lịch sử                  | AC-06.x, AC-07.x, AC-09.x pass               |
| **M3** | 17/11 | **Demo giữa kỳ**: dashboard KPI + lọc đa chiều + drill-down + lọc chéo     | AC-12.x…AC-14.x pass; video demo             |
| **M4** | 24/11 | **Đủ mọi "Kết quả cần đạt"**: thêm cảnh báo, xuất Excel/PDF, đồng bộ API   | AC-11.x, AC-15.x, AC-17.x pass               |
| **M5** | 01/12 | Quản trị (người dùng, chi nhánh); **deploy** công khai                     | Mở URL từ điện thoại 4G                       |
| **M6** | 08/12 | Kiểm thử, tài liệu, UAT xong                                              | `npm test` xanh; ≥ 2 phiếu UAT               |
| **M7** | 09/12 | **Nộp sản phẩm cuối**                                                     | Đã nộp                                        |

---

## 2. QUYẾT ĐỊNH KỸ THUẬT (đã chốt)

| Hạng mục          | Lựa chọn                                                                                     | Lý do / Trade-off                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Cấu trúc repo     | Monorepo npm workspaces: `apps/api`, `apps/web`, `apps/mock-shop-api`, `packages/shared`      | Chia sẻ type & schema Zod giữa FE/BE; đơn giản hơn Nx/Turborepo cho 1 người                                     |
| Backend           | Express + TypeScript, dev bằng `tsx watch`                                                    | Đề yêu cầu Express                                                                                              |
| Truy cập DB       | **`pg`** + SQL viết tay (repository pattern)                                                  | Đồ án nhấn mạnh SQL, cần đọc execution plan. Trade-off: tự lo mapping                                           |
| Migration         | `node-pg-migrate` (file `.sql`)                                                               | Schema có version, tái lập được khi deploy                                                                      |
| **Kho dữ liệu**   | **Star schema**: `fact_sales` + `dim_date`, `dim_branch`, `dim_product`, `dim_customer`, `dim_channel` (ADR-0003) | Đúng yêu cầu OLAP của đề; truy vấn tổng hợp chỉ là JOIN fact–dim + GROUP BY; thêm chiều mới không đổi pipeline. Trade-off: dữ liệu danh mục lặp trong `dim_product` (chấp nhận được) |
| Tổng hợp          | Truy vấn trực tiếp `fact_sales` + index; **không** dùng materialized view                     | 100.000 dòng đủ nhanh (đo ở S2.1/S6.3); bớt bước làm mới MV. Mở rộng: bảng tổng hợp `agg_sales_daily` khi > 5 triệu dòng |
| ETL               | Một pipeline: **Extract** (`csv`/`xlsx`/`api`) → **Map** → **Transform/Validate** → **Load**; xử lý **trong request** (≤ 10.000 dòng) (ADR-0004) | Đơn giản, dễ debug. Trade-off: file lớn phải chia nhỏ; mở rộng bằng hàng đợi job |
| Validation        | **Zod** + hàm chuẩn hoá thuần trong `packages/shared`                                         | Một nguồn sự thật cho FE (xem trước) và BE (nhập thật)                                                          |
| Frontend          | React + Vite + TS, React Router, **TanStack Query**, **Recharts**, Tailwind                    | TanStack Query lo cache/loading/error; Recharts có sự kiện click cho drill-down                                  |
| Đọc file          | `papaparse` (CSV) · `exceljs` (xlsx, cũng dùng để **xuất** Excel)                              | Một thư viện cho cả đọc và ghi Excel                                                                            |
| Auth              | JWT trong **cookie httpOnly** + bcrypt; **3 vai trò** `manager < analyst < admin`; manager gắn 1 chi nhánh (ADR-0002) | "Phân quyền xem báo cáo" = mỗi quản lý chi nhánh chỉ thấy chi nhánh mình (row-level security ở tầng service) |
| Phiên             | Mỗi request **đọc lại user từ CSDL** (vai trò, chi nhánh, khoá)                               | Thu hồi quyền có hiệu lực ngay; đổi lấy 1 truy vấn theo khoá chính                                              |
| Cảnh báo          | Bảng `alert_rules` + hàm đánh giá trên đúng bộ lọc hiện tại, tính khi gọi `GET /api/alerts`   | Không cần job nền; đổi ngưỡng có hiệu lực ngay. Mở rộng: job định kỳ + gửi email                                |
| Xuất PDF          | Trang `/report` có CSS in A4, nút gọi `window.print()` → "Lưu thành PDF"                      | Có cả biểu đồ, 0 thư viện. Trade-off: phụ thuộc hộp in trình duyệt; mở rộng: Puppeteer ở server để gửi email    |
| Nguồn API demo    | `apps/mock-shop-api`: Express + dữ liệu faker, `GET /orders?updated_since=&page=`, header `x-api-key` | Có nguồn API thật để demo đồng bộ tăng dần mà không phụ thuộc bên thứ ba                                  |
| Test              | **Vitest** + **Supertest** (API), Testing Library (web)                                       | Cùng hệ sinh thái Vite                                                                                          |
| Tenancy / Deploy  | Single-tenant; API + Postgres trên PaaS (Render/Railway/Neon…), web tĩnh trên Vercel/Netlify   | Kiểm tra lại free tier ở S6.4                                                                                   |

---

## 3. KIẾN TRÚC

### 3.1 Tổng quan

```
┌──────────────┐  HTTPS/JSON   ┌──────────────────────────────────────────────┐
│  React SPA   │ ────────────► │                 Express API                  │
│ (apps/web)   │ ◄──────────── │ routes → middlewares (auth, scope) → services │
│ TanStack Q.  │   cookie JWT  │        → repositories (SQL) ───────┐         │
│ Recharts     │               │ etl/: extractors (csv|xlsx|api)    │         │
└──────────────┘               │       → mapper → transformer → loader        │
                               └────────────────────────────────────┼─────────┘
                                                                    │ pg Pool
       ┌────────────────────────────────────────────────────────────▼──────────┐
       │ PostgreSQL                                                           │
       │  Vận hành: users, data_sources, import_jobs, import_errors, alert_rules│
       │  Kho (star): fact_sales ─┬─ dim_date   ─ dim_branch (vùng)           │
       │                          ├─ dim_product (danh mục) ─ dim_customer    │
       │                          └─ dim_channel                              │
       └──────────────────────────────────────────────────────────────────────┘
  Nguồn ngoài: file CSV/Excel (upload) │ REST API (apps/mock-shop-api để demo)
```

Sơ đồ ngữ cảnh, quy trình, use case, ERD: `docs/phan-tich/so-do/out/` (H1–H12).

### 3.2 Luồng ETL (dùng chung cho mọi nguồn)

```
Extract (file: papaparse/exceljs │ API: fetch từng trang, updated_since)
 ─► Map: cột nguồn → 14 trường ImportRow (file: theo ánh xạ người dùng xác nhận; API: tên trường đã chuẩn)
 ─► Transform/Validate từng dòng (BR-08…BR-12) ─┬─► hợp lệ → mảng rows trong bộ nhớ
                                               └─► lỗi    → mảng errors (dòng, cột, lý do)
 ─► Kiểm tra nhất quán theo đơn (BR-07)
 ─► Load: 1 TRANSACTION
        upsert dim_product, dim_customer, dim_channel (tra dim_branch, dim_date)
        DELETE fact_sales của các đơn (source_id, order_code) có trong lô   ← idempotent (BR-06)
        INSERT fact_sales (multi-row)
     COMMIT │ ROLLBACK nếu lỗi
 ─► import_jobs: success | partial | failed (BR-13) + import_errors
```

### 3.3 Luồng một request dashboard

```
Browser ─GET /api/analytics/summary?from=2026-10-01&to=2026-10-21&branch=HN01─►
 requireAuth (cookie JWT → đọc user từ CSDL)
 ─► applyBranchScope (manager: ghi đè branch = chi nhánh của user; BR-15)
 ─► validate query (Zod: BR-18, whitelist)
 ─► analyticsService.summary(filters): 1 câu SQL trên fact_sales JOIN dim_* cho kỳ này + kỳ trước
 ─► tính delta (BR-05) ─► JSON ─► TanStack Query cache ─► 6 thẻ KPI
```

---

## 4. CẤU TRÚC THƯ MỤC MỤC TIÊU

```
cn019-sales-dashboard/
├─ package.json  .env.example  docker-compose.yml (1 service postgres, tuỳ chọn)
├─ ke-hoach.md                         # file này
├─ docs/
│  ├─ phan-tich/                       # phân tích yêu cầu (căn cứ của kế hoạch)
│  ├─ adr/                             # quyết định kiến trúc
│  ├─ bao-cao/sprint-1.md … sprint-7.md, tong-ket.md
│  ├─ erd.md  api.md  test-cases.md
│  ├─ sql/kpi-queries.sql  explain.md
│  └─ huong-dan-su-dung.md  huong-dan-trien-khai.md  uat.md
├─ packages/shared/src/
│  ├─ schemas/ (auth.ts, import.ts, filters.ts, user.ts, source.ts, alert.ts)
│  ├─ normalize/ (money.ts, date.ts, status.ts, channel.ts, text.ts)   # dùng chung FE/BE
│  ├─ mapping.ts (từ điển đồng nghĩa §3.5.3 + gợi ý ánh xạ)
│  └─ index.ts
├─ apps/api/
│  ├─ migrations/  scripts/ (seed.ts, create-user.ts)
│  ├─ src/
│  │  ├─ app.ts  server.ts  config/env.ts  db/pool.ts
│  │  ├─ middlewares/ (auth.ts, scope.ts, error.ts, validate.ts)
│  │  ├─ etl/ (extractors/{csv,xlsx,api}.ts, mapper.ts, transformer.ts, loader.ts, run-import.ts)
│  │  └─ modules/ (auth, users, branches, sources, imports, analytics, alerts, reports, catalog)
│  └─ tests/ (fixtures/, *.test.ts)
├─ apps/mock-shop-api/src/server.ts
└─ apps/web/src/
   ├─ main.tsx  router.tsx  lib/ (api.ts, format.ts, filters.ts)
   ├─ features/
   │  ├─ auth/ (LoginPage, ChangePasswordPage)
   │  ├─ dashboard/ (DashboardPage, FilterBar, KpiCards, AlertList, TrendChart,
   │  │              TopProducts, RegionChart, CategoryChart, ChannelChart)
   │  ├─ report/ (ReportPage — bản in PDF)
   │  ├─ imports/ (UploadPage, MappingStep, ImportResult, ImportHistory)
   │  ├─ sources/ (SourcesPage)
   │  └─ admin/ (UsersPage, BranchesPage, AlertRulesPage)
   └─ components/ (Layout, ProtectedRoute, RequireRole, …)
```

---

## 5. MÔ HÌNH DỮ LIỆU

### 5.1 Kho dữ liệu — mô hình hình sao (ADR-0003)

**Hạt (grain) của `fact_sales`: một dòng = một sản phẩm trong một đơn hàng.**

```
dim_date(date_key INT PK  -- yyyymmdd, vd 20261021
         full_date DATE UNIQUE, day, month, quarter, year, iso_week,
         day_of_week SMALLINT -- 1 = Thứ Hai, is_weekend BOOLEAN)
         -- sinh sẵn 2020-01-01 → 2030-12-31 bằng generate_series trong migration

dim_branch(branch_key SERIAL PK, code TEXT UNIQUE, name, province,
           region TEXT CHECK IN ('north','central','south'), is_active DEFAULT true)

dim_product(product_key SERIAL PK, sku TEXT UNIQUE, name,
            category TEXT NOT NULL DEFAULT 'Chưa phân loại', created_at)

dim_customer(customer_key SERIAL PK, customer_code TEXT UNIQUE, name NULL, created_at)

dim_channel(channel_key SERIAL PK, code TEXT UNIQUE, name)

fact_sales(sales_key BIGSERIAL PK,
           source_id INT FK data_sources NOT NULL, order_code TEXT NOT NULL,   -- chiều suy biến (degenerate)
           line_no SMALLINT NOT NULL,
           date_key INT FK dim_date NOT NULL, ordered_at TIMESTAMPTZ NOT NULL,
           branch_key FK dim_branch NOT NULL, channel_key FK dim_channel NOT NULL,
           product_key FK dim_product NOT NULL, customer_key FK dim_customer NULL,  -- NULL = khách lẻ
           status TEXT CHECK IN ('completed','cancelled','returned'),
           quantity INT CHECK (quantity > 0), unit_price BIGINT CHECK (>= 0),
           discount BIGINT DEFAULT 0 CHECK (>= 0), cost_price BIGINT CHECK (>= 0),
           revenue     BIGINT GENERATED ALWAYS AS (quantity * unit_price - discount) STORED,
           cost_amount BIGINT GENERATED ALWAYS AS (quantity * cost_price) STORED,
           import_job_id INT FK import_jobs NOT NULL,
           UNIQUE (source_id, order_code, line_no))          -- đơn xác định bởi (nguồn, mã đơn): BR-06
```

**Index** (Postgres không tự tạo index cho FK): `fact_sales(date_key)`, `fact_sales(branch_key, date_key)`, `fact_sales(product_key)`, `fact_sales(customer_key)`; `UNIQUE (source_id, order_code, line_no)` đã phục vụ thao tác xoá theo đơn khi nạp lại.

### 5.2 Bảng vận hành

```
users(id, email UNIQUE, full_name, password_hash,
      role TEXT CHECK IN ('admin','analyst','manager'),
      branch_key FK dim_branch NULL,
      is_active DEFAULT true, created_at,
      CHECK ((role = 'manager') = (branch_key IS NOT NULL)))   -- manager bắt buộc có đúng 1 chi nhánh (BR-15)

data_sources(id, type TEXT CHECK IN ('file','api'), name UNIQUE,
             api_url NULL, api_key NULL,            -- chỉ dùng khi type = 'api'; không bao giờ trả ra API
             is_active DEFAULT true, last_synced_at NULL, created_at)

import_jobs(id, source_id FK, trigger TEXT CHECK IN ('upload','sync'), file_name NULL,
            status TEXT CHECK IN ('running','success','partial','failed'),
            total_rows, ok_rows, error_rows, new_orders, updated_orders,
            error_message NULL, created_by FK users, started_at, finished_at)

import_errors(id, import_job_id FK ON DELETE CASCADE, row_number, column_name NULL, message, raw JSONB)

alert_rules(id, code UNIQUE, name,
            metric TEXT CHECK IN ('revenue','gross_profit','margin','orders','aov','retention','daily_revenue'),
            kind   TEXT CHECK IN ('drop_vs_previous','below_threshold','daily_zscore'),
            threshold NUMERIC, severity TEXT CHECK IN ('warning','critical'), is_active DEFAULT true)
```

Dữ liệu khởi tạo (migration/seed): 5 chi nhánh (HN01 Hà Nội, HP01 Hải Phòng — Bắc; DN01 Đà Nẵng — Trung; HCM01 TP.HCM, CT01 Cần Thơ — Nam), nguồn `file` "Nhập file chung", quy tắc cảnh báo R1–R5 (BR-20), 1 admin.

**Định nghĩa KPI, quy tắc nhập, từ điển dữ liệu:** `docs/phan-tich/03-dac-ta-yeu-cau.md` (BR-01…BR-21, §3.5). Không định nghĩa lại ở đây.

---

## 6. LỘ TRÌNH 7 SPRINT

| Sprint      | Thời gian     | Mục tiêu                                    | Demo được cuối sprint                                          | Use case xong          | Giờ  |
| ----------- | ------------- | ------------------------------------------- | -------------------------------------------------------------- | ---------------------- | ---- |
| **S1**      | 21/10 → 27/10 | Phân tích v2 + kho dữ liệu hình sao         | CSDL đủ bảng + ~100.000 dòng; bản phân tích đã gửi             | —                      | 13   |
| **S2**      | 28/10 → 03/11 | SQL KPI, chuẩn hoá dùng chung, xác thực     | Đăng nhập 3 vai; manager gọi API chỉ thấy chi nhánh mình        | UC01, UC02             | 13   |
| **S3**      | 04/11 → 10/11 | ETL file hoàn chỉnh                         | Nhập file thật qua 3 bước; nhập lại không nhân đôi             | UC06, UC07, UC08, UC09 | 13   |
| **S4**      | 11/11 → 17/11 | Dashboard                                   | **Demo giữa kỳ**: 6 KPI, 5 biểu đồ, lọc đa chiều, drill, lọc chéo | UC12, UC13, UC14       | 13   |
| **S5**      | 18/11 → 24/11 | Cảnh báo, xuất báo cáo, nguồn API            | Cảnh báo hiện trên dashboard; xuất Excel/PDF; đồng bộ API       | UC10, UC11, UC15, UC17 | 13   |
| **S6**      | 25/11 → 01/12 | Quản trị, tối ưu, deploy                    | Quản lý người dùng/chi nhánh/cảnh báo; URL công khai            | UC03, UC04, UC05, UC16 | 13   |
| **S7**      | 02/12 → 08/12 | Kiểm thử, tài liệu, UAT, vùng đệm           | Người dùng thật dùng thử theo tài liệu                          | —                      | 13   |
| **Ngày 50** | 09/12         | Nộp sản phẩm cuối                           | —                                                              | —                      | 1,5  |
|             |               |                                             |                                                                | **Tổng**               | **92,5** |

**Vì sao thứ tự này?** Kho dữ liệu (S1) quyết định mọi câu SQL nên phải chốt đầu tiên. ETL file (S3) đi trước dashboard (S4) vì điểm nghẽn thật của người dùng là làm sạch dữ liệu; dashboard vẫn phát triển được nhờ dữ liệu seed. Cảnh báo và xuất báo cáo (S5) **dùng lại** câu truy vấn của dashboard; nguồn API (S5) **dùng lại** Transform/Load của S3, chỉ thêm extractor. Mốc M4 (24/11) phủ đủ "Kết quả cần đạt" của đề, để S6–S7 còn chỗ cho quản trị, deploy và kiểm thử.

---

## 7. CHI TIẾT TỪNG SPRINT

Ký hiệu: ⏱ ước lượng · ✅ Xong khi · ⚠️ Bẫy · 📚 Học trước

### SPRINT 1 (21/10 → 27/10) — Phân tích v2 & kho dữ liệu hình sao

| Ngày | Ngày tháng | Thứ       | Công việc                                                                                  | Giờ |
| ---- | ---------- | --------- | ------------------------------------------------------------------------------------------ | --- |
| 1    | 21/10      | Thứ Tư    | **S1.1** Đọc hiểu phân tích v2, làm câu hỏi ôn tập ch.8                                     | 1,5 |
| 2    | 22/10      | Thứ Năm   | **S1.1** Gửi GVHD danh sách quyết định (`cau-hoi-gvhd.md`); hẹn phỏng vấn (tuỳ chọn)          | 1,5 |
| 3    | 23/10      | Thứ Sáu   | **S1.2** PostgreSQL + pool + `/api/health` kiểm tra DB                                     | 2   |
| 4    | 24/10      | Thứ Bảy   | **S1.3** Migration: `dim_*`, sinh `dim_date`, bảng vận hành                                | 2   |
| 5    | 25/10      | Chủ Nhật  | **S1.3** Migration: `fact_sales`, index, dữ liệu khởi tạo; ERD                             | 2   |
| 6    | 26/10      | Thứ Hai   | **S1.4** Script seed: chi nhánh, sản phẩm có giá vốn, khách, đơn có mùa vụ                 | 2   |
| 7    | 27/10      | Thứ Ba    | **S1.4** Seed batch insert < 60 s; **S1.5** Báo cáo Sprint 1                               | 2   |

#### S1.1 — Hoàn thiện phân tích v2 ⏱ 3h

- **Làm gì:** đọc 8 chương phân tích; làm câu hỏi ôn tập ch.8; gửi GVHD `docs/phan-tich/cau-hoi-gvhd.md` để xác nhận 7 quyết định phạm vi; (tuỳ chọn) phỏng vấn 1 người bán hàng theo `phieu-khao-sat.md`.
- ✅ Câu trả lời của GVHD ghi vào `07-…` §4; nếu GVHD đổi quyết định nào thì sửa `03-…` **trước** khi làm S1.3.

#### S1.2 — PostgreSQL + kết nối pool ⏱ 2h

- **Làm gì:** cài Postgres (native hoặc `docker-compose.yml` 1 service), DB `cn019`, `db/pool.ts` dùng `pg.Pool`; `/api/health` chạy thêm `SELECT 1`.
- **File:** `docker-compose.yml`, `apps/api/src/db/pool.ts`.
- ✅ `/api/health` trả `{"status":"ok","db":"ok"}`; tắt Postgres → `db:"down"`, HTTP 503, server không crash (FR-34).
- 📚 Vì sao dùng Pool thay vì mở kết nối mới mỗi request (chi phí TCP + xác thực).

#### S1.3 — Migration kho hình sao + ERD ⏱ 4h

- **Làm gì:** cài `node-pg-migrate`; migration tạo **toàn bộ** bảng §5 với PK/FK/CHECK/UNIQUE, cột sinh (`revenue`, `cost_amount`), index; sinh `dim_date` 2020–2030; chèn 5 chi nhánh, nguồn "Nhập file chung", quy tắc R1–R5; ERD (mermaid).
- **File:** `apps/api/migrations/001_star_schema.sql`, `docs/erd.md`.
- ✅ `migrate up` tạo đủ bảng; `migrate down` xoá sạch; `\d fact_sales` thấy cột sinh và `UNIQUE(source_id, order_code, line_no)`; chèn user `manager` không có chi nhánh → lỗi CHECK.
- ⚠️ `date_key` tính theo **giờ Việt Nam** (`(ordered_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`), không theo UTC.
- 📚 Star schema: fact vs dimension, grain, chiều suy biến (degenerate dimension), cột sinh `GENERATED ALWAYS AS … STORED`.

#### S1.4 — Script sinh dữ liệu giả ⏱ 3h

- **Làm gì:** `scripts/seed.ts` (`@faker-js/faker`, `faker.seed(42)`): ~200 sản phẩm / 8 danh mục, giá vốn 50–75 % giá bán; ~2.000 khách (có khách quay lại); 4 kênh; ~40.000 đơn / ~100.000 dòng trong 18 tháng; mùa vụ (Tết, cuối tuần, 11/11); mỗi vùng có sản phẩm "đặc trưng" bán chạy hơn (để biểu đồ theo vùng khác nhau); 5 % đơn hủy, 2 % đơn hoàn, 15 % khách lẻ; vài ngày doanh thu bất thường (để demo cảnh báo); insert theo lô 1.000 dòng.
- **File:** `apps/api/scripts/seed.ts`, script `npm run seed`.
- ✅ Chạy < 60 s; `count(*) fact_sales` ≈ 100.000; `--reset` cho kết quả tái lập.
- ⚠️ Insert từng dòng mất vài phút do round-trip → bắt buộc multi-row INSERT.

#### S1.5 — Báo cáo Sprint 1 ⏱ 1h — `docs/bao-cao/sprint-1.md` (mẫu §9).

### SPRINT 2 (28/10 → 03/11) — SQL KPI, chuẩn hoá dùng chung, xác thực

| Ngày | Ngày tháng | Thứ       | Công việc                                                                    | Giờ |
| ---- | ---------- | --------- | ---------------------------------------------------------------------------- | --- |
| 8    | 28/10      | Thứ Tư    | **S2.1** SQL KPI: doanh thu, lợi nhuận, số đơn, AOV, giữ chân khách           | 1,5 |
| 9    | 29/10      | Thứ Năm   | **S2.1** SQL theo vùng, top SP theo vùng, drill thời gian + EXPLAIN           | 1,5 |
| 10   | 30/10      | Thứ Sáu   | **S2.2** Schema Zod + hàm chuẩn hoá (tiền, ngày, trạng thái, kênh)            | 1,5 |
| 11   | 31/10      | Thứ Bảy   | **S2.2** Gợi ý ánh xạ + unit test; **S2.3** login/logout/me                   | 2,5 |
| 12   | 01/11      | Chủ Nhật  | **S2.3** requireAuth, requireRole, applyBranchScope, test phân quyền          | 3   |
| 13   | 02/11      | Thứ Hai   | **S2.4** Trang đăng nhập, ProtectedRoute, menu theo vai trò                   | 2   |
| 14   | 03/11      | Thứ Ba    | **S2.5** Báo cáo Sprint 2                                                     | 1   |

#### S2.1 — SQL KPI trên kho hình sao + EXPLAIN ⏱ 3h

- **Làm gì:** viết tay câu SQL cho 6 KPI (BR-01…BR-04, kỳ này + kỳ trước trong **một** câu bằng `FILTER`), xu hướng theo `year/quarter/month/day` (điền kỳ trống bằng `dim_date`), top sản phẩm theo vùng, doanh thu theo vùng → chi nhánh, theo danh mục → sản phẩm, theo kênh; chạy `EXPLAIN (ANALYZE, BUFFERS)` trên 100.000 dòng.
- **File:** `docs/sql/kpi-queries.sql`, `docs/sql/explain.md` (mốc "trước tối ưu").
- ✅ Kết quả trên bộ dữ liệu §3.5.2 khớp bảng kỳ vọng; mỗi câu có EXPLAIN và thời gian.
- 📚 Đọc execution plan: Seq Scan vs Index Scan, Hash Join; `COUNT(DISTINCT)` và tính không cộng được; `LEFT JOIN dim_date` để điền ngày trống.

#### S2.2 — Shared: schema + chuẩn hoá + gợi ý ánh xạ ⏱ 3h

- **Làm gì:** `packages/shared`: Zod `LoginInput`, `ImportRow` (14 trường §3.5.1), `DashboardFilters` (BR-18, BR-19); hàm chuẩn hoá **thuần** (không IO) cho tiền/số (BR-09), ngày (BR-10), trạng thái (BR-08), kênh (BR-12); `suggestMapping(columns)` theo §3.5.3.
- **File:** `packages/shared/src/**` + test Vitest.
- ✅ `apps/api` và `apps/web` import được `@cn019/shared`; test: `"1.200.000"` → 1200000, `"2.5"` → lỗi, serial `46316` → 21/10/2026, `"Đã hủy"` → `cancelled`, cột `"Mã chi nhánh"` → `branch_code` (AC-06.3, AC-07.1).

#### S2.3 — API xác thực, 3 vai trò, phạm vi chi nhánh ⏱ 4h

- **Làm gì:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`; bcrypt; JWT trong cookie `httpOnly; SameSite=Lax`; `requireAuth` **đọc lại user mỗi request**; `requireRole(min)` theo thứ bậc; middleware `applyBranchScope` (BR-15); rate limit đăng nhập; script `create-user`.
- **File:** `modules/auth/*`, `middlewares/auth.ts`, `middlewares/scope.ts`, `scripts/create-user.ts`, `tests/auth.test.ts`.
- ✅ AC-01.1…AC-01.4, AC-02.1, AC-13.4 (dùng endpoint thử); manager gọi route analyst → 403.
- ⚠️ Email không tồn tại vẫn chạy bcrypt với hash giả để thời gian phản hồi như nhau.

#### S2.4 — Trang đăng nhập + ProtectedRoute ⏱ 2h

- **File:** `apps/web/src/lib/api.ts` (`credentials: 'include'`), `features/auth/LoginPage.tsx`, `components/ProtectedRoute.tsx`, `components/RequireRole.tsx`.
- ✅ AC-01.5…AC-01.7; menu ẩn mục không có quyền; đăng xuất → `/login`.

#### S2.5 — Báo cáo Sprint 2 ⏱ 1h — `docs/bao-cao/sprint-2.md`

### SPRINT 3 (04/11 → 10/11) — ETL file hoàn chỉnh — **Mốc M2**

| Ngày | Ngày tháng | Thứ       | Công việc                                                              | Giờ |
| ---- | ---------- | --------- | ---------------------------------------------------------------------- | --- |
| 15   | 04/11      | Thứ Tư    | **S3.1** Upload (multer) + extractor CSV/XLSX + preview                | 1,5 |
| 16   | 05/11      | Thứ Năm   | **S3.1** Gợi ý ánh xạ trong preview, fixtures                          | 1,5 |
| 17   | 06/11      | Thứ Sáu   | **S3.2** Transformer + kiểm tra nhất quán theo đơn                      | 2   |
| 18   | 07/11      | Thứ Bảy   | **S3.2** Loader transaction + test idempotent/rollback                 | 2,5 |
| 19   | 08/11      | Chủ Nhật  | **S3.3** UI bước 1–2: chọn nguồn + file, bảng ánh xạ                    | 2,5 |
| 20   | 09/11      | Thứ Hai   | **S3.3** UI bước 3: kết quả, lịch sử, tải lỗi, file mẫu                 | 2   |
| 21   | 10/11      | Thứ Ba    | **S3.4** Báo cáo Sprint 3                                              | 1   |

#### S3.1 — Upload, Extract, preview, gợi ý ánh xạ ⏱ 3h

- **Làm gì:** `POST /api/imports/preview` (multer, BR-14) → `{ uploadId, columns, sampleRows, suggestedMapping }`; extractor CSV (papaparse, BOM, `,`/`;`) và XLSX (exceljs, sheet đầu); file tạm giữ 30 phút theo `uploadId`.
- **File:** `etl/extractors/csv.ts`, `etl/extractors/xlsx.ts`, `modules/imports/routes.ts`, `tests/fixtures/*`.
- ✅ AC-06.8, AC-06.10, AC-07.1.

#### S3.2 — Transform + Load (transaction, idempotent) ⏱ 4,5h

- **Làm gì:** `POST /api/imports { uploadId, sourceId, mapping }` → `runImport()`: map → transform/validate (BR-07…BR-12) → load trong **1 transaction** (upsert dim, xoá fact của các đơn có trong lô, insert multi-row) → ghi `import_jobs`, `import_errors` → trả kết quả (FR-12). `runImport()` nhận một **async iterable các dòng** để S5.3 dùng lại cho API. Khi server khởi động: lần nhập `running` cũ hơn 10 phút → `failed` (BR-13).
- **File:** `etl/mapper.ts`, `etl/transformer.ts`, `etl/loader.ts`, `etl/run-import.ts`, `tests/etl.int.test.ts`.
- ✅ AC-06.1…AC-06.7, AC-06.9.
- ⚠️ Đếm `new_orders`/`updated_orders` **trước** khi xoá (tra `(source_id, order_code)` đã tồn tại chưa).

#### S3.3 — Giao diện nhập 3 bước + lịch sử + file mẫu ⏱ 4,5h

- **Làm gì:** Bước 1 chọn nguồn + file (kèm "Tải file mẫu") → Bước 2 bảng ánh xạ 14 trường + 10 dòng xem trước **sau chuẩn hoá** → Bước 3 kết quả (Tổng/Hợp lệ/Lỗi/Đơn mới/Đơn cập nhật + bảng lỗi); trang lịch sử; tải CSV dòng lỗi.
- **File:** `features/imports/*`; API `GET /api/imports`, `GET /api/imports/:id`, `GET /api/imports/:id/errors.csv`, `GET /api/imports/template`.
- ✅ AC-07.2, AC-08.1, AC-09.1, AC-09.2.

#### S3.4 — Báo cáo Sprint 3 ⏱ 1h — `docs/bao-cao/sprint-3.md`

### SPRINT 4 (11/11 → 17/11) — Dashboard — **Mốc M3, demo giữa kỳ**

| Ngày | Ngày tháng | Thứ       | Công việc                                                                    | Giờ |
| ---- | ---------- | --------- | ---------------------------------------------------------------------------- | --- |
| 22   | 11/11      | Thứ Tư    | **S4.1** API summary (6 KPI + delta), trend (drill thời gian)                 | 2   |
| 23   | 12/11      | Thứ Năm   | **S4.1** API top-products, by-region, by-category, by-channel, catalog       | 2,5 |
| 24   | 13/11      | Thứ Sáu   | **S4.2** FilterBar (thời gian, chi nhánh, danh mục, kênh) đồng bộ URL         | 1,5 |
| 25   | 14/11      | Thứ Bảy   | **S4.2** KpiCards (định dạng tiền, delta %, điểm %)                          | 1,5 |
| 26   | 15/11      | Chủ Nhật  | **S4.3** TrendChart có drill-down + breadcrumb                               | 2   |
| 27   | 16/11      | Thứ Hai   | **S4.3** TopProducts theo vùng, RegionChart, CategoryChart, ChannelChart, lọc chéo | 2,5 |
| 28   | 17/11      | Thứ Ba    | **S4.4** Báo cáo Sprint 4 + video demo giữa kỳ                               | 1   |

#### S4.1 — API phân tích ⏱ 4,5h

- **Làm gì:** mọi endpoint nhận `from`, `to`, `branch[]`, `category[]`, `channel[]` qua `DashboardFilters` và đi qua `applyBranchScope`: `GET /api/analytics/summary`, `/trend?level=`, `/top-products?region=&limit=&by=`, `/by-region?region=` (không có `region` → theo vùng; có → theo chi nhánh của vùng đó), `/by-category?category=` (tương tự → sản phẩm), `/by-channel`; danh sách cho ô lọc: `GET /api/branches`, `GET /api/catalog/categories`, `GET /api/catalog/channels`.
- **File:** `modules/analytics/*`, `modules/catalog/*`, `docs/api.md`.
- ✅ AC-12.1…AC-12.4, AC-12.6, AC-13.1, AC-14.2 với bộ dữ liệu nhỏ tính tay.
- ⚠️ Không nối chuỗi vào SQL, kể cả `level` → whitelist (NFR-06).

#### S4.2 — Bộ lọc + thẻ KPI ⏱ 3h

- **File:** `DashboardPage.tsx`, `FilterBar.tsx`, `KpiCards.tsx`, `lib/filters.ts`, `lib/format.ts`.
- ✅ AC-13.2; delta đúng BR-05 ("Mới", "—", điểm %); tiền theo BR-21; manager không thấy ô chọn chi nhánh.

#### S4.3 — Biểu đồ, drill-down, lọc chéo ⏱ 4,5h

- **File:** `TrendChart.tsx`, `TopProducts.tsx`, `RegionChart.tsx`, `CategoryChart.tsx`, `ChannelChart.tsx`.
- ✅ AC-12.5, AC-13.3, AC-14.1, AC-14.3; trạng thái tải/rỗng/lỗi (FR-28).

#### S4.4 — Báo cáo Sprint 4 + demo giữa kỳ ⏱ 1h — `docs/bao-cao/sprint-4.md` kèm video.

### SPRINT 5 (18/11 → 24/11) — Cảnh báo, xuất báo cáo, nguồn API — **Mốc M4**

| Ngày | Ngày tháng | Thứ       | Công việc                                                                 | Giờ |
| ---- | ---------- | --------- | ------------------------------------------------------------------------- | --- |
| 29   | 18/11      | Thứ Tư    | **S5.1** Hàm đánh giá quy tắc (a), (b) + `GET /api/alerts` + test          | 2   |
| 30   | 19/11      | Thứ Năm   | **S5.1** Quy tắc z-score (c); khối AlertList trên dashboard                | 1,5 |
| 31   | 20/11      | Thứ Sáu   | **S5.2** Xuất Excel 5 sheet (exceljs)                                      | 2   |
| 32   | 21/11      | Thứ Bảy   | **S5.2** Trang `/report` in A4 → PDF                                       | 1,5 |
| 33   | 22/11      | Chủ Nhật  | **S5.3** Mock shop API; quản lý nguồn (CRUD, ẩn key, kiểm tra kết nối)     | 2,5 |
| 34   | 23/11      | Thứ Hai   | **S5.3** Extractor API phân trang + tăng dần + khoá; nút "Đồng bộ ngay"    | 2,5 |
| 35   | 24/11      | Thứ Ba    | **S5.4** Báo cáo Sprint 5                                                  | 1   |

#### S5.1 — Cảnh báo chỉ số bất thường ⏱ 3,5h

- **Làm gì:** `alerts/evaluate.ts`: đọc `alert_rules` đang bật, dùng lại `analyticsService.summary()` cho kiểu (a)/(b); kiểu (c) bằng window function (`AVG`/`STDDEV_SAMP … ROWS BETWEEN 28 PRECEDING AND 1 PRECEDING`); `GET /api/alerts` (manager+, có phạm vi chi nhánh); `AlertList.tsx` ở đầu dashboard (đỏ = critical, vàng = warning).
- ✅ AC-15.1…AC-15.4.
- 📚 Độ lệch chuẩn, z-score; vì sao so với **28 ngày trước** (4 tuần đủ chu kỳ cuối tuần) và không gồm chính ngày đang xét.

#### S5.2 — Xuất báo cáo Excel/PDF ⏱ 3,5h

- **Làm gì:** `GET /api/reports/excel?…` (dùng lại các hàm analytics, exceljs, định dạng số tiền, tên file `bao-cao_2026-10-01_2026-10-21.xlsx`); `features/report/ReportPage.tsx` với `@media print` (A4, ẩn sidebar, biểu đồ kích thước cố định) và nút "Xuất PDF" → `window.print()`.
- ✅ AC-17.1…AC-17.4.

#### S5.3 — Nguồn REST API + đồng bộ tăng dần ⏱ 5h

- **Làm gì:** `apps/mock-shop-api` (`GET /orders?updated_since=&page=`, header `x-api-key`, 20 bản ghi/trang, `POST /orders/simulate` thêm đơn mới để demo); `GET/POST/PATCH /api/sources` (key không trả ra); `POST /api/sources/:id/test`; `POST /api/sources/:id/sync`: `pg_try_advisory_lock` → `etl/extractors/api.ts` (async generator đọc từng trang) → **`runImport()` của S3.2** → cập nhật `last_synced_at` (BR-16).
- **File:** `apps/mock-shop-api/src/server.ts`, `etl/extractors/api.ts`, `modules/sources/*`, `features/sources/SourcesPage.tsx`.
- ✅ AC-10.1…AC-10.3, AC-11.1…AC-11.4.
- ⚠️ `last_synced_at` = thời điểm **bắt đầu** lần đồng bộ (giải thích ở ch.2 QT-02).

#### S5.4 — Báo cáo Sprint 5 ⏱ 1h — `docs/bao-cao/sprint-5.md`

### SPRINT 6 (25/11 → 01/12) — Quản trị, tối ưu, deploy — **Mốc M5**

| Ngày | Ngày tháng | Thứ       | Công việc                                                                   | Giờ |
| ---- | ---------- | --------- | --------------------------------------------------------------------------- | --- |
| 36   | 25/11      | Thứ Tư    | **S6.1** API + trang Người dùng (gán chi nhánh cho manager)                  | 2   |
| 37   | 26/11      | Thứ Năm   | **S6.1** Trang Chi nhánh; đổi mật khẩu                                       | 2   |
| 38   | 27/11      | Thứ Sáu   | **S6.2** Trang Quy tắc cảnh báo                                             | 1,5 |
| 39   | 28/11      | Thứ Bảy   | **S6.3** EXPLAIN lại, thêm/bỏ index, đo NFR-01                              | 2   |
| 40   | 29/11      | Chủ Nhật  | **S6.4** helmet, CORS, build/start, biến môi trường production              | 2   |
| 41   | 30/11      | Thứ Hai   | **S6.4** Deploy DB + API + web + mock API; seed demo                        | 2,5 |
| 42   | 01/12      | Thứ Ba    | **S6.5** Kiểm tra từ điện thoại 4G; báo cáo Sprint 6                         | 1   |

#### S6.1 — Quản lý người dùng, chi nhánh, đổi mật khẩu ⏱ 4h

- **Làm gì:** `GET/POST /api/users`, `PATCH /api/users/:id`, `POST /api/users/:id/reset-password`, `PATCH /api/auth/password`; `GET/POST /api/branches`, `PATCH /api/branches/:id`; trang Người dùng, Chi nhánh (admin); trang Đổi mật khẩu.
- ✅ AC-03.1, AC-03.2, AC-04.1…AC-04.4, AC-05.1, AC-05.2.

#### S6.2 — Cấu hình quy tắc cảnh báo ⏱ 1,5h

- **Làm gì:** `GET/PATCH /api/alert-rules` (admin), `AlertRulesPage.tsx` (bật/tắt, ngưỡng, mức).
- ✅ AC-16.1, AC-16.2.

#### S6.3 — Tối ưu truy vấn tổng hợp ⏱ 2h

- **Làm gì:** chạy lại EXPLAIN so với mốc S2.1; thử index ghép/`INCLUDE`, so sánh trước/sau; seed 300.000 dòng để thử tải; bật `compression`.
- **File:** `docs/sql/explain.md` (thêm cột "sau tối ưu").
- ✅ Bảng so sánh trước/sau; đạt NFR-01.

#### S6.4 — Chuẩn bị production + deploy ⏱ 4,5h

- **Làm gì:** `helmet`, CORS chỉ cho domain web, log không chứa mật khẩu/API key (NFR-14), `tsc` build API, `vite build` web; Postgres managed, chạy migration, deploy API + web + mock API; cookie `Secure` (và `SameSite=None` nếu FE/BE khác domain); tạo user demo 3 vai.
- ✅ `npm run build && npm start` chạy bằng JS đã build; lỗi 500 không trả stack trace; mở URL công khai đăng nhập và xem dashboard được.
- ⚠️ Free tier có thể "ngủ" → lần đầu mở chậm; ghi trong hướng dẫn.

#### S6.5 — Báo cáo Sprint 6 ⏱ 1h — `docs/bao-cao/sprint-6.md`

### SPRINT 7 (02/12 → 08/12) — Kiểm thử, tài liệu, UAT — **Mốc M6**

| Ngày | Ngày tháng | Thứ       | Công việc                                                        | Giờ |
| ---- | ---------- | --------- | ---------------------------------------------------------------- | --- |
| 43   | 02/12      | Thứ Tư    | **S7.1** Bổ sung test theo ma trận; decision table nhập dữ liệu   | 1,5 |
| 44   | 03/12      | Thứ Năm   | **S7.1** Test phân quyền theo bảng API; coverage                  | 1,5 |
| 45   | 04/12      | Thứ Sáu   | **S7.2** Hướng dẫn sử dụng + triển khai                          | 2,5 |
| 46   | 05/12      | Thứ Bảy   | **S7.3** UAT 2 người dùng, sửa lỗi chặn                          | 2   |
| 47   | 06/12      | Chủ Nhật  | **S7.4** Báo cáo tổng kết + slide                                | 2,5 |
| 48   | 07/12      | Thứ Hai   | **S7.5** Vùng đệm                                                | 1,5 |
| 49   | 08/12      | Thứ Ba    | **S7.5** Vùng đệm: rà soát cuối, quay video demo                  | 1,5 |

#### S7.1 — Hoàn thiện kiểm thử ⏱ 3h

- **Làm gì:** test còn thiếu theo ma trận truy vết; decision table cho nhập dữ liệu (định dạng ngày × số tiền × chi nhánh lạ × đơn mâu thuẫn × trạng thái); test phân quyền theo bảng §5.4.2 (gồm phạm vi chi nhánh).
- **File:** `apps/api/tests/*`, `docs/test-cases.md`.
- ✅ `npm test` xanh; NFR-10.

#### S7.2 — Tài liệu hướng dẫn ⏱ 2,5h

- **File:** `docs/huong-dan-su-dung.md` (có ảnh: đăng nhập, chuẩn bị file, nhập & sửa lỗi, đọc biểu đồ, drill-down, cảnh báo, xuất báo cáo, đồng bộ API, câu hỏi thường gặp), `docs/huong-dan-trien-khai.md`.
- ✅ Người không học IT tự nhập được file mẫu và trả lời đúng "sản phẩm nào bán chạy nhất ở Miền Nam tháng trước?" (NFR-08, NFR-12).

#### S7.3 — UAT + sửa lỗi ⏱ 2h

- **Làm gì:** 2 người dùng (1 đóng vai giám đốc, 1 đóng vai quản lý chi nhánh) làm theo kịch bản 6 câu hỏi kinh doanh (ch.2 §2.4); ghi góp ý; sửa lỗi chặn sử dụng.
- **File:** `docs/uat.md`. ✅ ≥ 2 phiếu; lỗi "chặn sử dụng" đã sửa và deploy lại.

#### S7.4 — Báo cáo tổng kết + slide ⏱ 2,5h

- **File:** `docs/bao-cao/tong-ket.md`, báo cáo Word theo mẫu trường, slide bảo vệ.
- ✅ Có: kiến trúc, star schema/ERD, luồng ETL, hiệu năng trước/sau, kết quả test, UAT, hạn chế & hướng mở rộng (§3.1.7 của phân tích).

#### S7.5 — Vùng đệm ⏱ 3h

Dùng cho lỗi tồn đọng. Nếu không cần: quay video demo hoàn chỉnh, rà soát báo cáo.

### NGÀY 50 (09/12, Thứ Tư) — **S8.1** Nộp sản phẩm cuối, trình bày thử ⏱ 1,5h

---

## 8. QUẢN LÝ RỦI RO

| Rủi ro                               | Dấu hiệu                          | Ứng phó                                                                         |
| ------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------- |
| Học công nghệ mới chậm hơn dự kiến   | Cuối tuần lệch > 3 giờ            | Dùng vùng đệm S7.5; nếu vẫn thiếu, cắt theo thứ tự bên dưới                      |
| ETL (S3) vượt thời gian              | Cuối S3 chưa đạt M2               | Dời phần lịch sử/file mẫu của S3.3 sang S4; dashboard dùng dữ liệu seed          |
| GVHD không đồng ý một quyết định phạm vi | Phản hồi câu hỏi ở S1.1      | Sửa `03-…` trước; schema chưa có ở S1.1 nên chi phí đổi thấp                    |
| Không có người dùng thật cho UAT     | Hết S6 chưa hẹn được              | Bạn bè đóng vai theo kịch bản, dữ liệu seed                                     |
| Free tier đổi chính sách             | Deploy (S6.4) lỗi                 | Phương án thay thế ghi trong `huong-dan-trien-khai.md`; demo bằng máy cá nhân    |
| Laptop 8 GB chậm                     | Swap khi chạy Postgres + 3 server | Postgres native; chỉ bật mock API khi cần                                       |

**Thứ tự cắt khi trễ** (cắt từ trên xuống; **không bao giờ cắt Must**):

1. S6.2 giao diện cấu hình cảnh báo → admin sửa bằng SQL/seed (tiết kiệm 1,5 giờ).
2. Quy tắc z-score (FR-30) → chỉ giữ quy tắc (a), (b) (tiết kiệm 1 giờ).
3. Giao diện trang Chi nhánh, Đổi mật khẩu → giữ API + seed (tiết kiệm 2 giờ).
4. File mẫu `.xlsx` (UC08) → đưa file mẫu tĩnh vào `docs/` (tiết kiệm 0,5 giờ).
5. S6.3 → chỉ thêm index thiếu, bỏ thử 300.000 dòng (tiết kiệm 1 giờ).

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

> Tick `[x]` khi đạt **toàn bộ** tiêu chí ✅. Ghi ngày hoàn thành và giờ thực tế. Cột "Mã v1" để đối chiếu với các commit/báo cáo cũ.

| Bước     | Nội dung                                          | Mã v1      | Ước lượng | Thực tế | Ngày xong  |
| -------- | ------------------------------------------------- | ---------- | --------- | ------- | ---------- |
| [x] S0.1 | Khởi tạo monorepo                                 | B1.1       | 3h        |         | 2026-10-19 |
| [x] S0.2 | Khung API Express                                 | B1.2       | 3h        |         | 2026-10-19 |
| [x] S0.3 | Khung web React                                   | B1.3       | 2h        |         | 2026-10-19 |
| [ ] S1.1 | Hoàn thiện phân tích v2, gửi GVHD                 | S1.1       | 3h        |         |            |
| [ ] S1.2 | PostgreSQL + kết nối pool                         | S1.2       | 2h        |         |            |
| [ ] S1.3 | Migration kho hình sao + ERD                      | S1.3       | 4h        |         |            |
| [ ] S1.4 | Script sinh ~100.000 dòng dữ liệu giả             | S1.4       | 3h        |         |            |
| [ ] S1.5 | Báo cáo Sprint 1                                  | S1.5       | 1h        |         |            |
| [ ] S2.1 | SQL KPI trên kho hình sao + EXPLAIN               | S2.1       | 3h        |         |            |
| [ ] S2.2 | Shared: schema + chuẩn hoá + gợi ý ánh xạ         | S2.2       | 3h        |         |            |
| [ ] S2.3 | API xác thực, 3 vai trò, phạm vi chi nhánh        | S2.3       | 4h        |         |            |
| [ ] S2.4 | Trang đăng nhập + ProtectedRoute                  | S2.4       | 2h        |         |            |
| [ ] S2.5 | Báo cáo Sprint 2                                  | S2.6       | 1h        |         |            |
| [ ] S3.1 | Upload, Extract, preview, gợi ý ánh xạ            | S2.5, S3.1 | 3h        |         |            |
| [ ] S3.2 | Transform + Load (transaction, idempotent)        | S3.1, S3.2 | 4,5h      |         |            |
| [ ] S3.3 | Giao diện nhập 3 bước + lịch sử + file mẫu        | S3.3       | 4,5h      |         |            |
| [ ] S3.4 | Báo cáo Sprint 3                                  | S3.5       | 1h        |         |            |
| [ ] S4.1 | API phân tích (6 KPI, drill, theo vùng)           | S4.1       | 4,5h      |         |            |
| [ ] S4.2 | Bộ lọc đa chiều + thẻ KPI                         | S4.2       | 3h        |         |            |
| [ ] S4.3 | Biểu đồ, drill-down, lọc chéo                     | S4.3, S4.4 | 4,5h      |         |            |
| [ ] S4.4 | Báo cáo Sprint 4 + demo giữa kỳ                   | S4.5       | 1h        |         |            |
| [ ] S5.1 | Cảnh báo chỉ số bất thường                        | —          | 3,5h      |         |            |
| [ ] S5.2 | Xuất báo cáo Excel/PDF                            | S5.5       | 3,5h      |         |            |
| [ ] S5.3 | Nguồn REST API + đồng bộ tăng dần                 | S5.4, S6.1 | 5h        |         |            |
| [ ] S5.4 | Báo cáo Sprint 5                                  | S5.7       | 1h        |         |            |
| [ ] S6.1 | Quản lý người dùng, chi nhánh, đổi mật khẩu       | S6.3       | 4h        |         |            |
| [ ] S6.2 | Cấu hình quy tắc cảnh báo                         | —          | 1,5h      |         |            |
| [ ] S6.3 | Tối ưu truy vấn tổng hợp                          | S5.6       | 2h        |         |            |
| [ ] S6.4 | Chuẩn bị production + deploy                      | S6.4, S6.5 | 4,5h      |         |            |
| [ ] S6.5 | Báo cáo Sprint 6                                  | S6.6       | 1h        |         |            |
| [ ] S7.1 | Hoàn thiện kiểm thử                               | S7.1       | 3h        |         |            |
| [ ] S7.2 | Tài liệu hướng dẫn sử dụng + triển khai           | S7.2, S7.3 | 2,5h      |         |            |
| [ ] S7.3 | UAT + sửa lỗi                                     | S7.4       | 2h        |         |            |
| [ ] S7.4 | Báo cáo tổng kết + slide                          | S7.5       | 2,5h      |         |            |
| [ ] S7.5 | Vùng đệm                                          | S7.6       | 3h        |         |            |
| [ ] S8.1 | Nộp sản phẩm cuối, trình bày thử                  | S8.1       | 1,5h      |         |            |

**Tổng:** đã xong trước kế hoạch 8 giờ (S0) · kế hoạch 50 ngày **92,5 giờ** = 7 × 13 giờ + 1,5 giờ ngày nộp.

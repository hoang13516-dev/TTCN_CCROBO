# CN-019 - Dashboard phân tích dữ liệu bán hàng

Đồ án chuyên ngành: web BI cho chuỗi bán lẻ nhiều chi nhánh. Hệ thống gom dữ liệu bán hàng từ file CSV/Excel và REST API, nạp vào kho dữ liệu hình sao, rồi hiển thị dashboard KPI có lọc, drill-down và cảnh báo.

Phạm vi và yêu cầu chi tiết nằm trong [`docs/phan-tich/`](docs/phan-tich/README.md), không lặp lại ở đây.

## Trạng thái hiện tại

Dự án đang ở **Sprint 1** (nền tảng dữ liệu). Hiện mới có:

- API Express với endpoint `GET /api/health`, kiểm tra cấu hình `.env` khi khởi động.
- Web React với layout (sidebar) và 3 trang khung: Dashboard, Nhập dữ liệu, Nguồn dữ liệu.

Chưa có: CSDL, đăng nhập, ETL, dashboard thật. Tiến độ theo bước xem ở [`ke-hoach.md`](ke-hoach.md).

## Tài liệu

| Tài liệu                                      | Nội dung                                                              |
| --------------------------------------------- | --------------------------------------------------------------------- |
| [`docs/phan-tich/`](docs/phan-tich/README.md) | Phân tích yêu cầu (ch.1-7) và kiến trúc, công nghệ, định hướng (ch.8) |
| [`docs/adr/`](docs/adr/)                      | Lý do các quyết định kiến trúc                                        |
| [`ke-hoach.md`](ke-hoach.md)                  | Lịch sprint, các bước, giờ, bảng tiến độ                              |
| [`CLAUDE.md`](CLAUDE.md)                      | Quy tắc làm việc trong repo và checklist trước khi commit             |

## Cấu trúc

Monorepo dùng npm workspaces:

```
apps/
  api/          Express + TypeScript: API, ETL, phân tích (@cn019/api)
  web/          React + Vite + TypeScript: giao diện dashboard (@cn019/web)
packages/
  shared/       Schema Zod và hàm chuẩn hoá dùng chung cho FE và BE (@cn019/shared)
docs/           Tài liệu phân tích và ADR
scripts/        Script kiểm tra nhất quán tài liệu (check-docs.mjs)
```

`apps/mock-shop-api` (REST API giả lập website bán hàng để demo đồng bộ) sẽ thêm ở Sprint 5.

## Yêu cầu

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 15 (từ bước S1.2)

## Cài đặt

```bash
npm install                # cài dependency cho cả monorepo; cũng cài git hook pre-commit
cp .env.example .env       # rồi sửa DATABASE_URL và JWT_SECRET
```

Lưu ý:

- File `.env` đặt ở **gốc repo**, không đặt trong `apps/api`. API đọc file này khi khởi động.
- `JWT_SECRET` phải dài ít nhất 32 ký tự. Nếu thiếu `.env` hoặc sai giá trị, API dừng ngay và in lỗi cụ thể. Đây là chủ ý: lỗi cấu hình hiện ra lúc khởi động thay vì lỗi lạ khi đang chạy.
- `.env` đã nằm trong `.gitignore`. Không commit file này.

## Chạy môi trường phát triển

Mở hai terminal ở gốc repo:

```bash
npm run dev -w @cn019/api   # API tại http://localhost:4000/api/health
npm run dev -w @cn019/web   # Web tại http://localhost:5173
```

Vite (web) chuyển tiếp mọi request `/api/*` sang cổng 4000, nên trình duyệt chỉ thấy một origin và không gặp lỗi CORS khi phát triển.

## Lệnh chính

```bash
npm run check         # kiểm tra tài liệu + Prettier + ESLint (hook pre-commit tự chạy)
npm run check:docs    # chỉ kiểm tra nhất quán tài liệu
npm run lint          # ESLint toàn repo
npm run format        # Prettier tự sửa định dạng
npm run format:check  # Prettier chỉ kiểm tra

npm run typecheck -w @cn019/api    # kiểm tra kiểu TypeScript của API
npm run build -w @cn019/api        # build API ra dist/
npm run typecheck -w @cn019/web    # kiểm tra kiểu TypeScript của web
npm run build -w @cn019/web        # build web (kiểm tra kiểu rồi vite build)
```

Hook pre-commit chạy `npm run check`. Nếu commit bị chặn, sửa lỗi được báo rồi commit lại. Không dùng `--no-verify` để bỏ qua.

## Quy ước commit

Theo tiền tố `feat(api):`, `fix(web):`, `docs:`, `test:`, `chore:`. Chi tiết và các quy tắc khác xem [`CLAUDE.md`](CLAUDE.md).

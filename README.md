# CN-019 — Dashboard phân tích dữ liệu bán hàng

Đồ án chuyên ngành. Web BI cho chuỗi bán lẻ nhiều chi nhánh: gom dữ liệu bán hàng từ **file CSV/Excel** và **REST API** (ETL), nạp vào kho dữ liệu **hình sao**, hiển thị dashboard KPI (doanh thu, lợi nhuận, AOV, tỷ lệ giữ chân khách, sản phẩm bán chạy theo vùng/thời gian) có lọc đa chiều, drill-down, lọc chéo, cảnh báo bất thường và xuất báo cáo Excel/PDF; phân quyền xem báo cáo theo chi nhánh.

## Tài liệu

| Tài liệu                                      | Nội dung                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| [`docs/phan-tich/`](docs/phan-tich/README.md) | Phân tích (ch.1–7) và kiến trúc, công nghệ, định hướng phát triển (ch.8)   |
| [`docs/adr/`](docs/adr/)                      | Lý do các quyết định kiến trúc                                             |
| [`ke-hoach.md`](ke-hoach.md)                  | Lịch 7 sprint, bước, giờ, bảng tiến độ                                     |
| [`CLAUDE.md`](CLAUDE.md)                      | Quy tắc làm việc: nơi định nghĩa từng thông tin, kiểm tra trước khi commit |

## Cấu trúc monorepo (npm workspaces)

- `apps/api` — Express + TypeScript (backend, ETL, phân tích)
- `apps/web` — React + Vite + TypeScript (dashboard)
- `packages/shared` — schema Zod và hàm chuẩn hoá dùng chung FE/BE
- `apps/mock-shop-api` — REST API giả lập website bán hàng để demo đồng bộ (thêm ở S5.3)

## Yêu cầu

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 15 (từ S1.2)

## Cài đặt

```bash
npm install
cp .env.example .env   # sửa DATABASE_URL, JWT_SECRET
```

## Lệnh chính

```bash
npm run check         # kiểm tra nhất quán tài liệu + Prettier + ESLint (tự chạy trước mỗi commit)
npm run check:docs    # chỉ kiểm tra nhất quán tài liệu
npm run lint          # ESLint toàn repo
npm run format:check  # Prettier kiểm tra định dạng
npm run format        # Prettier tự sửa định dạng
npm run dev -w @cn019/api   # chạy API (http://localhost:4000/api/health)
npm run dev -w @cn019/web   # chạy web (http://localhost:5173)
```

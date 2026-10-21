# CN-019 — Dashboard phân tích dữ liệu bán hàng

Đồ án chuyên ngành. Web BI cho chuỗi bán lẻ nhiều chi nhánh: gom dữ liệu bán hàng từ **file CSV/Excel** và **REST API** (ETL), nạp vào kho dữ liệu **hình sao**, hiển thị dashboard KPI (doanh thu, lợi nhuận, AOV, tỷ lệ giữ chân khách, sản phẩm bán chạy theo vùng/thời gian) có lọc đa chiều, drill-down, lọc chéo, cảnh báo bất thường và xuất báo cáo Excel/PDF; phân quyền xem báo cáo theo chi nhánh.

## Tài liệu

| Tài liệu                                      | Nội dung                                                           |
| --------------------------------------------- | ------------------------------------------------------------------ |
| [`ke-hoach.md`](ke-hoach.md)                  | Kế hoạch 7 sprint, kiến trúc, mô hình dữ liệu, bảng tiến độ        |
| [`docs/phan-tich/`](docs/phan-tich/README.md) | Phân tích yêu cầu: FR, NFR, quy tắc nghiệp vụ, use case, AC, sơ đồ |
| [`docs/adr/`](docs/adr/)                      | Quyết định kiến trúc và lý do                                      |

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
npm run lint          # ESLint toàn repo
npm run format:check  # Prettier kiểm tra định dạng
npm run format        # Prettier tự sửa định dạng
npm run dev -w @cn019/api   # chạy API (http://localhost:4000/api/health)
npm run dev -w @cn019/web   # chạy web (http://localhost:5173)
```

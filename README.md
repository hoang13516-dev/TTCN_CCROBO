# CN-019 — Dashboard phân tích dữ liệu bán hàng

Đồ án chuyên ngành. Monorepo npm workspaces:

- `apps/api` — Express + TypeScript (backend)
- `apps/web` — React + Vite + TypeScript (frontend)
- `packages/shared` — Zod schema dùng chung FE/BE

## Yêu cầu

- Node.js >= 20
- npm >= 10

## Cài đặt

```bash
npm install
```

## Lệnh chính

```bash
npm run lint          # ESLint toàn repo
npm run format:check  # Prettier kiểm tra định dạng
npm run format        # Prettier tự sửa định dạng
```

Chi tiết kế hoạch và tiến độ: xem `ke-hoach.md`.

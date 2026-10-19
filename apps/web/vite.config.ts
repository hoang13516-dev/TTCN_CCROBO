import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server: frontend chạy ở cổng 5173.
// Mọi request /api/* được Vite chuyển tiếp (proxy) sang API ở cổng 4000.
// Nhờ vậy trình duyệt thấy cùng một origin → không bị lỗi CORS khi phát triển.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});

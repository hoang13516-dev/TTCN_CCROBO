import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

/**
 * Schema biến môi trường của API.
 * Mọi biến đều được kiểm tra khi khởi động: thiếu hoặc sai kiểu → server dừng ngay,
 * thay vì chạy được một lúc rồi lỗi ở chỗ không liên quan (fail fast).
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string({ error: "DATABASE_URL là bắt buộc (xem .env.example)" })
    .min(1, "DATABASE_URL không được để trống"),
  // Khoá ký JWT (S2.2). Ngắn quá thì dễ bị dò ngược bằng brute force.
  JWT_SECRET: z
    .string({ error: "JWT_SECRET là bắt buộc (xem .env.example)" })
    .min(32, "JWT_SECRET phải dài ít nhất 32 ký tự"),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Nạp file `.env` ở gốc monorepo.
 * Tách thành hàm riêng (không chạy khi import) để test được loadEnv() với env giả.
 */
export function loadDotenvFile(): void {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/config → src → api → apps → gốc repo
  loadDotenv({ path: path.resolve(here, "../../../../.env"), quiet: true });
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${lines.join("\n")}`);
  }
  return parsed.data;
}

import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";

/**
 * Tạo ứng dụng Express nhưng KHÔNG mở cổng.
 * Tách khỏi server.ts để Supertest import app và test trực tiếp (khi bắt đầu viết test API) mà không bị chiếm port.
 */
export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

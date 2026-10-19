import type { NextFunction, Request, Response } from "express";

/** Bắt mọi route không tồn tại, trả JSON thống nhất thay vì trang HTML mặc định của Express. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Không tìm thấy ${req.method} ${req.path}` },
  });
}

/**
 * Xử lý lỗi tập trung. Quy tắc bảo mật: chi tiết lỗi (stack trace) chỉ ghi vào log phía server,
 * client chỉ nhận thông báo chung cho lỗi 5xx.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Lỗi 4xx do chính Express tạo (ví dụ JSON body sai cú pháp) có thuộc tính `status`.
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
      ? err.status
      : 500;

  if (status >= 500) {
    console.error(err);
    res.status(500).json({ error: { code: "INTERNAL", message: "Lỗi máy chủ" } });
    return;
  }

  res.status(status).json({ error: { code: "BAD_REQUEST", message: "Yêu cầu không hợp lệ" } });
}

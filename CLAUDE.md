# CLAUDE.md - Quy tắc làm việc trong repo CN-019

Đồ án chuyên ngành của Nguyễn Minh Hoàng (1 sinh viên). Mục tiêu: **phiên bản đơn giản nhất đủ "Kết quả cần đạt" của đề**, hiểu nghiệp vụ, mở rộng được sau. Người dùng đang học: khi viết code hay tài liệu, giải thích _vì sao_, không chỉ đưa kết quả.

## 1. Hỏi trước khi quyết định

- Mọi thay đổi về **phạm vi, quy tắc nghiệp vụ, kiến trúc, công nghệ, kế hoạch**: hỏi người dùng (đưa phương án + khuyến nghị) **trước** khi sửa.
- Chi tiết cài đặt nằm gọn trong một bước đã được định nghĩa thì tự làm, không cần hỏi.

## 2. Cấu trúc repo

Bắt đầu tối thiểu, chỉ tách file khi một file đã quá dài. Mỗi thông tin chỉ có một nơi định nghĩa, nơi khác trỏ tới.

| File                | Nội dung                                                          |
| ------------------- | ----------------------------------------------------------------- |
| `de-bai.md`         | Nguyên văn đề bài. Không sửa nội dung; mọi phân tích truy về đây. |
| `docs/phan-tich.md` | Tài liệu phân tích.                                               |

Khi tách thêm file: thêm một dòng vào bảng trên, ghi rõ file đó định nghĩa thông tin gì.

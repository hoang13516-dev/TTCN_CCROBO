# KẾ HOẠCH THỰC HIỆN - CN-019 DASHBOARD PHÂN TÍCH DỮ LIỆU BÁN HÀNG

> Đồ án chuyên ngành - GVHD: ThS. Dương Văn Đeo (GV001) - Thực hiện: Nguyễn Minh Hoàng (nhóm CCROBO, 1 sinh viên)
> Ràng buộc (ch.1 §1.5.3, C1): **50 ngày, 21/10 → 09/12/2026** · **~13 giờ/tuần** · phạm vi **Must + Should**
> Kế hoạch chỉ ghi những nhiệm vụ đã được giao. Phần chưa được giao hoặc chưa cập nhật **để trống**, thêm khi có nhiệm vụ thật.

---

## 0. HƯỚNG DẪN CHO MỖI PHIÊN LÀM VIỆC

1. Tìm **bước đầu tiên chưa tick** ở [§4](#4-bảng-theo-dõi-tiến-độ). Mỗi lần làm **một bước**. Đầu sprint, đọc báo cáo sprint gần nhất trong `bao-cao/` (mục "Đánh giá và cải tiến" và "Chưa hoàn thành") để biết cần cải tiến gì và việc nào chuyển sang.
2. Mỗi bước ghi: use case (UC) và yêu cầu (FR/NFR) nó phục vụ (nếu có), cách biết là xong, số giờ (nếu đã ước lượng). Nội dung AC: `docs/phan-tich/06-dac-ta-use-case.md`. Cách xây (lớp, thư mục, bảng dữ liệu): `docs/phan-tich/08-kien-truc-va-dinh-huong.md`.
3. Chỉ tick khi người thực hiện đã tự kiểm chứng bước đó (bằng test hoặc thao tác thật). Không ghi "đạt" hoặc "pass" thay cho người kiểm chứng.
4. **Kế hoạch không định nghĩa yêu cầu.** Muốn đổi phạm vi, quy tắc, kiến trúc: sửa `docs/phan-tich/` (và ADR nếu là quyết định kiến trúc) trước, rồi mới sửa kế hoạch.
5. Trước mỗi commit: `npm run check` (hook pre-commit tự chạy); đọc checklist trong `CLAUDE.md`.
6. Commit theo quy ước `feat(api): …`, `fix(web): …`, `docs: …`, `test: …`; tick bảng tiến độ, ghi giờ thực tế.
7. Cuối mỗi sprint (Thứ Ba): làm Sprint Review và Retrospective, ghi vào báo cáo sprint theo mẫu §3.

**Quy trình mỗi sprint (Scrum rút gọn cho 1 người).** Dự án chỉ có một người nên mỗi sự kiện được thu nhỏ và nằm trong thời gian làm việc của sprint, không thêm bước hay thêm giờ vào bảng. Product Backlog là các FR/NFR đã xếp Must/Should ở `docs/phan-tich/03-…`; Sprint Backlog là bảng bước của sprint ở §2.

| Sự kiện              | Khi nào                     | Làm gì                                                                                                                   | Ghi ở đâu                                 |
| -------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Sprint Planning      | Đầu sprint, ~15-30 phút     | Chọn bước từ Product Backlog theo thứ tự phụ thuộc (ch.4 §4.4) và MoSCoW; đọc báo cáo sprint trước; viết Sprint Goal 1 câu | Mục "Mục tiêu sprint" của báo cáo sprint  |
| Daily Scrum          | Đầu mỗi phiên làm, ~15 phút | Tự trả lời 3 câu: hôm qua xong gì, hôm nay làm bước nào, đang vướng gì; vướng quá 1 phiên thì ghi để hỏi GVHD            | Một dòng trong ghi chú phiên (ngoài repo) |
| Sprint Review        | Cuối sprint                 | Chạy thử phần đã xong; gửi GVHD ảnh chụp/video hoặc trình bày nếu gặp                                                    | Mục "Đã hoàn thành" + "Câu hỏi cho GVHD"  |
| Sprint Retrospective | Cuối sprint, sau Review     | Tự đánh giá: làm tốt gì, chưa tốt gì, một việc cụ thể cải tiến cho sprint sau                                            | Mục "Đánh giá và cải tiến"                |

Điều chỉnh Product Backlog (đổi phạm vi, đổi ưu tiên) sau Review/Retrospective tuân theo mục 4 ở trên: sửa `docs/phan-tich/` trước, rồi mới sửa kế hoạch. Sprint Review là cơ hội phản hồi duy nhất từ bên ngoài, nên ưu tiên gửi GVHD sớm.

## 1. CÁC MỐC

| Ngày  | Nội dung                                                     |
| ----- | ------------------------------------------------------------ |
| 01/11 | Hạn nộp nhiệm vụ tuần 2/3 của GVHD (xem S2.1)                |
| 09/12 | Ngày 50: nộp sản phẩm cuối (xem S8.1)                        |

## 2. CÁC SPRINT

Chỉ liệt kê sprint đã có nhiệm vụ. Các sprint sau chưa lập, thêm khi có nhiệm vụ được giao. Cột "Giờ" để trống đến khi người thực hiện ước lượng.

### Sprint 1 (21/10 → 27/10)

| Bước | Nội dung                                        | UC | FR / NFR | Xong khi                                                              | Giờ |
| ---- | ----------------------------------------------- | -- | -------- | --------------------------------------------------------------------- | --- |
| S1.1 | Đọc lại phân tích; gửi GVHD bản câu hỏi phạm vi | -  | -        | Đã gửi; câu trả lời ghi vào O-15 (ch.7 §5)                            |     |
| S1.2 | Báo cáo Sprint 1                                | -  | -        | `bao-cao/sprint-1.md`                                                 |     |

### Sprint 2 (28/10 → 03/11)

| Bước | Nội dung                                                                                                                                                                                           | UC | FR / NFR | Xong khi                                                                                      | Giờ |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -- | -------- | --------------------------------------------------------------------------------------------- | --- |
| S2.1 | Nộp tuần 2/3 (hạn 01/11): wireframe giao diện cơ bản (ảnh, vẽ bằng Figma hoặc tool khác); xuất `docs/phan-tich/` sang Google Doc; xác nhận tên repo theo định dạng `TTCN_MANHOM`; trang kế hoạch (timeline, phân công) trên website | -  | -        | Ảnh wireframe trong `docs/wireframe/`; link Google Doc và link repo gửi GVHD trước 01/11      |     |
| S2.2 | Báo cáo Sprint 2                                                                                                                                                                                   | -  | -        | `bao-cao/sprint-2.md`                                                                         |     |

### Ngày 50 (09/12) - Nộp

| Bước | Nội dung                         | UC | FR / NFR | Xong khi | Giờ |
| ---- | -------------------------------- | -- | -------- | -------- | --- |
| S8.1 | Nộp sản phẩm cuối, trình bày thử | -  | -        | Đã nộp   |     |

## 3. MẪU BÁO CÁO SPRINT (`bao-cao/sprint-N.md`)

Khi xong mỗi sprint (bước "Báo cáo Sprint N"), tạo file `bao-cao/sprint-N.md` ở gốc repo theo mẫu dưới. Thư mục `bao-cao/` tách khỏi `docs/` (docs chỉ chứa phân tích và ADR); báo cáo ghi _thực tế đã làm_ nên không nằm trong tài liệu phân tích. Sprint sau đọc file này ở Sprint Planning. Sprint 1 tạo thư mục `bao-cao/`. Mục nào chưa có thông tin thì để trống, không điền thay.

```markdown
# Báo cáo Sprint N (dd/MM - dd/MM/2026) - CN-019
## 1. Mục tiêu sprint (Sprint Goal 1 câu + các bước đã chọn)
## 2. Đã hoàn thành - Sprint Review (bước, link commit, ảnh chụp, phản hồi nhận được)
## 3. Chưa hoàn thành & lý do
## 4. Khó khăn kỹ thuật & cách giải quyết (bài học)
## 5. Số giờ thực tế / ước lượng
## 6. Đánh giá và cải tiến - Retrospective (làm tốt, chưa tốt, 1 việc cải tiến)
## 7. Kế hoạch sprint tiếp theo
## 8. Câu hỏi cho GVHD
```

## 4. BẢNG THEO DÕI TIẾN ĐỘ

> Tick `[x]` khi người thực hiện đã tự kiểm chứng toàn bộ cột "Xong khi" của bước. Ghi giờ thực tế và ngày xong. Để trống nếu chưa có.

| Bước     | Nội dung                                            | Ước lượng | Thực tế | Ngày xong |
| -------- | --------------------------------------------------- | --------- | ------- | --------- |
| [ ] S1.1 | Đọc lại phân tích; gửi GVHD câu hỏi phạm vi         |           |         |           |
| [ ] S1.2 | Báo cáo Sprint 1                                    |           |         |           |
| [ ] S2.1 | Nộp tuần 2/3: wireframe, Google Doc, repo, kế hoạch |           |         |           |
| [ ] S2.2 | Báo cáo Sprint 2                                    |           |         |           |
| [ ] S8.1 | Nộp sản phẩm cuối                                   |           |         |           |

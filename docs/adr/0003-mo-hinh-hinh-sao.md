# ADR-0003: Kho dữ liệu theo mô hình hình sao (star schema)

- **Trạng thái:** Đã chấp nhận (chờ GVHD xác nhận — O-15)
- **Ngày:** 21/10/2026
- **Liên quan:** `docs/phan-tich/08-kien-truc-va-dinh-huong.md` §8.4; `docs/phan-tich/so-do/out/06-star-schema.png`

## Bối cảnh

Đề bài yêu cầu kiến thức "mô hình dữ liệu phục vụ phân tích thống kê (OLAP/Star Schema)" và "tối ưu hoá truy vấn tổng hợp". Bản v1 dùng schema chuẩn hoá (`orders`, `order_items`, `products`, `categories`…) kèm một materialized view, khi bảo vệ khó giải thích là "star schema".

## Quyết định

- Một bảng sự kiện `fact_sales`, **hạt = một sản phẩm trong một đơn**; số đo: `quantity`, `unit_price`, `discount`, `cost_price`, cột sinh `revenue`, `cost_amount`.
- Năm bảng chiều: `dim_date` (sinh sẵn 2020–2030, khoá `yyyymmdd`), `dim_branch` (có `province`, `region`), `dim_product` (có `category`, phi chuẩn hoá), `dim_customer`, `dim_channel`.
- `order_code` + `source_id` là **chiều suy biến** (degenerate dimension) nằm ngay trong fact; `status` là thuộc tính của fact (chỉ 3 giá trị, không cần bảng chiều).
- Khoá duy nhất `(source_id, order_code, line_no)` phục vụ nạp lại idempotent (BR-06).
- Không dùng materialized view; truy vấn trực tiếp fact + index (ADR-0004).

## Hệ quả

- **Tích cực:** mọi câu hỏi phân tích = `fact_sales JOIN dim_* GROUP BY …`; drill-down là đổi cột GROUP BY (`year → quarter → month → full_date`); thêm chiều mới (vd. nhân viên bán hàng) = thêm 1 bảng chiều + 1 cột khoá.
- **Tiêu cực:** tên danh mục lặp trong `dim_product`; đổi tên một danh mục phải `UPDATE` nhiều dòng (hiếm, chấp nhận được). Không lưu được lịch sử thay đổi thuộc tính chiều (vd. sản phẩm đổi danh mục) — muốn có thì dùng SCD loại 2.
- **Phương án đã loại:** _snowflake_ (tách `dim_category`, `dim_region`): chuẩn hoá hơn nhưng thêm JOIN mà không có lợi ích rõ ràng ở quy mô này.

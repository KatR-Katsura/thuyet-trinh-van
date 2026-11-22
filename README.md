# THE LIGHT IN FAILURE — Nhóm 2

Bài thuyết trình HTML 14 slide, HTML/CSS/JS thuần, không cần cài gì.

## Chạy

1. Giải nén, mở thư mục trong VS Code.
2. Mở `index.html` bằng Live Server (khuyến nghị) hoặc bấm đúp để mở thẳng bằng Chrome/Edge.
3. Bấm **F** để toàn màn hình.

Chữ dùng font Be Vietnam Pro tải từ Google Fonts, nên lần đầu cần mạng. Không có mạng thì tự rơi về font hệ thống (Segoe UI/Arial), vẫn đủ dấu tiếng Việt. Muốn chạy offline hẳn thì tải font về bỏ vào `assets/fonts/` rồi thêm `@font-face` vào `css/style.css`.

## Phím điều khiển

| Phím | Việc |
|---|---|
| `→` / `Space` / `Enter` / `PageDown` | Bước tiếp (hiện bước kế trong slide, hết bước thì sang slide sau) |
| `←` / `PageUp` / `Backspace` | Lùi một bước |
| `Home` / `End` | Về slide đầu / cuối |
| `F` | Toàn màn hình |
| `P` | Mở cửa sổ **Người trình bày** |
| `H` | Ẩn/hiện số trang và thanh tiến trình |
| Vuốt trái/phải | Dùng trên màn hình cảm ứng |

Mở thẳng một slide để test: `index.html#9` (slide 9).

Một số slide có nhiều bước bấm (slide 4, 5, 6, 7, 8, 9, 12, 14). Tổng cộng khoảng 29 lần bấm từ đầu đến cuối.

## Cửa sổ người trình bày (lời thoại)

Bấm **P** (hoặc nút "Người trình bày") để mở cửa sổ thứ hai. Kéo cửa sổ này sang màn hình của người nói, còn cửa sổ chính chiếu cho cả lớp. Cửa sổ này có: lời thoại của slide, ai nói, thời gian dự kiến, đồng hồ tổng (cảnh báo khi quá 10 phút), slide kế tiếp, nút Tiếp/Trước. Lời thoại không bao giờ hiện lên màn hình khán giả.

Lời thoại nằm trong `js/notes.js`. Các chỗ `[ ]` là chỗ nhóm tự điền (tên, chuyện thật, chuyện gần hơn). Sửa trực tiếp trong file này.

## Việc nhóm còn phải làm

- [ ] Điền `[tên]`, `[tên các bạn]` (slide 1) và hai chỗ chuyện thật trong `js/notes.js` (slide 7 và slide 10).
- [ ] Nói thử to, bấm giờ bằng cửa sổ Người trình bày. Thời lượng 9 phút 20 giây là con số **tính theo kịch bản, chưa đo thực tế**.
- [ ] Nếu lớp đổi ý ở phần "gom lại", sửa 3 dòng trong slide 12 (`index.html`, khối `.recap`).
- [ ] Thêm ảnh (xem bên dưới) nếu muốn, không thêm thì slide vẫn đẹp.

## Ảnh (tùy chọn)

Bài **không bắt buộc có ảnh**. Bóng người, khán giả, ánh sáng đều vẽ bằng SVG/CSS. Nếu muốn thêm ảnh thật, bỏ file vào `assets/images/` đúng tên dưới đây, bài sẽ tự dùng, không có thì tự bỏ qua, không báo lỗi:

| Tên file | Dùng ở | Gợi ý nguồn (tự mở và tải về) |
|---|---|---|
| `classroom.jpg` | Slide 2, làm nền mờ | Unsplash: lớp học có ánh sáng |
| `lonely.jpg` | Slide 6, nền mờ | Unsplash: người đứng giữa không gian rộng/tối |
| `falcon1_flight4.jpg` | Slide 10, nền lớn | Wikimedia Commons: `File:Falcon_1_Flight_4_launch.jpg` |

Trước khi dùng ảnh nào cũng cần **kiểm tra giấy phép và ghi nguồn**. Khi ảnh được nạp, dòng ghi nguồn ở góc dưới slide tự hiện; sửa chữ đó ở thuộc tính `data-credit` trong `index.html` (nên ghi đúng tên tác giả theo trang gốc).

Ảnh tên lửa (slide 10) chỉ nên dùng ảnh thật từ nguồn đã xác minh. Đừng dùng ảnh do AI tạo rồi nói là ảnh tư liệu.

## Cấu trúc

```
index.html          14 slide
presenter.html      cửa sổ người trình bày
css/style.css       bố cục, màu, chữ
css/animations.css  chuyển động
js/main.js          điều khiển slide, ánh sáng, bụi, phím, toàn màn hình
js/transitions.js   ánh sáng từng slide, bóng người SVG, tách chữ, nạp ảnh
js/notes.js         lời thoại + thời gian từng slide
assets/images/      ảnh tùy chọn
assets/fonts/       font (tùy chọn, cho chạy offline)
```

## Chỉnh nhanh

- **Ánh sáng từng slide** (vị trí, độ rộng, màu lạnh→ấm): mảng `LIGHTS` trong `js/transitions.js`.
- **Màu**: biến `--gold`, `--cold`... ở đầu `css/style.css`.
- **Thời gian vào của từng chữ**: thuộc tính `--d` (giây) trên từng phần tử trong `index.html`.

## Ghi chú nội dung

- Mốc SpaceX trên slide 9 chỉ gồm: Falcon 1 phóng hỏng 3/2006, 3/2007, 8/2008; thành công 28/9/2008. Các chi tiết chưa có nguồn ("gần hết tiền", "Musk ngồi giữa đống đổ nát") **cố ý không đưa vào**.
- Slide 12 có thêm khối "Nhóm gom lại" (3 điều) vì lời thoại của nhóm có phần này; 4 hành động là phần chính.
- Slide 3: bên phải sáng trắng có chủ ý (xấu hổ = ánh đèn phán xét), bên trái tối (thất bại là một sự việc).

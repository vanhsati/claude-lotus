# task002: Niết Bàn, sự tắt lửa

Animation giải thích Niết Bàn (Nibbāna) theo giáo lý Theravāda, lời Việt, có dẫn nguồn kinh điển Pāli.
Một tệp duy nhất: mở `index.html` trong trình duyệt (HTML + SVG + JS thuần, không cần build).

Điều khiển: nút ◀ ▶ hoặc phím ← →, phím cách để tạm dừng, bấm tên chương để nhảy tới.
Mở thẳng một chương bằng `index.html#c3` (chương 3).

## Mười chương

| # | Chương | Nội dung chính | Nguồn |
|---|--------|----------------|-------|
| 1 | Sự tắt lửa | nghĩa đen của *nibbāna* | |
| 2 | Ba ngọn lửa | sáu căn đang cháy bởi tham, sân, si | SN 35.28 |
| 3 | Nhiên liệu và sự tắt | *upādāna* là chấp thủ và nhiên liệu; định nghĩa Niết Bàn | SN 12.52, SN 38.1, MN 51 |
| 4 | Bốn Sự Thật Cao Quý | Khổ, Tập, Diệt (= Niết Bàn), Đạo; ví dụ y học | SN 56.11, Vism XVI |
| 5 | Bát Chánh Đạo | giới, định, tuệ | SN 56.11, MN 44 |
| 6 | Bốn tầng thánh | mười kiết sử bị cắt đứt dần | AN 10.13, AN 3.86 |
| 7 | Hữu dư y và Vô dư y | *sa-upādisesa* và *anupādisesa nibbāna-dhātu* | Iti 44, DN 16 |
| 8 | Lửa đi về đâu? | ví dụ ngọn lửa tắt | MN 72 |
| 9 | Năm hiểu lầm | cõi trời, hư vô, chỉ sau khi chết, Đại Ngã, cảm giác sướng | AN 4.45, SN 22.85, AN 3.55, Dhp 279, AN 9.34 |
| 10 | An lạc tối thượng | cái không sinh, không hữu vi; *ehipassiko* | Ud 8.3, Dhp 204, AN 6.10 |

Các câu trích là bản dịch tạm bám sát Pāli; nên đối chiếu với bản dịch của HT. Thích Minh Châu trước khi dùng rộng rãi.

## Chỉnh sửa

Mỗi chương là một phần tử trong mảng `scenes` của `index.html`: `beats` chứa lời thuyết minh (`t`) và nguồn (`s`),
`init` vẽ cảnh, `update` điều khiển chuyển động theo nhịp (beat) hiện tại. Thời lượng mỗi nhịp tự tính theo độ dài lời.

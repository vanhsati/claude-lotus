# task004: Video giới thiệu ResinEpic

Video giới thiệu 45 giây (1080p30, có nhạc) cho [ResinEpic](https://www.etsy.com/shop/ResinEpic), shop đèn resin epoxy làm thủ công ở Hà Nội.

* `video/resinepic.mp4`: video hoàn chỉnh.
* `src/index.html`: toàn bộ hình ảnh. Mọi khung hình đều dựng bằng three.js (resin trong suốt, đế gỗ, LED đổi màu, hiệu ứng bloom) và vẽ chữ bằng canvas. Mỗi khung là một hàm thuần của thời gian `t`.
* `tools/music.py`: nhạc nền tổng hợp bằng numpy/scipy (không dùng mẫu âm thanh có sẵn), ghi ra `audio/music.wav`.
* `tools/render.mjs`: render khung hình bằng Chromium headless và ghép MP4 bằng ffmpeg.

## Nội dung

| Thời gian | Cảnh | Chữ trên màn hình |
|---|---|---|
| 0–6,2 s | Dòng resin màu hổ phách đổ xuống, loang thành vũng sáng | *Freezing time,* |
| 6,2–11,2 | Đèn phi hành gia bật sáng trong bóng tối | *illuminating moments.* · ResinEpic |
| 11,2–14,4 | Mẫu nhân vật được in 3D từng lớp | Step 1 · Designed & 3D-printed |
| 14,4–17,6 | Lớp lót xám được sơn màu từ trên xuống | Step 2 · Painted by hand |
| 17,6–20,8 | Resin trong suốt đổ vào khuôn thành từng lớp | Step 3 · Cast in layers of clear epoxy |
| 20,8–24 | Khối resin hạ xuống đế gỗ, LED bật | Step 4 · Set on wood, lit from within |
| 24–35 | Ba mẫu đèn: sứa biển, phi hành gia, kiếm sĩ dưới trăng; LED chuyển chế độ | Every lamp is a small world · 16 light modes, one remote |
| 35–40,4 | Đèn kiếm sĩ ánh cam | Made by hand, one at a time · in Hà Nội, Việt Nam · Shipped worldwide with care |
| 40,4–45 | Khung kết | ResinEpic · Freezing Time, Illuminating Moments · etsy.com/shop/ResinEpic |

Thông tin về shop lấy từ kết quả tìm kiếm công khai: làm ở Hà Nội; slogan "Freezing Time, Illuminating Moments!"; quy trình thiết kế, in 3D mẫu, sơn tay, pha resin epoxy; đế gỗ; LED RGB có điều khiển 16 chế độ; giao hàng từ Việt Nam. Môi trường dựng video không truy cập được Etsy hay resinepic.com, nên video không dùng ảnh sản phẩm thật. Ba mẫu đèn trong video là thiết kế minh họa riêng, không vẽ nhân vật có bản quyền và không dùng logo.

## Render lại

```bash
cd task004 && npm install
pip install numpy scipy imageio-ffmpeg
python3 tools/music.py                                    # audio/music.wav
node tools/render.mjs --stills=3,8.5,23,28 --scale=.5     # xem thử vài khung: out/stills/
node tools/render.mjs --frames --workers=3                # frames/00000.jpg … (khoảng 14 phút)
node tools/render.mjs --encode                            # video/resinepic.mp4
```

Muốn sửa chữ, thời lượng cảnh hay màu đèn thì sửa mảng `shots` trong `src/index.html`. Mỗi phần tử gồm `[bắt đầu, kết thúc, dựng 3D, vẽ chữ]`.

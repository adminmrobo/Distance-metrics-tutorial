"""캐릭터 팩(adminmrobo/fruitfly-lab-expressions)을 옆 폴더에 받아 두고 실행 → data/sprites.json
하루 표정 7장(216px)과 시아·모아 얼굴(96px)을 WebP data URI로 만든다."""
from PIL import Image
import base64, io, json
SRC = "../fruitfly-lab-expressions/images/"
M = {"neutral": "haru/E07_explaining", "happy": "haru/E01_joy", "point": "haru/E08_guiding",
     "surprise": "haru/E04_surprise", "think": "haru/E09_thinking", "cheer": "haru/E12_cheering",
     "wink": "haru/E10_confirming", "sia": "sia/E01_joy", "moa": "moa/E01_joy"}
out, tot = {}, 0
for k, f in M.items():
    im = Image.open(SRC + f + ".png").convert("RGBA")
    n = 96 if k in ("sia", "moa") else 216
    if k in ("sia", "moa"):                       # 얼굴 쪽만 잘라 정사각형으로
        w, h = im.size; im = im.crop((int(w * .18), int(h * .02), int(w * .82), int(h * .66)))
    bg = Image.new("RGBA", im.size, (212, 212, 214, 255)); bg.alpha_composite(im)
    img = bg.convert("RGB").resize((n, n), Image.LANCZOS)
    b = io.BytesIO(); img.save(b, "WEBP", quality=86, method=6)
    out[k] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode(); tot += len(b.getvalue())
json.dump(out, open("data/sprites.json", "w")); print("sprites", tot, "bytes")

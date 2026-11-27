"""index.html(1부)·part2/index.html(2부) 만들기 — 틀에 실험 데이터·대사·그림·장면 코드를 넣는다.

순서 (저장소 맨 위 폴더에서)
  1) python3 tools/experiment.py      # data/distance_run.json (시드 4)
  2) python3 tools/sprites.py         # 캐릭터 팩 → data/sprites.json (../fruitfly-lab-expressions 필요)
  3) python3 tools/build_page.py      # index.html, part2/index.html
"""
import json

import os
run = json.load(open("data/distance_run.json", encoding="utf-8"))
sprites = open("data/sprites.json", encoding="utf-8").read()
for part, keys, out in ((1, ("position", "cosine", "globe"), "index.html"),
                        (2, ("hamming", "overlap"), "part2/index.html")):
    data = {k: run[k] for k in keys}                                  # 그 편에 필요한 것만
    s = open(f"tools/page_template_part{part}.html", encoding="utf-8").read()
    s = s.replace("__SCENES__", open(f"tools/scenes_part{part}.js", encoding="utf-8").read())
    s = s.replace("__HARU__", sprites)
    s = s.replace("__DATA__", json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    lines = json.load(open(f"data/haru_lines_part{part}.json", encoding="utf-8"))
    comic = json.load(open(f"data/comic_part{part}.json", encoding="utf-8"))          # 0번 파트: 만화로 보는 상황
    lines = [{"t": comic["t"], "code": [], "who": comic["who"], "lines": [[x, x] for x in comic["lines"]]}] + lines
    exp = [comic["exp"]] + json.load(open(f"data/haru_exp_part{part}.json", encoding="utf-8"))
    base = "images/" if part == 1 else "../images/"
    comic["img"] = [x if os.path.exists(f"images/comic/{x}.webp") else None for x in comic["img"]]   # 아직 없는 그림은 표지로 대신
    head = (f"const COMIC={json.dumps({k: comic[k] for k in ('img', 'faces', 'alt')}, ensure_ascii=False)},"
            f"COMIC_BASE={json.dumps(base + 'comic/')},COVER_SRC={json.dumps(base + f'cover_part{part}.webp')};\n")
    s = s.replace("__COMIC__", head + open("tools/comic.js", encoding="utf-8").read())
    s = s.replace("__EXP__", json.dumps(exp))
    s = s.replace("__SCRIPT__", json.dumps(lines, ensure_ascii=False, separators=(",", ":")))
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    open(out, "w", encoding="utf-8").write(s)
    print(out, len(s.encode()), "bytes")

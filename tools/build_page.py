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
    s = s.replace("__EXP__", open(f"data/haru_exp_part{part}.json", encoding="utf-8").read())
    lines = json.load(open(f"data/haru_lines_part{part}.json", encoding="utf-8"))
    s = s.replace("__SCRIPT__", json.dumps(lines, ensure_ascii=False, separators=(",", ":")))
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    open(out, "w", encoding="utf-8").write(s)
    print(out, len(s.encode()), "bytes")

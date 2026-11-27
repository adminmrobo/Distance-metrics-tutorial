"""index.html(1부) 만들기 — 틀에 실험 데이터·대사·그림·장면 코드를 넣는다.

순서 (저장소 맨 위 폴더에서)
  1) python3 tools/experiment.py      # data/distance_run.json (시드 4)
  2) python3 tools/sprites.py         # 캐릭터 팩 → data/sprites.json (../fruitfly-lab-expressions 필요)
  3) python3 tools/build_page.py      # index.html
"""
import json

run = json.load(open("data/distance_run.json", encoding="utf-8"))
part1 = {k: run[k] for k in ("position", "cosine", "globe")}       # 1부에 필요한 것만
s = open("tools/page_template_part1.html", encoding="utf-8").read()
s = s.replace("__SCENES__", open("tools/scenes_part1.js", encoding="utf-8").read())
s = s.replace("__HARU__", open("data/sprites.json", encoding="utf-8").read())
s = s.replace("__DATA__", json.dumps(part1, ensure_ascii=False, separators=(",", ":")))
s = s.replace("__EXP__", open("data/haru_exp_part1.json", encoding="utf-8").read())
lines = json.load(open("data/haru_lines_part1.json", encoding="utf-8"))
s = s.replace("__SCRIPT__", json.dumps(lines, ensure_ascii=False, separators=(",", ":")))
open("index.html", "w", encoding="utf-8").write(s)
print("index.html", len(s.encode()), "bytes")

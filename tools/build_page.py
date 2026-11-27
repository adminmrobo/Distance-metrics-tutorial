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
    # 클리어 이벤트: 자 카드(값은 실험 기록에서), 하루 대사, 다음 길 버튼
    po, co, gl, hm, ov = run["position"], run["cosine"], run["globe"], run["hamming"], run["overlap"]
    cards = [
        {"name": "유클리드", "val": f"{po['euclidean']:.3f}", "note": "시아 ↔ 모아 직선", "col": "sum"},
        {"name": "맨해튼", "val": f"{po['manhattan']:.0f}", "note": "격자를 따라", "col": "vio"},
        {"name": "체비쇼프", "val": f"{po['chebyshev']:.0f}", "note": "가장 많이 움직인 축", "col": "cyan"},
        {"name": "민코프스키", "val": f"{po['minkowski']['3']:.3f}", "note": "p = 3", "col": "ink"},
        {"name": "코사인", "val": f"{co['sia_moa_cos']:.3f}", "note": "두 사람의 후기", "col": "drop"},
        {"name": "하버사인", "val": f"{gl['haversine_km']:,.0f} km", "note": "서울 ↔ 런던", "col": "plain"},
        {"name": "해밍", "val": f"{hm['easy']['sia_vs_original']} · {hm['easy']['moa_vs_original']}", "note": "도장에서 다른 점", "col": "sum"},
        {"name": "자카드", "val": f"{ov['sia_vs_official']['jaccard']:.3f}", "note": "해적판 피규어", "col": "drop"},
        {"name": "쇠렌센-다이스", "val": f"{ov['sia_vs_official']['dice']:.3f}", "note": "해적판 피규어", "col": "cyan"},
    ]
    lab = "https://adminmrobo.github.io/ahn_boat_lab_town/haru3d.html"
    if part == 1:
        for cd in cards[6:]: cd["lock"] = True
        end = {"title": "1부 CLEAR!", "sub": "공간 속 거리 · 자 여섯 개를 모았어요", "cards": cards,
               "line": "1부 완주! 자 여섯 개를 모았어요. 남은 세 개는 2부에서 만나요!",
               "links": [["2부로 가기 →", "part2/"], ["↺ 처음부터", ""], ["2층 실험실 ↗", lab]],
               "alt": "1부 클리어: 유클리드 9.899, 맨해튼 16, 체비쇼프 8, 민코프스키 8.724, 코사인 0.990, 하버사인 8,857 km. 해밍·자카드·다이스는 2부에서 열립니다."}
    else:
        end = {"title": "EP.04 CLEAR!", "sub": "1부 · 2부 완주 · 자 아홉 개를 모두 모았어요", "cards": cards,
               "cert": True, "stamp": hm["easy"]["original"],                  # 완주 인증서에 찍는 등록 원본 인영
               "line": "EP.04 완주! 박사님 진품 도장이 찍힌 인증서예요. 자 아홉 개를 모두 모았어요!",
               "links": [["↺ 처음부터", ""], ["1부 다시 보기", "../"], ["2층 실험실 ↗", lab]],
               "alt": "EP.04 클리어: 박사 도장(원본과 다른 점 0점)이 찍힌 완주 인증서, 자 아홉 개 — 유클리드 9.899, 맨해튼 16, 체비쇼프 8, 민코프스키 8.724, 코사인 0.990, 하버사인 8,857 km, 해밍 13 · 67, 자카드 0.705, 다이스 0.827."}
    s = s.replace("__END__", f"const END={json.dumps(end, ensure_ascii=False)};\n" + open("tools/end.js", encoding="utf-8").read())
    s = s.replace("__SCRIPT__", json.dumps(lines, ensure_ascii=False, separators=(",", ":")))
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    open(out, "w", encoding="utf-8").write(s)
    print(out, len(s.encode()), "bytes")

# 지식 색인(#kg)·꾸러미(#export)는 기본 — 페이지를 다시 만들면 kg/pages/의 꼬리표를 다시 붙인다(본문은 그대로).
import subprocess, sys
if os.path.exists("kg/reapply.py"):
    subprocess.run([sys.executable, "kg/reapply.py", "."], check=True)
else:
    print("경고: kg/reapply.py가 없습니다 — 지식 색인을 붙이지 못했습니다 (ai-lab-retrofit으로 kg/pages/를 먼저 만드세요)")

"""EP.04 시아와 모아는 얼마나 멀까 — 거리 척도 9가지 재현 코드 (1부·2부 공통)

모든 숫자는 이 파일을 실행해 나온 값만 쓴다. 시드 고정.
실행(저장소 맨 위 폴더): python3 tools/experiment.py [캐릭터 팩 경로, 기본 ../fruitfly-lab-expressions]  → data/distance_run.json
"""
import json, math, sys
from pathlib import Path
import numpy as np
from PIL import Image

SEED = 4
rng = np.random.default_rng(SEED)
PACK = Path(sys.argv[1] if len(sys.argv) > 1 else "../fruitfly-lab-expressions")
OUT = Path(__file__).resolve().parent.parent / "data" / "distance_run.json"
R = lambda v, n=3: round(float(v), n)

# ── 1. 위치: 2층 방 안의 시아·모아 (방 20×10×20) ─────────────────────
sia_pos = np.array([4, 0, 10])
moa_pos = np.array([12, 5, 7])      # 모아는 EP.05 공중 실험대 옆 발판 위
d = moa_pos - sia_pos

def minkowski(v, p):
    return float(np.sum(np.abs(v) ** p) ** (1 / p))

position = {
    "sia": sia_pos.tolist(), "moa": moa_pos.tolist(), "delta": d.tolist(),
    "euclidean": R(np.linalg.norm(d)),
    "manhattan": R(np.abs(d).sum()),
    "chebyshev": R(np.abs(d).max()),
    "minkowski": {str(p): R(minkowski(d, p)) for p in (1, 1.5, 2, 3, 4, 8)},
}

# ── 2. 코사인: 하루 2등신 미니 피규어 후기 (연구실 가상 상품, 예시 후기) ──
KEYS = ["표정", "도색", "배송"]            # x, y, z
reviews = {
    "시아": "표정이 귀여워요. 표정 부품 바꾸는 재미가 커요. 도색도 깔끔해요.",
    "모아": ("표정 부품이 정말 많아요. 웃는 표정, 놀란 표정, 생각하는 표정까지 다 들어 있어요. "
            "앞머리 도색이 아주 조금 번졌지만 그만큼 도색이 섬세하다는 뜻 같아요. "
            "바보털까지 살린 표정 부품 덕분에 매일 책상 위 표정을 바꿔 줘요."),
    "초파리": "도색이 번졌어요. 눈동자 도색이 한쪽으로 쏠렸고 머리끈 도색도 흐려요.",
    "박사": "배송은 빨랐는데 도색이 군데군데 벗겨졌어요. 도색을 다시 해 줬으면 해요.",
    "주판봇": "배송이 사흘 늦었어요. 배송 상자도 찌그러져 왔어요.",
    "X1": "표정은 좋은데 배송이 너무 늦어요. 배송 문의 답도 늦었어요.",
}
vec = {k: np.array([t.count(w) for w in KEYS], float) for k, t in reviews.items()}

def cos(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

names = list(reviews)
cosine = {
    "keys": KEYS, "reviews": reviews,
    "vectors": {k: v.astype(int).tolist() for k, v in vec.items()},
    "sia_moa_cos": R(cos(vec["시아"], vec["모아"]), 3),
    "sia_moa_angle_deg": R(math.degrees(math.acos(min(1, cos(vec["시아"], vec["모아"])))), 1),
    "sia_moa_euclid": R(np.linalg.norm(vec["시아"] - vec["모아"])),
    "matrix": [[R(cos(vec[a], vec[b]), 3) for b in names] for a in names],
    "names": names,
}

# ── 3. 해밍: 박사 도장 대조 ─────────────────────────────────────────
def load_gray(p):
    im = Image.open(p).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255)); bg.alpha_composite(im)
    return bg.convert("L")

def stamp(gray, box, th, n):
    a = np.asarray(gray.crop(box).resize((n, n), Image.BOX))
    return (a < th).astype(np.uint8)

def smudge(s, k):                    # 진품을 찍을 때 번지는 점: 잉크 옆 빈 점 k개가 묻음
    s = s.copy(); h, w = s.shape
    cand = [(i, j) for i in range(h) for j in range(w) if s[i, j] == 0 and
            any(0 <= i + di < h and 0 <= j + dj < w and s[i + di, j + dj]
                for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for t in rng.choice(len(cand), k, replace=False):
        s[cand[t]] = 1
    return s

gray = load_gray(PACK / "images/doctor/E13_neutral.png")
N_ST, BOX_ST = 32, (70, 20, 310, 260)
def st(dx=0, dy=0, th=130):
    return stamp(gray, (BOX_ST[0] + dx, BOX_ST[1] + dy, BOX_ST[2] + dx, BOX_ST[3] + dy), th, N_ST)
hd = lambda a, b: int((a != b).sum())
orig = st()                                                  # 등록 인영 32×32

# 3-1. 쉬운 판: 눈으로도 찾을 수 있는 위작 (박사 흰 앞머리 줄을 빠뜨리고 새김)
sia_easy = smudge(st(th=124), 6)                             # 진품: 살살 찍힘 + 번짐
moa_easy = orig.copy()
streak = (gray.crop(BOX_ST).resize((N_ST, N_ST), Image.BOX))
sa = np.asarray(streak); top = np.zeros_like(orig, bool); top[:12] = True
moa_easy[(sa >= 200) & top & (np.arange(N_ST)[None, :] > 8) & (np.arange(N_ST)[None, :] < 22)] = 1
easy = {"original": orig.tolist(), "sia": sia_easy.tolist(), "moa": moa_easy.tolist(),
        "sia_vs_original": hd(sia_easy, orig), "moa_vs_original": hd(moa_easy, orig)}

# 3-2. 어려운 판: 해밍 거리만으로는 갈리지 않는 위작 → AI 모델(로지스틱 회귀)
def nb(a):
    q = np.pad(a, 1); return q[:-2, 1:-1] | q[2:, 1:-1] | q[1:-1, :-2] | q[1:-1, 2:]
def genuine_print():                 # 같은 도장: 누르는 힘·번짐·잉크 빠짐만 다름
    a = st(th=rng.uniform(120, 140))
    e = np.argwhere((a == 0) & nb(a))
    for t in rng.choice(len(e), rng.integers(0, 9), replace=False): a[tuple(e[t])] = 1
    k = np.argwhere(a == 1)
    for t in rng.choice(len(k), rng.integers(0, 6), replace=False): a[tuple(k[t])] = 0
    return a
def forged_print():                  # 솜씨 좋은 위작: 새김이 1px 안팎 어긋남
    dx, dy = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)][rng.integers(8)]
    return st(dx, dy, rng.uniform(124, 136))

M = 400
G = [genuine_print() for _ in range(M)]; F = [forged_print() for _ in range(M)]
feat = lambda a: np.concatenate([((a == 1) & (orig == 0)).ravel(), ((a == 0) & (orig == 1)).ravel()]).astype(float)
X = np.array([feat(a) for a in G + F]); y = np.r_[np.zeros(M), np.ones(M)]
Hd = np.array([hd(a, orig) for a in G + F])
XH, yH = X, y                                                # 도장 학습 데이터 (아래 피규어 격자 X와 이름이 겹치지 않게)
idx = rng.permutation(2 * M); tr, te = idx[:600], idx[600:]
thr = max(range(200), key=lambda t: ((Hd[tr] > t) == y[tr]).mean())
from sklearn.linear_model import LogisticRegression
model = LogisticRegression(C=0.5, max_iter=3000).fit(X[tr], y[tr])
# 시아·모아의 어려운 판 포스터: 시험 데이터에서 "해밍으로는 거꾸로 보이는" 한 쌍을 고름
te_g = [i for i in te if y[i] == 0]; te_f = [i for i in te if y[i] == 1]
pf = model.predict_proba(X)[:, 1]
gi = max([i for i in te_g if pf[i] < 0.5], key=lambda i: Hd[i])     # 해밍은 의심, 모델은 진품
fi = min([i for i in te_f if pf[i] >= 0.5], key=lambda i: Hd[i])    # 해밍은 통과, 모델은 위작
prob = lambda i: R(model.predict_proba(X[i:i + 1])[0, 1], 3)
w = model.coef_[0]
hard = {
    "train": 600, "test": 200, "threshold": int(thr),
    "hamming_test_acc": R(((Hd[te] > thr) == y[te]).mean(), 3),
    "model_test_acc": R(model.score(X[te], y[te]), 3),
    "genuine_h_p5_50_95": [int(v) for v in np.percentile(Hd[:M], [5, 50, 95])],
    "forged_h_p5_50_95": [int(v) for v in np.percentile(Hd[M:], [5, 50, 95])],
    "sia": (G + F)[gi].tolist(), "moa": (G + F)[fi].tolist(),
    "sia_vs_original": int(Hd[gi]), "moa_vs_original": int(Hd[fi]),
    "sia_forged_prob": prob(gi), "moa_forged_prob": prob(fi),
    "weight_extra_ink": np.round(w[:N_ST * N_ST].reshape(N_ST, N_ST), 2).tolist(),
    "weight_missing_ink": np.round(w[N_ST * N_ST:].reshape(N_ST, N_ST), 2).tolist(),
}
hamming = {"points": N_ST * N_ST, "easy": easy, "hard": hard}

# ── 4. 자카드·다이스: 하루 2등신 미니 피규어 블록 모형 (24×24×24) ────
N = 24; S = N / 16
X, Y, Z = np.meshgrid(np.arange(N), np.arange(N), np.arange(N), indexing="ij")  # y 위쪽

def ball(cx, cy, cz, rx, ry=None, rz=None):
    ry = ry or rx; rz = rz or rx
    return ((X - cx * S) / (rx * S)) ** 2 + ((Y - cy * S) / (ry * S)) ** 2 + ((Z - cz * S) / (rz * S)) ** 2 <= 1

def figure(bun_r=1.6, ahoge=True, head_dy=0.0, head_r=4.2):
    body = ball(7.5, 3.0, 7.5, 2.6, 3.0, 2.2)                    # 몸(가운)
    head = ball(7.5, 9.0 + head_dy, 7.5, head_r, 3.8, 3.8)       # 큰 머리
    buns = ball(4.0, 12.2 + head_dy, 7.5, bun_r) | ball(11.0, 12.2 + head_dy, 7.5, bun_r)
    v = body | head | buns
    if ahoge:                                                    # 바보털: 정수리에서 솟은 두 블록 굵기 줄
        top = int(round((9.0 + head_dy + 3.8) * S))
        v |= (np.abs(X - 7.5 * S) < 1) & (Y >= top) & (Y <= top + 2) & (np.abs(Z - 7.5 * S) < 1)
    return v

official = figure()
moa_fig = official.copy()                                  # 모아: 정품(사출 자국 5개)
surf = np.argwhere(official)
for t in rng.choice(len(surf), 5, replace=False):
    moa_fig[tuple(surf[t])] = False
sia_fig = figure(bun_r=1.1, ahoge=False, head_dy=-1.0, head_r=3.8)   # 시아: 해적판

def jd(a, b):
    inter = int((a & b).sum()); uni = int((a | b).sum())
    return {"inter": inter, "union": uni, "a": int(a.sum()), "b": int(b.sum()),
            "jaccard": R(inter / uni, 3), "dice": R(2 * inter / (a.sum() + b.sum()), 3)}

overlap = {"grid": N, "official_voxels": int(official.sum()),
           "sia_vs_official": jd(sia_fig, official),
           "moa_vs_official": jd(moa_fig, official),
           "sia_vs_moa": jd(sia_fig, moa_fig)}

# ── 5. 하버사인: 시아(서울 연구실)와 모아(런던 출장) ─────────────────
def haversine(lat1, lon1, lat2, lon2, r=6371.0):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))

seoul, london = (37.5665, 126.9780), (51.5072, -0.1276)
def xyz(lat, lon, r=6371.0):
    la, lo = math.radians(lat), math.radians(lon)
    return np.array([r * math.cos(la) * math.cos(lo), r * math.sin(la), r * math.cos(la) * math.sin(lo)])
globe = {"sia": seoul, "moa": london,
         "haversine_km": R(haversine(*seoul, *london), 0),
         "straight_through_km": R(np.linalg.norm(xyz(*seoul) - xyz(*london)), 0)}

# ── 6. 2부 장면용 기록 (위 숫자는 바꾸지 않고 덧붙임) ─────────────────
hard["genuine_h"] = [int(v) for v in Hd[:M]]                 # 진품 400장의 다른 점 수
hard["forged_h"] = [int(v) for v in Hd[M:]]                  # 위작 400장의 다른 점 수
curve = []
for n in (2, 4, 6, 8, 10, 12, 16, 20, 30, 50, 100, 600):     # 학습 장 수 → 시험 200장 정확도
    sub = tr[:n]
    if len(set(yH[sub])) < 2: continue
    mdl = LogisticRegression(C=0.5, max_iter=3000).fit(XH[sub], yH[sub])
    curve.append([n, R(mdl.score(XH[te], yH[te]), 3)])
hard["learning_curve"] = curve
enc = lambda v: [int(i) for i in np.flatnonzero(v.ravel())]  # x*N*N + y*N + z
overlap["voxels"] = {"official": enc(official), "sia": enc(sia_fig), "moa": enc(moa_fig)}

run = {"seed": SEED, "position": position, "cosine": cosine,
       "hamming": hamming, "overlap": overlap, "globe": globe}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(run, ensure_ascii=False, separators=(",", ":")))

if __name__ == "__main__":
    p = position
    print("위치 Δ", p["delta"], "유클리드", p["euclidean"], "맨해튼", p["manhattan"],
          "체비쇼프", p["chebyshev"], "민코프스키", p["minkowski"])
    print("후기 벡터", cosine["vectors"])
    print("시아·모아 cos", cosine["sia_moa_cos"], "각도", cosine["sia_moa_angle_deg"],
          "유클리드", cosine["sia_moa_euclid"])
    for a, row in zip(names, cosine["matrix"]): print("  ", a, row)
    for k in ("easy", "hard"):
        print("도장", k, {a: b for a, b in hamming[k].items() if not isinstance(b, list) or len(b) < 4})
    for k in ("sia_vs_official", "moa_vs_official", "sia_vs_moa"):
        print("피규어", k, overlap[k])
    print("공식 블록", overlap["official_voxels"], "지구", globe)

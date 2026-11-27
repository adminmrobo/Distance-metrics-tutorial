/* ---------- EP.04 2부 · 같은 것인가 : 장면 (si = 대사 번호, f = 대사 안 진행도 0~1, T = 파트 안 초) ---------- */
const HM=D.hamming,EZ=HM.easy,HD=HM.hard,OV=D.overlap;
const ORIG=EZ.original,N=ORIG.length;
const FACE={};["sia","moa"].forEach(k=>{const im=new Image();im.src=HARU[k];FACE[k]=im});
const fmt=(v,n=3)=>Number(v).toFixed(n);
const spin=(T,base=.7,sp=.25)=>REDUCE?base:base+T*sp;
function face(k,x,y,s,col){const im=FACE[k];c.save();c.beginPath();c.arc(x,y,s/2,0,7);c.closePath();c.fillStyle=C.panel;c.fill();if(im&&im.complete&&im.naturalWidth){c.clip();c.drawImage(im,x-s/2,y-s/2,s,s)}c.restore();c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();c.arc(x,y,s/2,0,7);c.stroke()}
const INK=()=>C.glow?"#ff5a6e":"#b3122e";

/* ---- 2D 인영: 점 하나 = 정사각형 ---- */
function stamp2(g,x,y,sz,o={}){const n=g.length,cs=sz/n;c.fillStyle=C.panel;c.fillRect(x,y,sz,sz);
  for(let r=0;r<n;r++)for(let q=0;q<n;q++){const v=g[r][q],d=o.ref&&o.ref[r][q]!==v;
    if(d&&o.diff){c.fillStyle=C.sum;c.fillRect(x+q*cs,y+r*cs,cs,cs)}else if(v){c.fillStyle=o.ink||INK();c.globalAlpha=o.ref&&o.diff?.35:1;c.fillRect(x+q*cs,y+r*cs,cs+.3,cs+.3);c.globalAlpha=1}}
  c.strokeStyle=C.border;c.lineWidth=1;c.strokeRect(x,y,sz,sz);if(o.label)txt(o.label,x+sz/2,y+sz+16,{a:"center",s:o.ls||12,w:800,col:o.lcol||C.ink})}
const nd=(a,b)=>{let k=0;for(let r=0;r<a.length;r++)for(let q=0;q<a.length;q++)if(a[r][q]!==b[r][q])k++;return k};

/* ---- 블록(복셀) 그리기: 보이는 면만, 먼 면부터 ---- */
const FACES=[[[0,1,0],[[0,1,0],[1,1,0],[1,1,1],[0,1,1]],1],[[0,-1,0],[[0,0,0],[0,0,1],[1,0,1],[1,0,0]],.45],[[1,0,0],[[1,0,0],[1,0,1],[1,1,1],[1,1,0]],.72],
  [[-1,0,0],[[0,0,0],[0,1,0],[0,1,1],[0,0,1]],.62],[[0,0,1],[[0,0,1],[0,1,1],[1,1,1],[1,0,1]],.82],[[0,0,-1],[[0,0,0],[1,0,0],[1,1,0],[0,1,0]],.55]];
const vkey=(x,y,z)=>x*4096+y*64+z;
function voxFaces(cells){const occ=new Set(cells.map(v=>vkey(v[0],v[1],v[2])));const out=[];cells.forEach(v=>FACES.forEach(([n,q,sh])=>{if(occ.has(vkey(v[0]+n[0],v[1]+n[1],v[2]+n[2])))return;out.push([v,n,q,sh])}));return out}
function drawVox(pr,faces,o={}){const s=o.s||1,ox=o.ox||0,oy=o.oy||0,oz=o.oz||0,hy=o.hy||1,L=[];
  for(const [v,n,q,sh] of faces){const P=q.map(([a,b,d])=>pr(ox+(v[0]+a)*s,oy+(v[1]+b)*s*hy,oz+(v[2]+d)*s)),cx=ox+(v[0]+.5)*s,cy=oy+(v[1]+.5)*s*hy,cz=oz+(v[2]+.5)*s;
    if(pr(cx+n[0],cy+n[1],cz+n[2])[2]<pr(cx,cy,cz)[2])continue;L.push([P,(P[0][2]+P[1][2]+P[2][2]+P[3][2])/4,v[3]||o.col,sh,v[4]??o.al??1])}
  L.sort((a,b)=>a[1]-b[1]);c.lineWidth=.5;c.strokeStyle=C.glow?"rgba(0,0,0,.45)":"rgba(0,0,0,.35)";
  for(const [P,z,col,sh,al] of L){c.globalAlpha=al;c.fillStyle=mix("#000000",col,.5+.5*sh);c.beginPath();c.moveTo(P[0][0],P[0][1]);for(let i=1;i<4;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();c.fill();if(al>.6)c.stroke()}c.globalAlpha=1}
const _fc={};const cached=(k,fn)=>_fc[k]||(_fc[k]=fn());

/* 도장 돋을새김: 받침 + 잉크 점(높이 0.7) + 다른 점 기둥 */
function stampPr(T,o={}){const NW=W<560,S=o.S||Math.min(NW?W*.022:W*.017,H*.026);return cam3(o.cx??W*.42,o.cy??H*.58,S,T,{center:[16,0,16],pit:-.62,yaw:spin(T,o.yaw??.5,o.sp??.12),dist:150})}
function stamp3(pr,g,o={}){const n=g.length;
  const base=[[0,0,0],[n,0,0],[n,0,n],[0,0,n]].map(v=>pr(...v));c.fillStyle=C.panel;c.beginPath();base.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.strokeStyle=C.border;c.lineWidth=1.2;c.stroke();
  const ink=cached("ink"+(o.key||""),()=>{const cl=[];for(let r=0;r<n;r++)for(let q=0;q<n;q++)if(g[r][q])cl.push([q,0,r,INK()]);return voxFaces(cl)});
  drawVox(pr,ink,{hy:.7});
  if(o.diff){const d=[];for(let r=0;r<n;r++)for(let q=0;q<n;q++)if(o.diff[r][q]!==g[r][q])d.push([q,0,r,C.sum]);const k=o.grow??1;if(k>0)drawVox(pr,voxFaces(d),{hy:.7+3.3*k,col:C.sum})}}

/* ---- 그래프 도우미 ---- */
function hist(x,y,w,h,o={}){const G=HD.genuine_h,F=HD.forged_h,bins=[];for(let b=0;b<=60;b+=2)bins.push(b);const cnt=a=>bins.map(b=>a.filter(v=>v>=b&&v<b+2).length),cg=cnt(G),cf=cnt(F),ym=Math.max(...cg,...cf);
  const m=chart(x,y,w,h,{title:o.title||"",xr:[0,62],yr:[0,ym*1.1],xt:[0,10,20,30,40,50,60],yt:[0,Math.round(ym/2),ym],pl:34});const bw=m.bw/31*.9,gr=o.grow??1;
  [[cg,C.drop],[cf,C.plain]].forEach(([cn,col])=>{cn.forEach((v,i)=>{const X=m.X(bins[i]),Y=m.Y(v*gr);c.fillStyle=col;c.globalAlpha=.55;c.fillRect(X,Y,bw,m.Y(0)-Y)});c.globalAlpha=1});
  return m}

/* ---- 피규어 블록: 0 공식, 1 시아(해적판), 2 모아(정품) ---- */
const VG=OV.grid,dec=a=>a.map(i=>[Math.floor(i/(VG*VG)),Math.floor(i/VG)%VG,i%VG]);
const VO=dec(OV.voxels.official),VS=dec(OV.voxels.sia),VM=dec(OV.voxels.moa);
const VSET=a=>new Set(a.map(v=>vkey(...v)));const SO=VSET(VO),SS=VSET(VS),SM=VSET(VM);
function figPr(T,o={}){const NW=W<560,S=o.S||Math.min(NW?W*.03:W*.022,H*.03);return cam3(o.cx??W*.4,o.cy??H*.55,S,T,{center:[12,11,12],pit:-.28,yaw:spin(T,o.yaw??.9,.35),dist:120})}

const S=[
// 1 intro
(si,f,T)=>{const NW=W<560,sz=Math.min(NW?(W-60)/3:W*.22,H*.46),gap=NW?14:34,x0=(W-(3*sz+2*gap))/2,y0=Math.max(40,(H-sz-130)/2);
  stamp2(ORIG,x0,y0,sz,{label:"등록 원본",ls:NW?10:12});stamp2(HD.sia,x0+sz+gap,y0,sz,{label:"시아 포스터",lcol:C.drop,ls:NW?10:12});stamp2(HD.moa,x0+2*(sz+gap),y0,sz,{label:"모아 포스터",lcol:C.plain,ls:NW?10:12});
  face("sia",x0+sz+gap+sz/2,y0-6,28,C.drop);face("moa",x0+2*(sz+gap)+sz/2,y0-6,28,C.plain);
  if(si===0){txt("세 도장은 눈으로 보면 거의 같아요",W/2,y0+sz+48,{a:"center",s:13,w:700,col:C.mute,al:ease(f*2)});return}
  if(si===1){txt("해밍 거리  vs  AI 모델",W/2,y0+sz+50,{a:"center",s:16,w:800,col:C.sum,al:ease(f*2)});return}
  const by=y0+sz+38,bw=NW?W-150:W*.4,bx=NW?84:(W-bw)/2+30;[["해밍 기준선",HD.hamming_test_acc,C.mute],["AI 모델",HD.model_test_acc,C.sum]].forEach(([n,v,col],i)=>{const y=by+i*34,al=ease(f*3-i*.6);txt(n,bx-12,y+15,{a:"right",s:12,w:800,al});c.fillStyle=col;c.globalAlpha=al;c.fillRect(bx,y,bw*v*al,22);c.globalAlpha=1;txt(fmt(v),bx+bw*v*al+6,y+16,{s:14,mono:1,w:800,col,al})});
  txt("어려운 판 · 시험 200장 정확도",W/2,by+82,{a:"center",s:11,col:C.mute,al:ease(f*2)})},
// 2 hamming easy
(si,f,T)=>{const NW=W<560;
  if(si===0){const pr=stampPr(T,{cx:W*.5,cy:H*.56});stamp3(pr,ORIG,{key:"o"});badge("박사님 얼굴 도장 (돋을새김)",W/2,24,{s:13,col:INK()});return}
  if(si===1){const sz=Math.min(H*.8,NW?W-40:W*.42),x=NW?(W-sz)/2:W*.08,y=(H-sz)/2;stamp2(ORIG,x,y,sz);const cs=sz/N;c.strokeStyle=C.grid;c.lineWidth=.5;for(let i=1;i<N;i++){c.beginPath();c.moveTo(x+i*cs,y);c.lineTo(x+i*cs,y+sz);c.stroke();c.beginPath();c.moveTo(x,y+i*cs);c.lineTo(x+sz,y+i*cs);c.stroke()}
    if(!NW){const tx=W*.62;txt("32 × 32 = 1,024점",tx,H*.36,{s:20,mono:1,w:800,col:C.sum,al:ease(f*2)});txt("잉크가 묻은 점 = 1",tx,H*.36+34,{s:14,w:700,col:INK(),al:ease(f*2)});txt("빈 점 = 0",tx,H*.36+58,{s:14,w:700,col:C.mute,al:ease(f*2)})}
    else badge("1,024점 · 잉크 = 1, 빈 점 = 0",W/2,16,{s:12,col:C.sum,al:ease(f*2)});return}
  if(si===2){const sz=Math.min(NW?(W-50)/3:W*.22,H*.62),gap=NW?12:28,x0=(W-(3*sz+2*gap))/2,y=(H-sz)/2-10;stamp2(ORIG,x0,y,sz,{label:"원본"});stamp2(EZ.sia,x0+sz+gap,y,sz,{label:"시아 포스터",lcol:C.drop});
    stamp2(EZ.sia,x0+2*(sz+gap),y,sz,{ref:ORIG,diff:1,label:`다른 점 ${EZ.sia_vs_original}`,lcol:C.sum});txt("=",x0+2*sz+gap*1.5,y+sz/2,{a:"center",s:18,w:800,col:C.mute});return}
  const pr=stampPr(T,{cx:NW?W*.5:W*.38,cy:H*.6,sp:.1}),grow=si===3?ease(f*1.6):1;stamp3(pr,EZ.moa,{key:"me",diff:ORIG,grow});
  const R=[[0,0,14,0,""]];if(!NW){const x=W*.72;txt("원본과 다른 점",x,H*.3,{s:13,w:800});txt(`시아 ${EZ.sia_vs_original}점`,x,H*.3+34,{s:20,mono:1,w:800,col:C.drop});txt(`모아 ${EZ.moa_vs_original}점`,x,H*.3+66,{s:20,mono:1,w:800,col:C.plain});
    if(si===4)txt("금색 기둥 = 흰 앞머리 줄 자리",x,H*.3+100,{s:12,w:700,col:C.sum,al:ease(f*2)})}else badge(`시아 ${EZ.sia_vs_original} · 모아 ${EZ.moa_vs_original}`,W/2,18,{s:13,col:C.sum})},
// 3 hard: hamming flips
(si,f,T)=>{const NW=W<560;
  if(si===0){const sz=Math.min(NW?(W-40)/2:W*.26,H*.66),gap=NW?14:40,x0=(W-(2*sz+gap))/2,y=(H-sz)/2-12;stamp2(ORIG,x0,y,sz,{label:"원본"});stamp2(HD.moa,x0+sz+gap,y,sz,{ref:ORIG,diff:f>.4?1:0,label:f>.4?`모아 위작 · 다른 점 ${HD.moa_vs_original}`:"모아 위작",lcol:C.plain});return}
  const m=hist(14,16,W-28,H-32,{grow:si===1?ease(f*1.5):1,title:"다른 점 수 (해밍 거리)  ·  파랑 진품 400장 · 빨강 위작 400장"});
  if(si>=2){const X=m.X(HD.threshold+1);c.save();c.setLineDash([6,4]);c.strokeStyle=C.sum;c.lineWidth=2;c.beginPath();c.moveTo(X,m.Y(0));c.lineTo(X,m.by);c.stroke();c.restore();
    badge(`기준선 ${HD.threshold}점 · 정확도 ${fmt(HD.hamming_test_acc)}`,Math.min(X+90,W-110),m.by+16,{s:12,col:C.sum,al:si===2?ease(f*2):1})}
  if(si>=3){[["sia",HD.sia_vs_original,C.drop,"시아 (진품)"],["moa",HD.moa_vs_original,C.plain,"모아 (위작)"]].forEach(([k,v,col,n],i)=>{const X=m.X(v+1),Y=m.by+60+i*44,al=ease(f*3-i*.6);c.globalAlpha=al;c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.moveTo(X,Y+14);c.lineTo(X,m.Y(0));c.stroke();c.globalAlpha=1;face(k,X,Y,28,col);
    const rt=NW?X>W/2:k!=="sia";txt(`${n} ${v}점 → 해밍 판정: ${v>HD.threshold?"위작":"진품"}`,X+(rt?-20:20),Y+5,{a:rt?"right":"left",s:NW?10:12,w:800,col,al})})}},
// 4 where & which way
(si,f,T)=>{const NW=W<560,g=si===0?null:HD.moa,show=(arr,x,y,sz,lab,lcol)=>{const n=arr.length,cs=sz/n;c.fillStyle=C.panel;c.fillRect(x,y,sz,sz);
    for(let r=0;r<n;r++)for(let q=0;q<n;q++){const o=ORIG[r][q],v=arr[r][q];if(o&&v){c.fillStyle=C.off;c.fillRect(x+q*cs,y+r*cs,cs,cs)}else if(v&&!o){c.fillStyle=C.sum;c.fillRect(x+q*cs,y+r*cs,cs,cs)}else if(!v&&o){c.fillStyle=C.vio;c.fillRect(x+q*cs,y+r*cs,cs,cs)}}
    c.strokeStyle=C.border;c.strokeRect(x,y,sz,sz);txt(lab,x+sz/2,y+sz+16,{a:"center",s:12,w:800,col:lcol})};
  const sz=Math.min(NW?(W-40)/2:W*.27,H*.62),gap=NW?12:46,x0=(W-(2*sz+gap))/2,y=NW?46:40;
  show(HD.sia,x0,y,sz,`시아 (진품) · ${HD.sia_vs_original}점`,C.drop);show(HD.moa,x0+sz+gap,y,sz,`모아 (위작) · ${HD.moa_vs_original}점`,C.plain);
  const ly=y+sz+34;[[C.sum,"원본보다 더 묻은 점"],[C.vio,"원본보다 빠진 점"],[C.off,"그대로인 잉크"]].forEach(([col,n],i)=>{const lx=NW?14+i*(W/3-4):W/2-260+i*180;c.fillStyle=col;c.fillRect(lx,ly-10,12,12);txt(n,lx+18,ly,{s:NW?10:12,w:700,al:si===0?ease(f*2):1})});
  if(si===2)badge(NW?"위작: 한쪽 더, 반대쪽 빠짐":"진품은 테두리가 고르게 두꺼워지거나 얇아지고, 위작은 한쪽만 더 묻고 반대쪽은 빠져요",W/2,22,{s:NW?11:12,col:C.sum,al:ease(f*2)})},
// 5 learning
(si,f,T)=>{const NW=W<560;
  if(si===0){const sz=Math.min(NW?W*.22:W*.14,H*.36),x=NW?14:W*.06,y=H*.24;[["더 묻은 점",C.sum],["빠진 점",C.vio]].forEach(([n,col],i)=>{const yy=y+i*(sz+30);c.fillStyle=C.panel;c.fillRect(x,yy,sz,sz);const cs=sz/N;for(let r=0;r<N;r++)for(let q=0;q<N;q++){const o=ORIG[r][q],v=HD.moa[r][q];if(i===0?v&&!o:!v&&o){c.fillStyle=col;c.fillRect(x+q*cs,yy+r*cs,cs,cs)}}c.strokeStyle=C.border;c.strokeRect(x,yy,sz,sz);txt(`${n} 1,024`,x+sz/2,yy+sz+14,{a:"center",s:10,w:700,col})});
    const mx=x+sz+(NW?30:70),mw=NW?W-mx-90:W*.26,my=H*.4;c.strokeStyle=C.mute;c.lineWidth=2;c.beginPath();c.moveTo(x+sz+8,H*.5);c.lineTo(mx-6,H*.5);c.stroke();panel(mx,my-20,mw,70);txt("로지스틱 회귀",mx+mw/2,my+8,{a:"center",s:NW?12:15,w:800,col:C.sum});txt("값 2,048개 → 점수 1개",mx+mw/2,my+30,{a:"center",s:NW?9:11,col:C.mute});
    c.beginPath();c.moveTo(mx+mw+6,H*.5);c.lineTo(mx+mw+(NW?24:50),H*.5);c.stroke();txt("위작일 확률",mx+mw+(NW?28:58),H*.5+5,{s:NW?11:14,w:800,col:C.plain,al:ease(f*2)});return}
  const LC=HD.learning_curve,lx=v=>Math.log2(v),m=chart(14,16,W-28,H-32,{title:"학습 장 수에 따른 시험 200장 정확도 (가로축은 2배씩)",xr:[lx(2)-.2,lx(600)+.2],yr:[.6,1.02],xt:[2,4,8,16,32,64,128,256,512].map(lx),yt:[.6,.7,.8,.9,1],xf:t=>String(Math.round(2**t)),pl:40});
  const k=si===1?Math.max(1,Math.ceil(LC.length*ease(f*1.3))):LC.length;pline(m,LC.slice(0,k).map(p=>lx(p[0])),LC.slice(0,k).map(p=>p[1]),C.sum,2.6);
  LC.slice(0,k).forEach(([n,a])=>{const X=m.X(lx(n)),Y=m.Y(a);c.fillStyle=C.sum;c.beginPath();c.arc(X,Y,4,0,7);c.fill()});
  c.save();c.setLineDash([5,4]);c.strokeStyle=C.mute;c.beginPath();c.moveTo(m.X(lx(2)),m.Y(HD.hamming_test_acc));c.lineTo(m.X(lx(600)),m.Y(HD.hamming_test_acc));c.stroke();c.restore();txt(`해밍 기준선 ${fmt(HD.hamming_test_acc)}`,m.X(lx(600))-4,m.Y(HD.hamming_test_acc)+14,{a:"right",s:10,w:700,col:C.mute});
  if(si===1){const [n,a]=LC[0];badge(`${n}장 → ${fmt(a)}`,m.X(lx(n))+60,m.Y(a)+4,{s:12,col:C.sum,al:ease(f*3)})}
  if(si===2){const p=LC.find(q=>q[0]===16);badge(`${p[0]}장 → ${fmt(p[1])}`,m.X(lx(16)),m.Y(p[1])+26,{s:12,col:C.sum,al:ease(f*2)})}
  if(si===3){badge(`600장 → ${fmt(HD.model_test_acc)} (200장 중 200장)`,m.X(lx(600))-120,m.Y(1)+28,{s:12,col:C.sum,al:ease(f*2)})}},
// 6 after: weights as bars
(si,f,T)=>{const NW=W<560;
  if(si===2&&NW){[["sia",HD.sia,HD.sia_forged_prob,C.drop,"시아","진품",HD.sia_vs_original],["moa",HD.moa,HD.moa_forged_prob,C.plain,"모아","위작",HD.moa_vs_original]].forEach(([k,g,p,col,n,v,h],i)=>{const sz=W*.36,x=i?W-14-sz:14,y=26,al=ease(f*3-i*.6);c.globalAlpha=al;
      stamp2(g,x,y,sz);face(k,x+sz-14,y+14,28,col);txt(`${n} 포스터 · 해밍 ${h}점`,x,y+sz+18,{s:11,w:800,col,al});txt(`위작 확률 ${fmt(p)}`,x,y+sz+40,{s:14,mono:1,w:800,col,al});badge(`모델 판정: ${v}`,x+sz/2,y+sz+70,{s:12,col,al});c.globalAlpha=1});return}
  if(si===2){const sz=Math.min(NW?W*.3:W*.16,H*.42);[["sia",HD.sia,HD.sia_forged_prob,C.drop,"시아 포스터","진품"],["moa",HD.moa,HD.moa_forged_prob,C.plain,"모아 포스터","위작"]].forEach(([k,g,p,col,n,v],i)=>{const x=NW?14+i*(W/2):W*.12+i*W*.42,y=H*.18,al=ease(f*3-i*.6);c.globalAlpha=al;
      stamp2(g,x,y,sz);face(k,x+sz+30,y+20,34,col);txt(n,x+sz+54,y+26,{s:13,w:800,col,al});txt(`해밍 ${i?HD.moa_vs_original:HD.sia_vs_original}점`,x+sz+(NW?14:54),y+sz*.55,{s:NW?11:13,mono:1,w:700,col:C.mute,al});
      txt(`위작 확률 ${fmt(p)}`,x,y+sz+30,{s:NW?14:18,mono:1,w:800,col,al});badge(`모델 판정: ${v}`,x+sz/2+(NW?10:40),y+sz+64,{s:13,col,al});c.globalAlpha=1});return}
  const S0=Math.min(NW?W*.022:W*.016,H*.024),pr=cam3(NW?W*.5:W*.42,H*.62,S0,T,{center:[16,0,16],pit:-.55,yaw:spin(T,.55,.12),dist:150}),wE=HD.weight_extra_ink,wM=HD.weight_missing_ink,k=si===0?ease(f*1.4):1;
  const base=[[0,0,0],[N,0,0],[N,0,N],[0,0,N]].map(v=>pr(...v));c.fillStyle=C.panel;c.beginPath();base.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();
  for(let r=0;r<N;r++)for(let q=0;q<N;q++)if(ORIG[r][q]){const P=[[q,0,r],[q+1,0,r],[q+1,0,r+1],[q,0,r+1]].map(v=>pr(...v));c.fillStyle=C.off;c.globalAlpha=.6;c.beginPath();P.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.globalAlpha=1}
  const bars=[];for(let r=0;r<N;r++)for(let q=0;q<N;q++){const w=wE[r][q]+wM[r][q];if(Math.abs(w)<.04)continue;const a=pr(q+.5,0,r+.5),b=pr(q+.5,w*14*k,r+.5);bars.push([a,b,w])}
  bars.sort((A,B)=>A[0][2]-B[0][2]);bars.forEach(([a,b,w])=>{c.strokeStyle=w>0?C.plain:C.drop;c.lineWidth=NW?2:3;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()});
  txt("기둥 높이 = 모델 가중치 (더 묻은 점 + 빠진 점)",14,22,{s:NW?10:12,w:800});txt("빨강: 위작 쪽 · 파랑: 진품 쪽 · 회색: 원본 잉크",14,40,{s:NW?10:11,col:C.mute});
  if(si===1)badge("잉크 경계를 따라 줄지어 선 기둥",W/2,H-20,{s:13,col:C.sum,al:ease(f*2)})},
// 7 figure: jaccard / dice
(si,f,T)=>{const NW=W<560,pr=figPr(T,{cx:NW?W*.5:W*.36,cy:NW?H*.34:H*.56,S:NW?Math.min(W*.022,H*.022):undefined});
  if(si===0){drawVox(pr,cached("fo",()=>voxFaces(VO.map(v=>[...v,C.drop]))));badge(`공식 모형 · 블록 ${OV.official_voxels.toLocaleString("en-US")}개`,NW?W/2:W*.36,20,{s:13,col:C.drop})}
  else{const other=si===1?SM:SS,oname=si===1?"모아 (정품)":"시아 (해적판)",ocol=si===1?C.plain:C.plain,R=si===1?OV.moa_vs_official:OV.sia_vs_official;
    const cells=cached("ov"+(si===1?"m":"s"),()=>{const cl=[],all=new Set([...SO,...other]);all.forEach(k=>{const x=Math.floor(k/4096),y=Math.floor(k/64)%64,z=k%64,a=SO.has(k),b=other.has(k);cl.push([x,y,z,a&&b?C.vio:a?C.drop:C.plain,a&&b?1:a?.35:1])});return voxFaces(cl)});
    drawVox(pr,cells);
    const x=NW?14:W*.66,y=NW?H-150:H*.22,al=ease(f*2.4);[[C.vio,`겹친 블록 ${R.inter.toLocaleString("en-US")}`],[C.drop,`공식에만 ${R.b-R.inter}`],[C.plain,`${oname}에만 ${R.a-R.inter}`]].forEach(([col,n],i)=>{c.fillStyle=col;c.globalAlpha=al;c.fillRect(x,y+i*22-10,12,12);c.globalAlpha=1;txt(n,x+18,y+i*22,{s:NW?10:12,w:700,al})});
    if(!NW||si>=2){const yy=NW?y+70:y+92;txt(`자카드 = ${R.inter} / ${R.union} = ${fmt(R.jaccard)}`,x,yy,{s:NW?11:14,mono:1,w:800,col:C.sum,al});if(si===3){txt(`다이스 = 2 × ${R.inter} / (${R.a} + ${R.b})`,x,yy+(NW?18:28),{s:NW?11:14,mono:1,w:800,col:C.cyan,al:ease(f*2)});txt(`= ${fmt(R.dice)}`,x,yy+(NW?36:56),{s:NW?13:18,mono:1,w:800,col:C.cyan,al:ease(f*2)})}}}},
// 8 code
(si,f,T)=>{const NW=W<560,cards=[["해밍","(stamp != original).sum()",`시아 ${EZ.sia_vs_original} · 모아 ${EZ.moa_vs_original}`,C.sum],["두 지도","extra, missing → 2,048개","더 묻은 점 · 빠진 점",C.vio],["AI 모델","LogisticRegression().fit",`정확도 ${fmt(HD.model_test_acc)}`,C.plain],["자카드","|A∩B| / |A∪B|",fmt(OV.sia_vs_official.jaccard),C.drop],["다이스","2|A∩B| / (|A|+|B|)",fmt(OV.sia_vs_official.dice),C.cyan]];
  const hi=[[0,1,2,3,4],[0],[1,2],[3,4]][si],cols=NW?2:3,cw=(W-28-(cols-1)*10)/cols,ch=NW?(H-40)/3-10:(H-50)/2-12;
  cards.forEach(([n,fm,v,col],i)=>{const x=14+(i%cols)*(cw+10),y=20+Math.floor(i/cols)*(ch+12),al=hi.includes(i)?1:.3;c.globalAlpha=al;panel(x,y,cw,ch);txt(n,x+12,y+24,{s:13,w:800,col,al});txt(fm,x+12,y+ch*.55,{s:NW?9:13,mono:1,w:600,col:C.mute,al});txt(v,x+12,y+ch-14,{s:NW?12:18,mono:1,w:800,col,al});c.globalAlpha=1})},
// 9 results
(si,f,T)=>{const NW=W<560,cw=NW?W-28:(W-48)/3,ch=NW?(H-48)/3:H-40;
  const cards=[["쉬운 판 · 해밍",[["시아 (진품)",EZ.sia_vs_original+"점",C.drop],["모아 (위작)",EZ.moa_vs_original+"점",C.plain]],"해밍만으로 충분"],["어려운 판 · 시험 200장",[["해밍 기준선",fmt(HD.hamming_test_acc),C.mute],["AI 모델",fmt(HD.model_test_acc),C.sum]],"모델이 필요"],["피규어 · 공식 모형과",[["모아 다이스",fmt(OV.moa_vs_official.dice),C.drop],["시아 다이스",fmt(OV.sia_vs_official.dice),C.plain]],"해적판이 가장 다름"]];
  cards.forEach(([t,rws,note],i)=>{const x=NW?14:14+i*(cw+10),y=NW?14+i*(ch+10):20,al=si===0?ease(f*3-i*.5):si===1?(i<2?1:.35):(i===2?1:.35);c.globalAlpha=al;panel(x,y,cw,ch);txt(t,x+12,y+22,{s:NW?11:13,w:800,al});
    rws.forEach(([n,v,col],j)=>{const yy=NW?y+42+j*18:y+70+j*60;txt(n,x+12,yy,{s:NW?10:12,col:C.mute,al});txt(v,NW?x+cw-14:x+12,NW?yy:yy+30,{a:NW?"right":"left",s:NW?14:26,mono:1,w:800,col,al})});
    txt(note,x+12,y+ch-12,{s:NW?10:12,w:700,col:C.sum,al});c.globalAlpha=1})},
// 10 summary
(si,f,T)=>{const NW=W<560,pr=figPr(T,{cx:NW?W*.5:W*.32,cy:NW?H*.62:H*.56,S:Math.min(NW?W*.024:W*.018,H*.024)});drawVox(pr,cached("fo",()=>voxFaces(VO.map(v=>[...v,C.drop]))));
  const L=si===0?["거리 = '같은 것인가'를 묻는 자","해밍 · 자카드 · 다이스 · AI 모델"]:si===1?["대가: 위작 예시가 있어야 배워요","처음 보는 수법에는 약할 수 있어요"]:["1부 6개 + 2부 3개 = 자 9개","조수 하루의 3차원 실험실 · EP.04"];
  L.forEach((s,i)=>{const al=ease(f*3-i*.7);NW?badge(s,W/2,20+i*30,{s:12,col:i?C.ink:C.sum,al}):badge(s,W*.72,H*.34+i*50,{s:14,col:i?C.ink:C.sum,al})})}
];

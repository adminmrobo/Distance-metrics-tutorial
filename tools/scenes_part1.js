/* ---------- EP.04 1부 · 공간 속 거리 : 장면 (si = 대사 번호, f = 대사 안 진행도 0~1, T = 파트 안 초) ---------- */
const SIA=D.position.sia,MOA=D.position.moa,DL=D.position.delta,MK=D.position.minkowski;
const FACE={};["sia","moa"].forEach(k=>{const im=new Image();im.src=HARU[k];FACE[k]=im});
const fmt=(v,n=3)=>Number(v).toFixed(n);
const km=v=>Math.round(v).toLocaleString("en-US")+" km";
const mink=(v,p)=>Math.pow(v.reduce((a,x)=>a+Math.pow(Math.abs(x),p),0),1/p);

/* ---- 3D 도우미 ---- */
function line3(pr,a,b,col,lw=2,o={}){const A=pr(...a),B=pr(...b);c.save();if(o.dash)c.setLineDash(o.dash===true?[5,4]:o.dash);c.globalAlpha=o.al??1;c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();c.restore()}
function path3(pr,pts,col,lw,t=1,o={}){let L=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(...pts[i].map((v,k)=>v-pts[i-1][k]));seg.push(d);L+=d}
  let rest=L*Math.max(0,Math.min(1,t)),end=pts[0];c.save();if(o.dash)c.setLineDash([5,4]);c.globalAlpha=o.al??1;c.strokeStyle=col;c.lineWidth=lw;c.lineJoin="round";c.beginPath();let p=pr(...pts[0]);c.moveTo(p[0],p[1]);
  for(let i=1;i<pts.length&&rest>0;i++){const k=Math.min(1,rest/seg[i-1]);end=pts[i-1].map((v,j)=>v+(pts[i][j]-v)*k);p=pr(...end);c.lineTo(p[0],p[1]);rest-=seg[i-1]}c.stroke();c.restore();return end}
function arrow3(pr,a,b,col,lw=3,o={}){line3(pr,a,b,col,lw,o);const A=pr(...a),B=pr(...b),ang=Math.atan2(B[1]-A[1],B[0]-A[0]),h=o.head||10;c.globalAlpha=o.al??1;c.fillStyle=col;c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(B[0]-h*Math.cos(ang-.42),B[1]-h*Math.sin(ang-.42));c.lineTo(B[0]-h*Math.cos(ang+.42),B[1]-h*Math.sin(ang+.42));c.fill();c.globalAlpha=1}
function lab3(pr,v,s,o={}){const p=pr(...v);if(o.badge)badge(s,p[0]+(o.dx||0),p[1]+(o.dy||0),{s:o.s||12,col:o.col,al:o.al});else txt(s,p[0]+(o.dx||0),p[1]+(o.dy||0),{a:o.a||"center",s:o.s||11,w:o.w||800,col:o.col||C.ink,mono:o.mono,al:o.al})}
/* 좌표 축: 축마다 길이가 다르다 (x 주황빨강, y 초록 위, z 파랑 — 오른손 좌표계) */
function axesR(pr,L,o={}){const [lx,ly,lz]=L;c.lineWidth=1;
  for(let i=0;i<=lx;i++){c.strokeStyle=i%2?C.grid:C.border;c.globalAlpha=i%2?.6:1;const a=pr(i,0,0),b=pr(i,0,lz);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}
  for(let i=0;i<=lz;i++){c.strokeStyle=i%2?C.grid:C.border;c.globalAlpha=i%2?.6:1;const a=pr(0,0,i),b=pr(lx,0,i);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}c.globalAlpha=1;
  const names=o.names||["x","y","z"];
  [[names[0],[lx+1.6,0,0],C.X,0,lx],[names[1],[0,ly+1.6,0],C.Y,1,ly],[names[2],[0,0,lz+1.6],C.Z,2,lz]].forEach(([n,e,col,k,len])=>{arrow3(pr,[0,0,0],e,col,2.4,{head:9});const p=pr(...e),q=pr(...e.map(v=>v?v-.9:0)),ang=Math.atan2(p[1]-q[1],p[0]-q[0]);
    txt(n,p[0]+12*Math.cos(ang),p[1]+12*Math.sin(ang)+4,{a:"center",s:o.ns||14,w:800,col});
    if(o.ticks!==false)for(let t=2;t<=len;t+=2){const v=[0,0,0];v[k]=t;const P2=pr(...v);txt(String(t),P2[0]+(k===1?-10:0),P2[1]+(k===1?4:14),{a:"center",s:9,mono:1,w:600,col,al:.9})}});
  if(o.origin!==false){const o0=pr(0,0,0);txt("(0, 0, 0)",o0[0]-6,o0[1]+16,{a:"right",s:10,mono:1,w:600,col:C.mute})}}
function face(k,x,y,s,col){const im=FACE[k];c.save();c.beginPath();c.arc(x,y,s/2,0,7);c.closePath();c.fillStyle=C.panel;c.fill();if(im&&im.complete&&im.naturalWidth){c.clip();c.drawImage(im,x-s/2,y-s/2,s,s)}c.restore();c.strokeStyle=col;c.lineWidth=2.4;c.beginPath();c.arc(x,y,s/2,0,7);c.stroke()}
/* 2층 방 (축 x 0~14, y 0~6, z 0~12)과 시아·모아 */
function room(T,o={}){const NW=W<560,S=o.S||(NW?Math.min(W*.036,H*.04):Math.min(W*.034,H*.054)),pr=cam3(NW?W*.47:(o.cx??W*.4)+S*2.2,NW?(o.ncy??H*.5):(o.cy??H*.6)-S*.6,S,T,{center:[8,2.5,6],pit:-.5,yaw:.62,dist:80,...o.cam});axesR(pr,[14,7,12]);return pr}
function people(pr,o={}){const fs=o.fs||Math.max(30,Math.min(46,W*.05));
  // 모아의 공중 발판
  const m=MOA,q=[[-1.1,-1.1],[1.1,-1.1],[1.1,1.1],[-1.1,1.1]].map(([a,b])=>pr(m[0]+a,m[1],m[2]+b));c.globalAlpha=.85;c.fillStyle=C.panel;c.beginPath();q.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fill();c.strokeStyle=C.border;c.lineWidth=1.4;c.stroke();c.globalAlpha=1;
  line3(pr,[m[0],0,m[2]],m,C.dash,1.2,{dash:true});
  [[SIA,"sia",C.plain,"시아"],[MOA,"moa",C.drop,"모아"]].forEach(([v,k,col,name])=>{const p=pr(...v);c.fillStyle=col;c.beginPath();c.arc(p[0],p[1],5,0,7);c.fill();
    const fy=p[1]-fs*.5-14;line3(pr,v,v,col,1);c.strokeStyle=col;c.lineWidth=1.4;c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(p[0],fy+fs/2);c.stroke();face(k,p[0],fy,fs,col);
    if(o.coords!==false)txt(`${name} (${v.join(", ")})`,p[0]+(k==="sia"?-fs*.55:fs*.55),fy-fs*.5-4,{a:k==="sia"?"right":"left",s:12,w:800,col,mono:0})})}
const MAN=[SIA,[MOA[0],SIA[1],SIA[2]],[MOA[0],SIA[1],MOA[2]],MOA];          // x → z → y 로 꺾어 걷기
const CHEB=[SIA,[MOA[0],SIA[1],SIA[2]]];                                  // 가장 많이 움직인 축 (x, 8)
function rows(x,y,w,items,o={}){const rh=o.rh||30;items.forEach((it,i)=>{const al=it.al??1;if(al<=0)return;c.globalAlpha=al;const yy=y+i*rh;c.fillStyle=it.col;c.fillRect(x,yy-10,6,18);txt(it.name,x+14,yy+4,{s:o.s||13,w:700,col:C.ink,al});txt(it.val,x+w,yy+4,{a:"right",s:(o.s||13)+2,mono:1,w:800,col:it.col,al});c.globalAlpha=1})}
function wrap(s,x,y,w,o={}){c.font=`${o.w||500} ${o.s||12}px 'Pretendard','Noto Sans KR',system-ui,sans-serif`;let line="",yy=y;const lh=(o.s||12)*1.45;[...s].forEach(ch=>{if(c.measureText(line+ch).width>w&&line){txt(line,x,yy,o);line="";yy+=lh}line+=ch});if(line)txt(line,x,yy,o);return yy+lh}
/* 민코프스키 '거리 1인 면' 철사 모형 */
function ball(pr,p,col,al=1){const se=(a,t)=>{const u=Math.cos(t),v=Math.sin(t),r=a*Math.pow(Math.pow(Math.abs(u),p)+Math.pow(Math.abs(v),p),-1/p);return[u*r,v*r]};
  const lv=[-.85,-.6,-.3,0,.3,.6,.85],N=96;c.lineWidth=1.3;
  const loop=f=>{let prev=null;for(let i=0;i<=N;i++){const q=pr(...f(i/N*Math.PI*2));if(prev){c.globalAlpha=al*((prev[2]+q[2])/2>-0.02?1:.22);c.strokeStyle=col;c.beginPath();c.moveTo(prev[0],prev[1]);c.lineTo(q[0],q[1]);c.stroke()}prev=q}};
  // 가로 단면(y = 일정)과 세로 단면(x = 일정): |x|ᵖ + |y|ᵖ + |z|ᵖ = 1 을 자른 초타원
  lv.forEach(y0=>{const a=Math.pow(Math.max(0,1-Math.pow(Math.abs(y0),p)),1/p);if(a>1e-3)loop(t=>{const [u,v]=se(a,t);return[u,y0,v]})});
  lv.forEach(x0=>{const a=Math.pow(Math.max(0,1-Math.pow(Math.abs(x0),p)),1/p);if(a>1e-3)loop(t=>{const [u,v]=se(a,t);return[x0,u,v]})});
  c.globalAlpha=1}
/* 코사인 장면의 후기 벡터 (x 표정, y 도색, z 배송) */
const RV=D.cosine.vectors,RN=D.cosine.names,GROUP={"시아":0,"모아":0,"초파리":1,"박사":1,"주판봇":2,"X1":2},GN=["표정 묶음","도색 묶음","배송 묶음"];
const gcol=g=>[C.sum,C.vio,C.cyan][g];
function revAxes(T,o={}){const S=o.S||Math.min(W*.06,H*.1),pr=cam3(o.cx??W*.36,o.cy??H*.64,S,T,{center:[3,1.5,1.5],pit:-.42,yaw:.55,dist:40});axesR(pr,[7,3,3],{names:["표정 x","도색 y","배송 z"],ns:12,ticks:false});
  for(let t=1;t<=7;t++){const p=pr(t,0,0);txt(String(t),p[0],p[1]+14,{a:"center",s:9,mono:1,col:C.X})}for(let t=1;t<=3;t++){let p=pr(0,t,0);txt(String(t),p[0]-10,p[1]+4,{a:"center",s:9,mono:1,col:C.Y});p=pr(0,0,t);txt(String(t),p[0],p[1]+14,{a:"center",s:9,mono:1,col:C.Z})}return pr}
/* 지구본 */
const GEO=D.globe,R_E=6371;
const ll=(lat,lon,r=1)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return[r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b)]};
function slerp(a,b,t){const d=Math.acos(Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]))),s=Math.sin(d);return a.map((v,i)=>(Math.sin((1-t)*d)*v+Math.sin(t*d)*b[i])/s)}
function globe(cx,cy,R,T,o={}){const pr=cam3(cx,cy,R,0,{center:[0,0,0],pit:o.pit??-.55,yaw:(o.yaw??2.55)+(REDUCE?0:.18*Math.sin(T*.35)),dist:7});
  c.fillStyle=C.panel;c.beginPath();c.arc(cx,cy,R*1.0,0,7);c.fill();c.strokeStyle=C.border;c.lineWidth=1.4;c.stroke();
  const seg=(f,col,lw,al)=>{let prev=null;for(let i=0;i<=72;i++){const q=pr(...f(i/72));if(prev){c.globalAlpha=al*((prev[2]+q[2])/2>0?1:.18);c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(prev[0],prev[1]);c.lineTo(q[0],q[1]);c.stroke()}prev=q}c.globalAlpha=1};
  for(let lat=-60;lat<=60;lat+=30)seg(t=>ll(lat,t*360),lat===0?C.mute:C.grid,lat===0?1.4:1,1);for(let lon=0;lon<360;lon+=30)seg(t=>ll(-90+t*180,lon),C.grid,1,1);
  return{pr,seg}}

/* 시아·모아 이름표가 붙은 결과 여섯 줄 */
const RES=()=>[{name:"유클리드 (직선)",val:fmt(D.position.euclidean),col:C.sum},{name:"맨해튼 (격자 따라)",val:fmt(D.position.manhattan,0),col:C.vio},{name:"체비쇼프 (가장 큰 축)",val:fmt(D.position.chebyshev,0),col:C.cyan},
  {name:"민코프스키 p = 3",val:fmt(MK["3"]),col:C.ink},{name:"코사인 (후기)",val:fmt(D.cosine.sia_moa_cos),col:C.drop},{name:"하버사인 (서울–런던)",val:km(GEO.haversine_km),col:C.plain}];

const S=[
// 1 intro: 답이 여섯 개
(si,f,T)=>{const NW=W<560,pr=room(T,{cx:W*.36,cy:H*.6,ncy:si===0?H*.52:H*.42});
  const al=si===0?.25:.55;path3(pr,[SIA,MOA],C.sum,2.4,1,{al});path3(pr,MAN,C.vio,2.4,1,{al});path3(pr,CHEB,C.cyan,3,1,{al});people(pr,{coords:si===0});
  if(si===0){const m=pr(...SIA.map((v,i)=>(v+MOA[i])/2));badge("얼마나 멀까?",m[0],m[1]-30,{s:14,col:C.sum,al:ease(f*3)});return}
  const items=RES().map((it,i)=>({...it,al:si===1?ease(f*3.2-i*.45):1}));
  if(NW){const sh=["유클리드","맨해튼","체비쇼프","민코프스키 p=3","코사인","하버사인"];items.forEach((it,i)=>it.name=sh[i]);rows(14,H-70,W/2-24,items.slice(0,3),{s:10,rh:20});rows(W/2+6,H-70,W/2-20,items.slice(3),{s:10,rh:20});return}
  const x=W*.66,w=W-x-18;panel(x-12,22,w+24,items.length*34+30);txt("시아 ↔ 모아",x,44,{s:13,w:800,col:C.mute});rows(x,72,w,items,{rh:34})},
// 2 euclid
(si,f,T)=>{const NW=W<560,pr=room(T,{cx:W*.38,cy:H*.6,ncy:H*.56});
  const [a,b,d]=[SIA,MOA,DL],c1=[b[0],a[1],a[2]],c2=[b[0],a[1],b[2]];
  if(si>=1){const al=si===1?ease(f*2):.85;line3(pr,a,c1,C.X,2.6,{al});line3(pr,c1,c2,C.Z,2.6,{al});line3(pr,c2,b,C.Y,2.6,{al});
    lab3(pr,[(a[0]+c1[0])/2,0,a[2]+.9],`Δx = ${d[0]}`,{col:C.X,s:12,al,mono:1});lab3(pr,[c1[0]+1.2,0,(c1[2]+c2[2])/2],`Δz = ${d[2]}`,{col:C.Z,s:12,al,mono:1,a:"left"});lab3(pr,[c2[0]+.7,b[1]/2,c2[2]],`Δy = ${d[1]}`,{col:C.Y,s:12,al,mono:1,a:"left"})}
  if(si>=3)path3(pr,[a,b],C.sum,3.4,ease(f*1.5));people(pr);
  if(si>=3&&f>.55){const m=pr(...a.map((v,i)=>(v+b[i])/2));badge(`d = ${fmt(D.position.euclidean)}`,m[0],m[1]-16,{s:14,col:C.sum})}
  if(si>=2&&!NW){const x=W*.7,al=si===2?ease(f*2):1;c.globalAlpha=al;txt("유클리드 거리",x,46,{s:13,w:800,col:C.sum,al});
    txt("√( Δx² + Δy² + Δz² )",x,76,{s:15,mono:1,w:700,al});txt(`= √( ${d[0]}² + ${d[1]}² + (${d[2]})² )`,x,104,{s:14,mono:1,w:600,col:C.mute,al});
    txt(`= √( ${d[0]**2} + ${d[1]**2} + ${d[2]**2} ) = √${d[0]**2+d[1]**2+d[2]**2}`,x,130,{s:14,mono:1,w:600,col:C.mute,al});if(si>=3)txt(`= ${fmt(D.position.euclidean)}`,x,166,{s:26,mono:1,w:800,col:C.sum,al:ease(f*2)});c.globalAlpha=1}
  if(si>=2&&NW)badge(si>=3?`√98 = ${fmt(D.position.euclidean)}`:"√(8² + 5² + (−3)²)",W/2,22,{s:13,col:C.sum,al:ease(f*2)})},
// 3 manhattan + chebyshev
(si,f,T)=>{const NW=W<560,pr=room(T,{cx:W*.38,cy:H*.6,ncy:si===3?H*.4:H*.5});
  path3(pr,[SIA,MOA],C.sum,2,1,{al:.35,dash:1});
  if(si===0){const t=(T*.22)%1,p=path3(pr,MAN,C.vio,2.6,t),q=pr(...p);c.fillStyle=C.vio;c.beginPath();c.arc(q[0],q[1],6,0,7);c.fill()}
  if(si>=1){path3(pr,MAN,C.vio,3.2,si===1?ease(f*1.4):1);const al=si===1?ease(f*2-.6):1;lab3(pr,[8,0,10.9],"8",{col:C.vio,s:13,mono:1,al});lab3(pr,[12.9,0,8.5],"3",{col:C.vio,s:13,mono:1,al,a:"left"});lab3(pr,[12.6,2.6,7],"5",{col:C.vio,s:13,mono:1,al,a:"left"});
    if(si===1&&f>.6){const m=pr(12,0,10);badge("8 + 5 + 3 = 16",m[0],m[1]+30,{s:13,col:C.vio})}}
  if(si>=2){path3(pr,CHEB,C.cyan,6,si===2?ease(f*1.6):1,{al:.85});if(si===2&&f>.5){const m=pr(8,0,10);badge("max(8, 5, 3) = 8",m[0],m[1]+28,{s:13,col:C.cyan})}}
  people(pr,{coords:false});
  if(si===3){const x=NW?16:W*.68,w=NW?W-32:W-x-20,y0=NW?H-98:60,bh=NW?18:26,gap=NW?26:44;if(!NW)txt("같은 두 사람, 자 세 개",x,y0-24,{s:13,w:800});
    [["체비쇼프",D.position.chebyshev,C.cyan],["유클리드",D.position.euclidean,C.sum],["맨해튼",D.position.manhattan,C.vio]].forEach(([n,v,col],i)=>{const y=y0+i*gap,al=ease(f*3-i*.5),bw=(w-90)*v/16*al;
      txt(n,x,y+bh*.7,{s:NW?11:12,w:700,al});c.fillStyle=col;c.globalAlpha=al;c.fillRect(x+62,y,bw,bh);c.globalAlpha=1;txt(i===1?fmt(v):fmt(v,0),x+66+bw,y+bh*.75,{s:NW?11:13,mono:1,w:800,col,al})})}},
// 4 minkowski
(si,f,T)=>{const NW=W<560;let p;if(si===0)p=2;else if(si===1)p=1+.5+.5*Math.sin(T*1.6-Math.PI/2);else if(si===2)p=2+6*ease(f*1.2);else{const u=(T*.18)%1;p=u<.5?1+7*ease(u*2):8-7*ease(u*2-1)}
  const R=Math.min(NW?W*.26:W*.17,H*.3),cx=NW?W*.5:W*.25,cy=NW?H*.34:H*.52,pr=cam3(cx,cy,R,T,{center:[0,0,0],pit:-.42,yaw:.7,dist:30});
  [[1.5,0,0,C.X,"x"],[0,1.5,0,C.Y,"y"],[0,0,1.5,C.Z,"z"]].forEach(([a,b,d,col,n])=>{arrow3(pr,[-1.5*(a?1:0),-1.5*(b?1:0),-1.5*(d?1:0)].map(v=>v*0),[a,b,d],col,1.6,{head:7});lab3(pr,[a*1.12,b*1.12,d*1.12],n,{col,s:12})});
  ball(pr,p,C.sum,.95);
  const nm=p<1.15?"정팔면체 (맨해튼)":Math.abs(p-2)<.15?"공 (유클리드)":p>7.2?"정육면체에 가까움 (체비쇼프)":"";txt(`p = ${p.toFixed(2)}`,14,26,{s:16,mono:1,w:800,col:C.sum});if(nm)txt(nm,14,44,{s:12,w:700,col:C.mute});
  txt("원점에서 거리가 1인 점들",cx,cy+R*1.55,{a:"center",s:11,w:700,col:C.mute});
  const x0=NW?14:W*.5,y0=NW?H*.62:22,w=NW?W-28:W-x0-14,h=NW?H*.36:H-44;
  const m=chart(x0,y0,w,h,{title:NW?"":"시아 ↔ 모아, p에 따른 거리",xr:[1,8],yr:[7,17],xt:[1,2,3,4,5,6,7,8],yt:[8,10,12,14,16],xf:t=>"p="+t,pl:30});
  c.save();c.setLineDash([5,4]);c.strokeStyle=C.cyan;c.beginPath();c.moveTo(m.X(1),m.Y(8));c.lineTo(m.X(8),m.Y(8));c.stroke();c.restore();txt("체비쇼프 8",m.X(8)-4,m.Y(8)-6,{a:"right",s:10,w:700,col:C.cyan});
  const xs=[],ys=[];for(let q=1;q<=8.001;q+=.05){xs.push(q);ys.push(mink(DL,q))}pline(m,xs,ys,C.sum,2.4);
  Object.entries(MK).forEach(([k,v])=>{const X=m.X(+k),Y=m.Y(v);c.fillStyle=C.sum;c.beginPath();c.arc(X,Y,3.5,0,7);c.fill();if(!NW&&(k==="1"||k==="2"||k==="3"))txt(fmt(v),X+6,Y-6,{s:10,mono:1,w:700,col:C.sum})});
  const X=m.X(p),Y=m.Y(mink(DL,p));c.strokeStyle=C.ink;c.lineWidth=2;c.beginPath();c.arc(X,Y,6,0,7);c.stroke();badge(fmt(mink(DL,p)),Math.min(X+34,m.bx+m.bw-30),Y-18,{s:12,col:C.sum})},
// 5 cosine: 시아·모아 후기
(si,f,T)=>{const NW=W<560,pr=revAxes(T,{cx:NW?W*.5:W*.33,cy:NW?H*.6:H*.66,S:NW?Math.min(W*.085,H*.08):undefined}),a=RV["시아"],b=RV["모아"];
  if(si>=1){const al=si===1?ease(f*2):1;arrow3(pr,[0,0,0],a,C.plain,3.2,{al});arrow3(pr,[0,0,0],b,C.drop,3.2,{al});lab3(pr,a,`시아 (${a.join(", ")})`,{col:C.plain,s:12,dy:-12,al});lab3(pr,b,`모아 (${b.join(", ")})`,{col:C.drop,s:12,dy:-12,al})}
  if(si===2){line3(pr,a,b,C.mute,2,{dash:true,al:ease(f*2)});const m=pr(...a.map((v,i)=>(v+b[i])/2));badge(`끝과 끝 ${fmt(D.cosine.sia_moa_euclid)}`,m[0],m[1]+22,{s:12,col:C.mute,al:ease(f*2)})}
  if(si===3){const r=2.6,A=a.map(v=>v/Math.hypot(...a)*r),B=b.map(v=>v/Math.hypot(...b)*r);let prev=null;for(let i=0;i<=24;i++){const t=i/24,ang=Math.atan2(A[1],A[0])*(1-t)+Math.atan2(B[1],B[0])*t,q=pr(Math.cos(ang)*1.4,Math.sin(ang)*1.4,0);if(prev){c.strokeStyle=C.sum;c.lineWidth=2.4;c.beginPath();c.moveTo(prev[0],prev[1]);c.lineTo(q[0],q[1]);c.stroke()}prev=q}
    let pv=null;for(let i=0;i<=40;i++){const ang=i/40*Math.PI/2,q=pr(Math.cos(ang)*r,Math.sin(ang)*r,0);if(pv){c.strokeStyle=C.dash;c.lineWidth=1;c.setLineDash([4,4]);c.beginPath();c.moveTo(pv[0],pv[1]);c.lineTo(q[0],q[1]);c.stroke();c.setLineDash([])}pv=q}
    [A,B].forEach((v,i)=>{const q=pr(...v);c.fillStyle=i?C.drop:C.plain;c.beginPath();c.arc(q[0],q[1],5,0,7);c.fill()});const q=pr(1.9,.45,0);badge(`θ = ${D.cosine.sia_moa_angle_deg}°`,q[0]+30,q[1]-8,{s:12,col:C.sum,al:ease(f*2)});
    txt("길이를 같게 맞춘 화살표 (반지름 고정)",NW?W/2:W*.33,H-14,{a:"center",s:11,w:700,col:C.mute,al:ease(f*2)})}
  if(!NW){const x=W*.64,w=W-x-16;[["시아",C.plain,24],["모아",C.drop,si>=1?24+Math.min(140,H*.32):24+Math.min(140,H*.32)]].forEach(([n,col,y])=>{txt(n+"의 후기",x,y+14,{s:12,w:800,col});const end=wrap(D.cosine.reviews[n],x,y+34,w,{s:12,w:500,col:C.ink});
      txt(`표정 ${RV[n][0]} · 도색 ${RV[n][1]} · 배송 ${RV[n][2]}`,x,end+4,{s:12,mono:1,w:800,col})});
    txt("하루 연구실 가상 상품 · 예시 후기",x,H-14,{s:10,col:C.mute});
    if(si===3)badge(`cos θ = ${fmt(D.cosine.sia_moa_cos)}`,x+w/2,H-46,{s:16,col:C.sum,al:ease(f*2)})}
  else if(si===3)badge(`cos θ = ${fmt(D.cosine.sia_moa_cos)}`,W/2,22,{s:14,col:C.sum,al:ease(f*2)})},
// 6 cosine groups
(si,f,T)=>{const NW=W<560;if(si===2&&NW){cmat(14,30,W-28);return}
  const pr=revAxes(T,{cx:si===2?W*.27:NW?W*.5:W*.42,cy:NW?H*.6:H*.64,S:Math.min(si===2?W*.045:W*.07,H*.09)});
  RN.forEach((n,i)=>{const v=RV[n],g=GROUP[n],al=si===0?ease(f*3-i*.35):1,col=si===0?C.mute:gcol(g);arrow3(pr,[0,0,0],v,col,2.8,{al});lab3(pr,v,n,{col,s:11,dy:-10,al})});
  if(si>=1&&!(si===2)){const x=NW?14:W*.76;GN.forEach((g,i)=>{const y=NW?20+i*18:60+i*30;c.fillStyle=gcol(i);c.fillRect(x,y-9,12,12);txt(g,x+18,y+2,{s:NW?11:13,w:800,col:gcol(i),al:si===1?ease(f*3-i*.4):1})})}
  if(si===2)cmat(W*.54,30,W*.44)},
// 7 haversine
(si,f,T)=>{const NW=W<560,R=Math.min(NW?W*.36:W*.24,H*.36),cx=NW?W*.5:W*.3,cy=NW?H*.42:H*.52,{pr,seg}=globe(cx,cy,R,T);
  const A=ll(...GEO.sia),B=ll(...GEO.moa);
  if(si>=1)seg(t=>slerp(A,B,Math.min(t,si===1?ease(f*1.4):1)),C.vio,3.4,1);
  if(si>=2)line3(pr,A,B,C.mute,2,{dash:true,al:ease(f*2)});
  [[A,"시아 · 서울",C.plain,"sia"],[B,"모아 · 런던",C.drop,"moa"]].forEach(([v,n,col,k])=>{const q=pr(...v);c.fillStyle=col;c.beginPath();c.arc(q[0],q[1],5.5,0,7);c.fill();face(k,q[0]+(k==="sia"?26:-26),q[1]-26,30,col);if(NW)txt(k==="sia"?"서울":"런던",q[0],q[1]+18,{a:"center",s:11,w:800,col});else txt(n,q[0]+(k==="sia"?44:-44),q[1]-20,{a:k==="sia"?"left":"right",s:12,w:800,col})});
  const x=NW?16:W*.6,y=NW?H*.84:H*.3;
  if(si>=1){txt("지구 표면을 따라 (하버사인)",x,y,{s:NW?11:13,w:800,col:C.vio,al:ease(f*2)});txt(km(GEO.haversine_km),x,y+(NW?20:34),{s:NW?18:28,mono:1,w:800,col:C.vio,al:ease(f*2)})}
  if(si>=2){const x2=NW?W*.52:x,y2=NW?y:y+80;txt("지구 속 직선",x2,y2,{s:NW?11:13,w:800,col:C.mute,al:ease(f*2)});txt(km(GEO.straight_through_km),x2,y2+(NW?20:34),{s:NW?18:28,mono:1,w:800,col:C.mute,al:ease(f*2)});
    if(!NW)txt(`차이 약 ${Math.round((GEO.haversine_km-GEO.straight_through_km)/100)*100} km · 반지름 6,371 km로 계산`,x,y2+62,{s:11,col:C.mute,al:ease(f*2)})}},
// 8 code
(si,f,T)=>{const NW=W<560,d=DL;
  if(si===0){const cards=[["유클리드","√Σ Δ²",fmt(D.position.euclidean),C.sum],["맨해튼","Σ |Δ|","16",C.vio],["체비쇼프","max |Δ|","8",C.cyan],["민코프스키","(Σ|Δ|ᵖ)^(1/p)",fmt(MK["3"])+" (p=3)",C.ink],["코사인","a·b / (|a||b|)",fmt(D.cosine.sia_moa_cos),C.drop],["하버사인","2r·asin √h",km(GEO.haversine_km),C.plain]];
    const cols=NW?2:3,cw=(W-28-(cols-1)*10)/cols,ch=NW?(H-40)/3-10:(H-50)/2-12;cards.forEach(([n,fm,v,col],i)=>{const x=14+(i%cols)*(cw+10),y=20+Math.floor(i/cols)*(ch+12),al=ease(f*3-i*.3);c.globalAlpha=al;panel(x,y,cw,ch);txt(n,x+12,y+24,{s:13,w:800,col,al});txt(fm,x+12,y+ch*.55,{s:NW?11:14,mono:1,w:600,col:C.mute,al});txt(v,x+12,y+ch-14,{s:NW?14:20,mono:1,w:800,col,al});c.globalAlpha=1});return}
  if(si===1){const x=20,bw=Math.min(52,W*.08),base=H-50,sc=(H-110)/64;txt("Δ = (8, 5, −3)",x,26,{s:14,mono:1,w:800});
    d.forEach((v,i)=>{const X=x+i*(bw+18),h=Math.abs(v)**2*sc;c.fillStyle=[C.X,C.Y,C.Z][i];c.globalAlpha=.85;c.fillRect(X,base-h,bw,h);c.globalAlpha=1;txt(`${v}² = ${v*v}`,X+bw/2,base+16,{a:"center",s:11,mono:1,w:700,col:[C.X,C.Y,C.Z][i]})});
    const x2=x+3*(bw+18)+20;[["√(64 + 25 + 9) = √98",fmt(D.position.euclidean),C.sum],["8 + 5 + 3","16",C.vio],["max(8, 5, 3)","8",C.cyan]].forEach(([e,v,col],i)=>{const y=60+i*(NW?42:56),al=ease(f*3-i*.6);txt(e,x2,y,{s:NW?11:14,mono:1,w:600,col:C.mute,al});txt("= "+v,x2,y+(NW?18:24),{s:NW?14:18,mono:1,w:800,col,al})});return}
  if(si===2){const a=RV["시아"],b=RV["모아"],x=20;txt("a = 시아 (2, 1, 0)   b = 모아 (6, 2, 0)",x,30,{s:NW?11:14,mono:1,w:700});
    const st=[["a · b = 2×6 + 1×2 + 0×0","14",C.ink],["|a| = √(4 + 1 + 0) = √5",fmt(Math.hypot(...a)),C.plain],["|b| = √(36 + 4 + 0) = √40",fmt(Math.hypot(...b)),C.drop],["cos θ = 14 / (2.236 × 6.325)",fmt(D.cosine.sia_moa_cos),C.sum]];
    st.forEach(([e,v,col],i)=>{const y=70+i*(NW?44:(H-100)/4),al=ease(f*3.4-i*.7);txt(e,x,y,{s:NW?11:15,mono:1,w:600,col:C.mute,al});txt("= "+v,NW?x:W*.62,y+(NW?18:0),{s:NW?14:20,mono:1,w:800,col,al})});return}
  const r=Math.PI/180,[p1,l1]=GEO.sia,[p2,l2]=GEO.moa,dp=(p2-p1)*r,dl=(l2-l1)*r,h=Math.sin(dp/2)**2+Math.cos(p1*r)*Math.cos(p2*r)*Math.sin(dl/2)**2,x=20;
  const st=[[`서울 (${p1}°, ${l1}°) · 런던 (${p2}°, ${l2}°)`,"",C.ink],[`Δφ = ${(p2-p1).toFixed(3)}°,  Δλ = ${(l2-l1).toFixed(3)}°`,"",C.mute],[`h = sin²(Δφ/2) + cos φ₁ cos φ₂ sin²(Δλ/2)`,fmt(h,4),C.ink],[`d = 2 × 6371 × asin(√h)`,km(2*R_E*Math.asin(Math.sqrt(h))),C.vio]];
  st.forEach(([e,v,col],i)=>{const y=40+i*(NW?46:(H-70)/4),al=ease(f*3.4-i*.7);txt(e,x,y,{s:NW?10:14,mono:1,w:600,col:i?C.mute:C.ink,al});if(v)txt("= "+v,NW?x:W*.66,y+(NW?18:0),{s:NW?14:20,mono:1,w:800,col,al})})},
// 9 results
(si,f,T)=>{const NW=W<560,x=16,w=NW?W-32:W*.56,base=36;txt("위치: 같은 두 사람, 네 가지 자",x,24,{s:13,w:800});
  const B=[["체비쇼프",D.position.chebyshev,C.cyan,0],["민코프스키 p = 3",MK["3"],C.ink,3],["유클리드",D.position.euclidean,C.sum,3],["맨해튼",D.position.manhattan,C.vio,0]],bh=NW?18:24,gap=NW?28:40,lw=NW?96:130;
  B.forEach(([n,v,col,dg],i)=>{const y=base+14+i*gap,al=si===0?ease(f*3-i*.4):1,bw=(w-lw-60)*v/16*al;txt(n,x,y+bh*.72,{s:NW?11:12,w:700,al});c.fillStyle=col;c.globalAlpha=al*(si===1&&(i===0||i===3)?1:si===1?.4:1);c.fillRect(x+lw,y,bw,bh);c.globalAlpha=1;txt(fmt(v,dg),x+lw+bw+6,y+bh*.75,{s:NW?11:13,mono:1,w:800,col,al})});
  if(si===1){const y1=base+14+bh/2,y4=base+14+3*gap+bh/2,X=x+w-10;c.strokeStyle=C.sum;c.lineWidth=2;c.beginPath();c.moveTo(X-8,y1);c.lineTo(X,y1);c.lineTo(X,y4);c.lineTo(X-8,y4);c.stroke();badge("2배",X+22,(y1+y4)/2,{s:13,col:C.sum,al:ease(f*3)})}
  const cx=NW?16:W*.64,cw=NW?(W-42)/2:W-cx-16,cy=NW?base+14+4*gap+6:40,ch=NW?H-cy-12:(H-80)/2;
  [["코사인 · 후기",fmt(D.cosine.sia_moa_cos),`각도 ${D.cosine.sia_moa_angle_deg}°`,C.drop],["하버사인 · 서울–런던",km(GEO.haversine_km),`지구 속 직선 ${km(GEO.straight_through_km)}`,C.plain]].forEach(([n,v,s2,col],i)=>{const X=NW?cx+i*(cw+10):cx,Y=NW?cy:cy+i*(ch+16),al=si===2?1:si===0?ease(f*3-1.6):.5;c.globalAlpha=al;panel(X,Y,cw,ch);txt(n,X+12,Y+22,{s:NW?10:12,w:800,col,al});txt(v,X+12,Y+ch*.6,{s:NW?16:26,mono:1,w:800,col,al});txt(s2,X+12,Y+ch-12,{s:NW?9:11,col:C.mute,al});c.globalAlpha=1})},
// 10 summary + price
(si,f,T)=>{const NW=W<560,pr=room(T,{cx:W*.36,cy:H*.6,ncy:H*.6});path3(pr,[SIA,MOA],C.sum,3);path3(pr,MAN,C.vio,3);path3(pr,CHEB,C.cyan,5,1,{al:.85});people(pr,{coords:false});
  const L=si===0?["자가 답을 정해요","직선 9.899 · 격자 16 · 큰 축 8"]:si===1?["코사인: 글 길이를 버림","하버사인: 지구를 완전한 공으로 봄"]:["2부 · 같은 것인가","박사님 도장의 진품 가리기"];
  L.forEach((s,i)=>{const al=ease(f*3-i*.7);NW?badge(s,W/2,20+i*30,{s:12,col:i?C.ink:C.sum,al}):badge(s,W*.79,H*.32+i*50,{s:14,col:i?C.ink:C.sum,al})})}
];
/* 코사인 행렬 (6 × 6) */
function cmat(x,y,w){const n=RN.length,cs=Math.min((w-70)/n,(H-y-40)/n);txt("코사인 행렬 · 1에 가까울수록 같은 방향",x,y-8,{s:12,w:800});
  RN.forEach((a,i)=>{txt(a,x+62,y+14+i*cs+cs/2,{a:"right",s:11,w:700,col:gcol(GROUP[a])});txt(a,x+70+i*cs+cs/2,y+14+n*cs+14,{a:"center",s:10,w:700,col:gcol(GROUP[a])});
    RN.forEach((b,j)=>{const v=D.cosine.matrix[i][j];c.fillStyle=mix(C.bg,C.sum,v);c.fillRect(x+70+j*cs,y+14+i*cs,cs-2,cs-2);txt(v.toFixed(2),x+70+j*cs+cs/2-1,y+14+i*cs+cs/2+4,{a:"center",s:Math.min(11,cs*.28),mono:1,w:700,col:v>.6?"#111":C.ink})})})}

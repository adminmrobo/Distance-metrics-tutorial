/* ---------- 마지막 대사가 끝나면: 클리어 이벤트 (1부·2부 공통) ----------
   픽셀 색종이 + 자 카드가 한 장씩 뒤집히며 나타나고, 하루가 축하한다. 숫자는 실험 기록(D)에서 가져온다. */
const ENDCARDS=END.cards;
const CONF=(()=>{let a=7;const r=()=>(a=(a*16807)%2147483647)/2147483647;return Array.from({length:90},()=>({x:r(),d:r(),s:4+r()*5,v:.18+r()*.25,w:r()*6.28,k:Math.floor(r()*5)}))})();
/* 2부: 박사 도장이 쾅 찍히는 완주 인증서 (도장 = 등록 원본 인영, 원본과 다른 점 0점) */
function certificate(t,x,y,w,h){const NW=W<560,slide=ease(Math.min(1,t/0.9)),yy=y+(1-slide)*h*.6;c.globalAlpha=slide;
  c.fillStyle="#fbf6e9";c.fillRect(x,yy,w,h);c.strokeStyle="#c9a04a";c.lineWidth=3;c.strokeRect(x+6,yy+6,w-12,h-12);c.lineWidth=1;c.strokeRect(x+11,yy+11,w-22,h-22);
  const ink="#18202c",s0=Math.min(w/16,NW?17:24);txt("완주 인증서",x+w/2,yy+h*.17,{a:"center",s:s0*1.2,w:900,col:"#7a5a12"});
  [["조수 하루의 3차원 실험실 · EP.04",.31],["시아와 모아는 얼마나 멀까 — 1부 · 2부",.41],["자 아홉 개를 모두 모았음을",.55],["인증합니다.",.64]].forEach(([s,k],i)=>txt(s,x+w/2,yy+h*k,{a:"center",s:s0*(i<2?.62:.72),w:i<2?600:800,col:ink,al:slide}));
  txt("실험실장  박사",x+w*.36,yy+h*.84,{a:"center",s:s0*.62,w:800,col:ink,al:slide});
  /* 도장: 1.0초에 위에서 떨어져 1.4초에 쾅 */
  const sz=Math.min(w*.26,h*.3),sx=x+w*.66,sy=yy+h*.84-sz/2,td=t-1.0;if(td>0){const k=Math.min(1,td/.4),sc=1+(1-ease(k))*2.2,al=Math.min(1,td/.15);
    const g=END.stamp,n=g.length;c.save();c.translate(sx,sy);c.scale(sc,sc);c.rotate(-.08);c.globalAlpha=al*(k<1?.6:.92);c.fillStyle="#c8102e";
    for(let r=0;r<n;r++)for(let q=0;q<n;q++)if(g[r][q])c.fillRect(-sz/2+q*sz/n,-sz/2+r*sz/n,sz/n+.4,sz/n+.4);c.strokeStyle="#c8102e";c.lineWidth=2;c.strokeRect(-sz/2-3,-sz/2-3,sz+6,sz+6);c.restore();
    if(k>=1&&td<.75){c.globalAlpha=(.75-td)/.35;c.strokeStyle=C.sum;c.lineWidth=3;c.beginPath();c.arc(sx,sy,sz*(.7+(td-.4)*1.6),0,7);c.stroke()}
    if(td>.6){const a2=ease((td-.6)*2);badge("원본과 다른 점 0점 · 진품",sx,sy+sz/2+18,{s:NW?10:12,col:"#c8102e",al:a2})}}
  c.globalAlpha=1}
function endScene(t){const NW=W<560,pal=[C.sum,C.plain,C.drop,C.vio,C.cyan];c.fillStyle=C.bg;c.fillRect(0,0,W,H);
  let shake=0;if(END.cert&&!REDUCE&&t>1.4&&t<1.7)shake=(1.7-t)*20*Math.sin(t*90);c.save();c.translate(shake,0);
  /* 픽셀 색종이 */
  CONF.forEach(p=>{const y=((p.d+t*p.v*(REDUCE?0:1))%1.1-.05)*H,x=p.x*W+Math.sin(t*1.3+p.w)*14;c.fillStyle=pal[p.k];c.globalAlpha=.75;c.fillRect(Math.round(x),Math.round(y),p.s,p.s)});c.globalAlpha=1;
  /* 제목 */
  /* 2부: 인증서가 먼저(넓은 화면은 왼쪽에 남고, 좁은 화면은 3.4초 뒤 사라짐), 카드는 그 뒤에 */
  const off=END.cert?2.6:0;let L0=0,LW=W;
  if(END.cert){if(NW){const fade=t>3.4?Math.max(0,1-(t-3.4)/.5):1;if(fade>0){c.globalAlpha=fade;certificate(t,W*.06,16,W*.88,H-32);c.globalAlpha=1}if(t<3.6){c.restore();return}}
    else{const cw=Math.min(W*.38,(H-40)*1.25);certificate(t,16,20,cw,H-40);L0=cw+28;LW=W-L0}}
  const tc=t-off;if(tc<0){c.restore();return}
  const pop=ease(Math.min(1,tc*1.6)),ts=(NW?24:END.cert?30:38)*(.6+.4*pop);txt(END.title,L0+LW/2,(NW?34:50),{a:"center",s:ts,w:900,col:C.sum,al:pop,mono:1});
  txt(END.sub,L0+LW/2,(NW?56:80),{a:"center",s:NW?11:13,w:700,col:C.ink,al:ease(tc*1.2-.4)});
  /* 자 카드 3 × 3 */
  const cols=3,gap=NW?6:10,top=NW?70:100,cw=Math.min(NW?(W-28-2*gap)/3:200,(LW-28-2*gap)/3),ch=Math.min(NW?(H-top-42-2*gap)/3:(H-top-34-2*gap)/3,96),x0=L0+(LW-(cols*cw+(cols-1)*gap))/2;
  t=tc;
  ENDCARDS.forEach((cd,i)=>{const x=x0+(i%cols)*(cw+gap),y=top+Math.floor(i/cols)*(ch+gap),k=Math.max(0,Math.min(1,(t-.6-i*.22)*3)),sx=Math.abs(Math.cos((1-k)*Math.PI/2));if(k<=0)return;
    c.save();c.translate(x+cw/2,y+ch/2);c.scale(Math.max(.02,k<1?sx:1),1);c.translate(-cw/2,-ch/2);
    const lock=cd.lock;c.fillStyle=lock?C.off:C.panel;c.fillRect(0,0,cw,ch);const col=C[cd.col]||C.ink;c.strokeStyle=lock?C.border:col;c.lineWidth=2;c.strokeRect(0,0,cw,ch);c.fillStyle=lock?C.border:col;c.fillRect(0,0,cw,NW?4:6);
    if(lock){txt("?",cw/2,ch*.42,{a:"center",s:NW?18:30,w:900,col:C.mute});txt(cd.name,cw/2,ch*.68,{a:"center",s:NW?9:12,w:700,col:C.mute});txt("2부에서 열려요",cw/2,ch-(NW?4:8),{a:"center",s:NW?8:10,col:C.mute})}
    else{txt(cd.name,8,NW?18:26,{s:NW?10:13,w:800,col});txt(cd.val,8,ch*.66,{s:NW?(cd.val.length>8?11:14):(cd.val.length>9?17:22),mono:1,w:800,col:C.ink});txt(cd.note,8,ch-(NW?6:10),{s:NW?8:10,col:C.mute})}
    c.restore();
    if(k>=1&&t-.6-i*.22<.6&&!lock){c.globalAlpha=1-(t-.6-i*.22-.33)/.27;c.strokeStyle=C.sum;c.lineWidth=3;c.strokeRect(x-3,y-3,cw+6,ch+6);c.globalAlpha=1}});
  const done=t>.6+ENDCARDS.length*.22+.4;if(done){const g=ENDCARDS.filter(cd=>!cd.lock).length;badge(`자 ${g}개 획득!`,L0+LW/2,H-(NW?10:16),{s:NW?12:15,col:C.sum,al:ease((t-.6-ENDCARDS.length*.22-.4)*2)})}
  c.restore()}

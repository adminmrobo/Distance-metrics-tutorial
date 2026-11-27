/* ---------- 마지막 대사가 끝나면: 클리어 이벤트 (1부·2부 공통) ----------
   픽셀 색종이 + 자 카드가 한 장씩 뒤집히며 나타나고, 하루가 축하한다. 숫자는 실험 기록(D)에서 가져온다. */
const ENDCARDS=END.cards;
const CONF=(()=>{let a=7;const r=()=>(a=(a*16807)%2147483647)/2147483647;return Array.from({length:90},()=>({x:r(),d:r(),s:4+r()*5,v:.18+r()*.25,w:r()*6.28,k:Math.floor(r()*5)}))})();
function endScene(t){const NW=W<560,pal=[C.sum,C.plain,C.drop,C.vio,C.cyan];c.fillStyle=C.bg;c.fillRect(0,0,W,H);
  /* 픽셀 색종이 */
  CONF.forEach(p=>{const y=((p.d+t*p.v*(REDUCE?0:1))%1.1-.05)*H,x=p.x*W+Math.sin(t*1.3+p.w)*14;c.fillStyle=pal[p.k];c.globalAlpha=.75;c.fillRect(Math.round(x),Math.round(y),p.s,p.s)});c.globalAlpha=1;
  /* 제목 */
  const pop=ease(Math.min(1,t*1.6)),ts=(NW?24:38)*(.6+.4*pop);txt(END.title,W/2,(NW?34:50),{a:"center",s:ts,w:900,col:C.sum,al:pop,mono:1});
  txt(END.sub,W/2,(NW?56:80),{a:"center",s:NW?11:14,w:700,col:C.ink,al:ease(t*1.2-.4)});
  /* 자 카드 3 × 3 */
  const cols=3,gap=NW?6:12,top=NW?70:100,cw=Math.min(NW?(W-28-2*gap)/3:200,(W-28-2*gap)/3),ch=Math.min(NW?(H-top-42-2*gap)/3:(H-top-34-2*gap)/3,96),x0=(W-(cols*cw+(cols-1)*gap))/2;
  ENDCARDS.forEach((cd,i)=>{const x=x0+(i%cols)*(cw+gap),y=top+Math.floor(i/cols)*(ch+gap),k=Math.max(0,Math.min(1,(t-.6-i*.22)*3)),sx=Math.abs(Math.cos((1-k)*Math.PI/2));if(k<=0)return;
    c.save();c.translate(x+cw/2,y+ch/2);c.scale(Math.max(.02,k<1?sx:1),1);c.translate(-cw/2,-ch/2);
    const lock=cd.lock;c.fillStyle=lock?C.off:C.panel;c.fillRect(0,0,cw,ch);const col=C[cd.col]||C.ink;c.strokeStyle=lock?C.border:col;c.lineWidth=2;c.strokeRect(0,0,cw,ch);c.fillStyle=lock?C.border:col;c.fillRect(0,0,cw,NW?4:6);
    if(lock){txt("?",cw/2,ch*.42,{a:"center",s:NW?18:30,w:900,col:C.mute});txt(cd.name,cw/2,ch*.68,{a:"center",s:NW?9:12,w:700,col:C.mute});txt("2부에서 열려요",cw/2,ch-(NW?4:8),{a:"center",s:NW?8:10,col:C.mute})}
    else{txt(cd.name,8,NW?18:26,{s:NW?10:13,w:800,col});txt(cd.val,8,ch*.66,{s:NW?(cd.val.length>8?11:14):(cd.val.length>9?17:22),mono:1,w:800,col:C.ink});txt(cd.note,8,ch-(NW?6:10),{s:NW?8:10,col:C.mute})}
    c.restore();
    if(k>=1&&t-.6-i*.22<.6&&!lock){c.globalAlpha=1-(t-.6-i*.22-.33)/.27;c.strokeStyle=C.sum;c.lineWidth=3;c.strokeRect(x-3,y-3,cw+6,ch+6);c.globalAlpha=1}});
  const done=t>.6+ENDCARDS.length*.22+.4;if(done){const g=ENDCARDS.filter(cd=>!cd.lock).length;badge(`자 ${g}개 획득!`,W/2,H-(NW?10:16),{s:NW?12:15,col:C.sum,al:ease((t-.6-ENDCARDS.length*.22-.4)*2)})}}

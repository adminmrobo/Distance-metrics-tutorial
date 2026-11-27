/* ---------- 0번 파트: 만화로 보는 상황 (1부·2부 공통) ----------
   images/comic/<이름>.webp 가 있으면(빌드할 때 확인) 그 그림을, 없으면 이 편의 표지를 천천히 옮겨 가며 보여 준다.
   마지막 장의 뒤쪽 절반에서 좌표 격자가 그림 위로 자라나며 1번 파트(좌표 방)로 넘어간다. */
const COMIC_IMG=COMIC.img.map(n=>{if(!n)return null;const im=new Image();im.src=COMIC_BASE+n+".webp";return im});
const COVER=new Image();COVER.src=COVER_SRC;
const FACEIMG={};["haru","sia","moa","doc"].forEach(k=>{const im=new Image();im.src=HARU[k];FACEIMG[k]=im});
const FACECOL=k=>({haru:"#957cc9",sia:C.plain,moa:C.drop,doc:C.sum})[k];
function comicScene(si,f,T){const n=COMIC.img.length,last=si===n-1,k=last?ease(Math.max(0,(f-.45)/.55)):0,im=COMIC_IMG[si],ok=!!(im&&im.complete&&im.naturalWidth>0),src=ok?im:COVER;
  c.fillStyle=C.bg;c.fillRect(0,0,W,H);
  let pw=W-28,ph=pw*9/16;if(ph>H-28){ph=H-28;pw=ph*16/9}const px=(W-pw)/2,py=(H-ph)/2;
  c.save();c.beginPath();c.rect(px,py,pw,ph);c.clip();c.fillStyle="#fff";c.fillRect(px,py,pw,ph);
  if(src.complete&&src.naturalWidth){const pan=ok?0:[[-.06,-.04],[.06,-.02],[-.04,.05],[.0,.0]][si%4],z=(ok?1:1.22)+(REDUCE?0:.04*f)+k*1.1,
      dw=pw*z,dh=ph*z,dx=px+(pw-dw)/2+pan[0]*pw*(1-k),dy=py+(ph-dh)/2+pan[1]*ph*(1-k);c.globalAlpha=1-k*.75;c.drawImage(src,dx,dy,dw,dh);c.globalAlpha=1}
  if(!ok){const fs=Math.min(64,ph*.2);(COMIC.faces[si]||[]).forEach((key,i)=>{const fx=px+18+fs/2+i*(fs+10),fy=py+ph-18-fs/2,fi=FACEIMG[key];c.save();c.beginPath();c.arc(fx,fy,fs/2,0,7);c.closePath();c.fillStyle="#fff";c.fill();if(fi.complete&&fi.naturalWidth){c.clip();c.drawImage(fi,fx-fs/2,fy-fs/2,fs,fs)}c.restore();c.strokeStyle=FACECOL(key);c.lineWidth=3;c.beginPath();c.arc(fx,fy,fs/2,0,7);c.stroke()})}
  if(k>0){/* 좌표 격자가 자라나는 전환 */const vx=W/2,vy=py+ph*.42;c.lineWidth=1.2;
    for(let i=-12;i<=12;i++){c.strokeStyle=C.grid;c.globalAlpha=k*.9;c.beginPath();c.moveTo(vx,vy);c.lineTo(vx+i*W*.12*(1+k),H+40);c.stroke()}
    const ph2=(T*(REDUCE?0:.6))%1;for(let j=0;j<10;j++){const t=(j+ph2)/10,y=vy+(H-vy)*t*t;c.strokeStyle=C.grid;c.globalAlpha=k*.9*t;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}c.globalAlpha=1;
    const L=Math.min(W,H)*.38*k;[[1,0,C.X,"x"],[0,-1,C.Y,"y"],[-.75,.55,C.Z,"z"]].forEach(([a,b,col,nm])=>{c.strokeStyle=col;c.lineWidth=3.2;c.beginPath();c.moveTo(vx,vy);c.lineTo(vx+a*L,vy+b*L);c.stroke();txt(nm,vx+a*(L+14),vy+b*(L+14)+5,{a:"center",s:16,w:800,col,al:k})});
    txt("(0, 0, 0)",vx+8,vy+18,{s:11,mono:1,w:700,col:C.mute,al:k});badge("좌표 방으로!",vx,py+24,{s:15,col:C.sum,al:k})}
  c.restore();c.strokeStyle=C.ink;c.lineWidth=3;c.strokeRect(px,py,pw,ph);
  badge(`${si+1} / ${n}`,px+30,py+18,{s:12,col:C.ink,al:1-k})}
S.unshift(comicScene);ALT.unshift(COMIC.alt);

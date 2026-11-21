
// --- gerador mínimo de PDF (sem bibliotecas, funciona offline) ---
function Pg(){this.o=[]}
Pg.prototype.t=function(x,y,s,sz,b,al){
  s=String(s).replace(/[–—]/g,'-').replace(/[^\x00-\xFF]/g,'?');
  if(al&&al!=='l'){const w=s.length*sz*0.52;x=al==='c'?x-w/2:x-w}
  this.o.push(`BT /${b?'F2':'F1'} ${sz} Tf ${x.toFixed(2)} ${(595-y).toFixed(2)} Td (${s.replace(/[\\()]/g,'\\$&')}) Tj ET`);
};
Pg.prototype.r=function(x,y,w,h,fill){
  this.o.push(`${fill!=null?fill+' g ':''}0.5 w ${x.toFixed(2)} ${(595-y-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill!=null?'f 0 g':'S'}`);
};
Pg.prototype.im=function(x,y,w,h){this.o.push(`q ${w} 0 0 ${h} ${x} ${595-y-h} cm /Im1 Do Q`)};
Pg.prototype.cell=function(x,y,w,h,s,o){
  o=o||{};if(o.fill!=null)this.r(x,y,w,h,o.fill);this.r(x,y,w,h);
  this.t(o.al==='l'?x+3:x+w/2,y+h-3.5,s,o.sz||8,o.b,o.al==='l'?'l':'c');
};
function pdfBlob(pgs,jpg,iw,ih){
  const enc=s=>{const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u};
  const ch=[],off=[];let len=0;const add=u=>{ch.push(u);len+=u.length};
  const N=5+2*pgs.length;
  add(enc('%PDF-1.4\n'));
  const obj=(n,body)=>{off[n]=len;add(enc(`${n} 0 obj\n${body}\nendobj\n`))};
  const stm=(n,dict,bytes)=>{off[n]=len;add(enc(`${n} 0 obj\n<<${dict}/Length ${bytes.length}>>\nstream\n`));add(bytes);add(enc('\nendstream\nendobj\n'))};
  obj(1,'<</Type/Catalog/Pages 2 0 R>>');
  obj(2,`<</Type/Pages/Kids[${pgs.map((_,i)=>`${7+2*i} 0 R`).join(' ')}]/Count ${pgs.length}>>`);
  obj(3,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');
  obj(4,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
  stm(5,`/Type/XObject/Subtype/Image/Width ${iw}/Height ${ih}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode`,jpg);
  pgs.forEach((p,i)=>{
    stm(6+2*i,'',enc(p.o.join('\n')));
    obj(7+2*i,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 842 595]/Contents ${6+2*i} 0 R/Resources<</Font<</F1 3 0 R/F2 4 0 R>>/XObject<</Im1 5 0 R>>>>>>`);
  });
  const xr=len;let x=`xref\n0 ${N+1}\n0000000000 65535 f \n`;
  for(let n=1;n<=N;n++)x+=String(off[n]).padStart(10,'0')+' 00000 n \n';
  x+=`trailer\n<</Size ${N+1}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`;
  add(enc(x));
  return new Blob(ch,{type:'application/pdf'});
}

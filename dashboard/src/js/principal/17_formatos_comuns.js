
/* ===== JANELAS FLUTUANTES: dados do ensaio, registro da etapa, resalva, resultado ===== */
const pad2=n=>String(n).padStart(2,'0');
const hhmm=d=>d?pad2(d.getHours())+':'+pad2(d.getMinutes()):'–';
const hojeTxt=()=>{const h=new Date();return `${pad2(h.getDate())}.${pad2(h.getMonth()+1)}.${h.getFullYear()}`};
const NUM=v=>{const n=Number(String(v).trim().replace(',','.'));return String(v).trim()===''?NaN:n};
document.querySelectorAll('dialog.jan').forEach(d=>{
  d.querySelectorAll('[data-fecha]').forEach(b=>b.addEventListener('click',()=>d.close()));
  if(!('nofora' in d.dataset))d.addEventListener('click',e=>{if(e.target===d)d.close()}); // clique fora fecha (menos nas janelas de digitação)
});

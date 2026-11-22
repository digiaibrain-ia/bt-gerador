
/* v1.10.188 · ARMAZENAMENTO SEGURO — arquivo aberto de Downloads (content://) ou WebView pode PROIBIR localStorage/sessionStorage (SecurityError ao ler).
   Se estiver bloqueado, entra uma versão em MEMÓRIA (vale enquanto a aba estiver aberta; as preferências não ficam guardadas). Se estiver liberado, nada muda. */
(function(){
  function mem(){var d={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}}
  ['localStorage','sessionStorage'].forEach(function(n){
    var ok=true;try{var s=window[n];s.getItem('x')}catch(e){ok=false}
    if(!ok){try{Object.defineProperty(window,n,{value:mem(),configurable:true})}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }window.__semArmazenamento=true}
  });
})();

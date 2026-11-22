(function(){ // finalizar o ensaio (manual) com confirmação
  const dlg=$('dlgFim');if(!dlg||!dlg.showModal)return;
  $('bFim').onclick=()=>{if(T.started&&!T.fim)dlg.showModal()};
  $('fimX').onclick=$('fimVolta').onclick=()=>dlg.close();
  dlg.onclick=e=>{if(e.target===dlg)dlg.close()}; // clique fora fecha
  $('fFim').onsubmit=e=>{e.preventDefault();finalizaManual();dlg.close()};
})();

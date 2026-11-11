// K-AI App - Entrar conecta no repo + PROTECAO: nunca mexe fora de kai-app/projetos/
// NUNCA mexe no projeto KORVIL criado no Bolt, nem em outra pasta do repo.
async function conectarRepo(){
  var atual=localStorage.getItem('REPO_TOKEN')||'';
  var t=prompt('Conectar no repositorio sistemak/korvil-app2 - Cole seu REPO_TOKEN:',atual);
  if(!t) return;
  t=t.trim();
  if(t.length<20){alert('Token curto demais.');return;}
  try{
    var r=await fetch('https://api.github.com/repos/sistemak/korvil-app2',{headers:{Authorization:'Bearer '+t,Accept:'application/vnd.github+json'}});
    if(!r.ok){alert('Nao conectou: '+r.status);return;}
    localStorage.setItem('REPO_TOKEN',t);
    var b=document.getElementById('btnEntrar');if(b){b.innerText='Conectado OK';b.style.background='#22c55e';b.style.color='#000';}
    var s=document.getElementById('statusConexao');if(s)s.innerText='Conectado: sistemak/korvil-app2 - Publicar faz commit real em kai-app/projetos/';
    alert('Conectado! sistemak/korvil-app2 - Publicar faz commit real em kai-app/projetos/. Nunca mexe no projeto KORVIL do Bolt.');
    irParaApp();
  }catch(e){alert('Erro ao conectar: '+e.message);}
}
function validarCaminhoKAI(path){
  if(!path||path.indexOf('kai-app/projetos/')!==0){throw new Error('BLOQUEADO: Publicar so pode salvar em kai-app/projetos/. Tentou: '+path);}
  return true;
}
setTimeout(function(){
  try{var tk=localStorage.getItem('REPO_TOKEN');if(tk&&tk.length>20){var bb=document.getElementById('btnEntrar');if(bb){bb.innerText='Conectado OK';bb.style.background='#22c55e';bb.style.color='#000';}var ss=document.getElementById('statusConexao');if(ss)ss.innerText='Conectado: sistemak/korvil-app2 - Publicar faz commit real em kai-app/projetos/';}}catch(e){}
},800);
// K-AI Terminal Virtual - dentro do chat, mesmo visual - igual Termux, em JS
// Comandos: criar, editar, listar, apagar, publicar, abrir, ajuda, limpar
// NUNCA mexe fora de kai-app/projetos/ - nunca mexe no projeto KORVIL do Bolt
window.KAI_TERMINAL = {
  ehComando: function(texto){var t=texto.trim().toLowerCase();return t.indexOf('criar ')===0||t.indexOf('criar	')===0||t==='criar'||t.indexOf('editar ')===0||t.indexOf('edit ')===0||t.indexOf('listar')===0||t==='ls'||t==='projetos'||t.indexOf('apagar ')===0||t.indexOf('deletar ')===0||t.indexOf('excluir ')===0||t.indexOf('rm ')===0||t.indexOf('publicar')===0||t.indexOf('publish')===0||t.indexOf('abrir ')===0||t==='ajuda'||t==='help'||t==='comandos'||t==='limpar'||t==='clear'||t.indexOf('corrigir ')===0||t.indexOf('melhorar ')===0||t.indexOf('adicionar ')===0||t.indexOf('refazer ')===0;},
  ajuda: function(){return 'K-AI Terminal - comandos:\n\ncriar app-de-vendas - cria app novo\ncriar app-de-vendas com botao verde - cria com descricao\neditar app-de-vendas muda o botao pra verde - edita projeto\ncorrigir app-de-vendas - corrige erro\nmelhorar app-de-vendas - melhora visual\nadicionar app-de-vendas um botao novo - adiciona\nrefazer app-de-vendas - refaz do zero\nlistar - lista todos os projetos\nabrir app-de-vendas - abre projeto\napagar app-de-vendas - apaga projeto (so kai-app/projetos/)\npublicar - publica projeto atual no GitHub\npublicar app-de-vendas - publica um projeto\nlimpar - limpa o chat\najuda - mostra isso aqui';},
  listar: function(){if(!projetos.length)return 'Nenhum projeto ainda. Digite: criar meu-app';return 'Projetos ('+projetos.length+'):\n'+projetos.map(function(p,i){return (i+1)+'. '+p.nome+' - '+p.arquivos.length+' arquivos - '+(p.desc||'').slice(0,60);}).join('\n');},
  achar: function(nome){nome=(nome||'').toLowerCase().trim();return projetos.find(function(p){return p.nome.toLowerCase()===nome;});},
  executar: async function(textoOriginal){
    var texto=textoOriginal.trim();var low=texto.toLowerCase();
    if(low==='ajuda'||low==='help'||low==='comandos'){addMsg(this.ajuda());return true;}
    if(low==='limpar'||low==='clear'){var m=document.getElementById('msgs');if(m)m.innerHTML='';addMsg('Chat limpo. Digite ajuda para ver os comandos.');return true;}
    if(low==='listar'||low==='ls'||low==='projetos'){addMsg(this.listar());return true;}
    if(low.indexOf('abrir ')===0){var nomeAbrir=texto.slice(6).trim();var pa=this.achar(nomeAbrir);if(!pa){addMsg('Projeto nao achado: '+nomeAbrir+'\n'+this.listar());return true;}var idx=projetos.indexOf(pa);abrirProjeto(idx);addMsg('Projeto '+pa.nome+' aberto.');return true;}
    if(low.indexOf('apagar ')===0||low.indexOf('deletar ')===0||low.indexOf('excluir ')===0||low.indexOf('rm ')===0){var nomeApagar=texto.split(' ').slice(1).join(' ').trim();var pd=this.achar(nomeApagar);if(!pd){addMsg('Projeto nao achado: '+nomeApagar);return true;}if(!confirm('Apagar '+pd.nome+'? Isso apaga so de kai-app/projetos/, nunca mexe no KORVIL.'))return true;var ii=projetos.indexOf(pd);projetos.splice(ii,1);salvar();renderProjetos();renderHome();if(projetoAtual&&projetoAtual.nome===pd.nome)projetoAtual=null;addMsg('Apagado: '+pd.nome+' (so local + kai-app/projetos/)');return true;}
    if(low.indexOf('publicar')===0||low.indexOf('publish')===0){var partes=texto.split(' ');var nomePub=partes.length>1?partes.slice(1).join(' ').trim():'';var pp=nomePub?this.achar(nomePub):projetoAtual;if(!pp){addMsg('Nenhum projeto para publicar. Crie um primeiro: criar meu-app');return true;}var ip=projetos.indexOf(pp);addMsg('Publicando '+pp.nome+' no GitHub (commit real em kai-app/projetos/)...');await publicarProjeto(ip);addMsg('Publicado! '+pp.nome);return true;}
    if(low.indexOf('criar ')===0||low==='criar'){var resto=texto.slice(6).trim();if(!resto){addMsg('Uso: criar nome-do-app + descricao. Ex: criar app-de-vendas com botao verde');return true;}var partesCriar=resto.split(' ');var nomeNovo=partesCriar[0].toLowerCase().replace(/[^a-z0-9-]/g,'-');var descCriar=resto;var ja=this.achar(nomeNovo);if(ja){addMsg('Projeto '+nomeNovo+' ja existe. Vou editar ele.');projetoAtual=ja;}else{projetoAtual={nome:nomeNovo,desc:descCriar,arquivos:[],msgs:[],criadoEm:Date.now()};projetos.unshift(projetoAtual);}salvar();renderProjetos();addMsg('Terminal: criando '+nomeNovo+'...');await enviarTexto(descCriar,true);return true;}
    if(low.indexOf('editar ')===0||low.indexOf('edit ')===0||low.indexOf('corrigir ')===0||low.indexOf('melhorar ')===0||low.indexOf('adicionar ')===0||low.indexOf('refazer ')===0){var resto2=texto;var primeira=resto2.split(' ')[0];var restoSemPrimeira=resto2.slice(primeira.length).trim();var partes2=restoSemPrimeira.split(' ');var nomeEdit=partes2[0]||'';var pe=this.achar(nomeEdit);if(!pe){addMsg('Projeto nao achado: '+nomeEdit+'. Digite listar para ver os projetos.');return true;}projetoAtual=pe;var idx2=projetos.indexOf(pe);abrirProjeto(idx2);addMsg('Terminal: executando '+primeira+' em '+pe.nome+'...');await enviarTexto(restoSemPrimeira,true);return true;}
    return false;
  }
};
// Intercepta o enviar do chat sem mudar o visual: se for comando de terminal, executa como terminal. Se nao for, vai para a IA normal.
setTimeout(function(){
  if(typeof enviarParaKAI==='function'&&!enviarParaKAI._terminal){
    var _orig=enviarParaKAI;
    var _nova=async function(){var input=document.getElementById('prompt');var texto=input?input.value.trim():'';if(texto&&window.KAI_TERMINAL.ehComando(texto)){input.value='';addMsg('$ '+texto,true);var ok=await window.KAI_TERMINAL.executar(texto);if(ok)return;}return _orig();};
    _nova._terminal=true; enviarParaKAI=_nova;
  }
  if(typeof criarDoHome==='function'&&!criarDoHome._terminal){
    var _origHome=criarDoHome;
    var _novaHome=function(){var inp=document.getElementById('promptHome');var tx=inp?inp.value.trim():'';if(tx&&window.KAI_TERMINAL.ehComando(tx)){addMsg('$ '+tx,true);window.KAI_TERMINAL.executar(tx);return;}return _origHome();};
    _novaHome._terminal=true; criarDoHome=_novaHome;
  }
},800);
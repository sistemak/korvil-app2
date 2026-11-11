// K-AI tipo Bolt - Gemini planeja + GROQ codifica + Pollinations imagem/texto - via Supabase Edge Functions
window.KAI = {
  imagemPollinations: function(prompt){ return 'https://image.pollinations.ai/prompt/'+encodeURIComponent(prompt+' app moderno roxo escuro')+'?width=1024&height=512&seed='+Math.floor(Math.random()*99999)+'&nologo=true'; },
  chamarSupabase: async function(funcao, corpo){
    var r=await fetch(window.SUPABASE_URL+'/functions/v1/'+funcao,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+window.SUPABASE_ANON_KEY,apikey:window.SUPABASE_ANON_KEY},body:JSON.stringify(corpo)});
    if(!r.ok) throw new Error(funcao+' '+r.status+' '+(await r.text()).slice(0,300));
    return await r.json();
  },
  extrairArquivos: function(texto, nomeProjeto){
    var pegar=function(lang){ var m=texto.match(new RegExp('```'+lang+'\\s*([\\s\\S]*?)```','i')); return m?m[1].trim():null; };
    var html=pegar('html'), css=pegar('css'), js=pegar('js');
    if(!html){ html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+nomeProjeto+'</title><link rel="stylesheet" href="style.css"></head><body><h1>'+nomeProjeto+'</h1><p>'+String(texto||'').slice(0,1500)+'</p><img src="'+this.imagemPollinations(nomeProjeto)+'" style="width:100%;border-radius:12px"><script src="app.js"></scr'+'ipt></body></html>'; }
    if(!css) css='body{background:#0b0714;color:#fff;font-family:Arial;padding:20px} h1{color:#a855f7} button{background:#a855f7;color:#fff;border:0;padding:12px 16px;border-radius:12px}';
    if(!js) js='console.log("Projeto '+nomeProjeto+' criado pelo K-AI");';
    return [{path:'index.html',content:html},{path:'style.css',content:css},{path:'app.js',content:js}];
  },
  aplicarEdicao: function(arquivosAtuais, texto, nomeProjeto){
    // Se a IA devolver arquivos completos, usa eles. Se devolver patch, o backend ja resolve. Aqui: extrai e mescla por path
    var novos=this.extrairArquivos(texto, nomeProjeto);
    var mapa={}; arquivosAtuais.forEach(function(f){ mapa[f.path]=f; }); novos.forEach(function(f){ mapa[f.path]=f; });
    return Object.keys(mapa).map(function(k){ return mapa[k]; });
  },
  templateLocal: function(prompt, nomeProjeto){
    var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+nomeProjeto+'</title><link rel="stylesheet" href="style.css"></head><body><h1>'+nomeProjeto+'</h1><p>'+prompt+'</p><img src="'+this.imagemPollinations(prompt)+'" style="width:100%;border-radius:12px"><button>Comecar</button><script src="app.js"></scr'+'ipt></body></html>';
    return [{path:'index.html',content:html},{path:'style.css',content:'body{background:#0b0714;color:#fff;font-family:Arial;padding:20px} h1{color:#a855f7}'},{path:'app.js',content:'console.log("K-AI template local - Supabase offline");'}];
  },
  gerar: async function(prompt, nomeProjeto, arquivosAtuais, acao){
    // acao: criar | editar | corrigir | adicionar
    try{
      var j=await this.chamarSupabase('k-ai',{prompt:prompt, nomeProjeto:nomeProjeto, arquivosAtuais:arquivosAtuais||[], acao:acao||'criar'});
      if(j && j.texto){ if((acao==='editar'||acao==='corrigir'||acao==='adicionar') && arquivosAtuais && arquivosAtuais.length) return this.aplicarEdicao(arquivosAtuais, j.texto, nomeProjeto); return this.extrairArquivos(j.texto, nomeProjeto); }
      if(j && j.arquivos) return j.arquivos;
      throw new Error('resposta vazia do backend');
    }catch(e){ console.warn("K-AI Supabase offline, template local:", e.message); return this.templateLocal(prompt, nomeProjeto); }
  }
};
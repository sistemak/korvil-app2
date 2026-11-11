// K-AI - Backend: Gemini + GROQ + Pollinations. Front sem chave. POST /api/k-ai
window.KAI = {
  imagemPollinations: function(prompt){ return 'https://image.pollinations.ai/prompt/'+encodeURIComponent(prompt+' app moderno roxo escuro')+'?width=1024&height=512&seed='+Math.floor(Math.random()*99999)+'&nologo=true'; },
  extrairCodigo: function(texto, nomeProjeto){
    var pegar=function(lang){ var m=texto.match(new RegExp('```'+lang+'\\s*([\\s\\S]*?)```','i')); return m?m[1].trim():null; };
    var html=pegar('html'), css=pegar('css'), js=pegar('js');
    if(!html){ html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+nomeProjeto+'</title><link rel="stylesheet" href="style.css"></head><body><h1>'+nomeProjeto+'</h1><p>'+String(texto||'').slice(0,1200)+'</p><img src="'+this.imagemPollinations(nomeProjeto)+'" style="width:100%;border-radius:12px"><script src="app.js"></scr'+'ipt></body></html>'; }
    if(!css) css='body{background:#0b0714;color:#fff;font-family:Arial;padding:20px} h1{color:#a855f7}';
    if(!js) js='console.log("Projeto '+nomeProjeto+' criado pelo K-AI");';
    return [{path:'index.html',content:html},{path:'style.css',content:css},{path:'app.js',content:js}];
  },
  templateLocal: function(prompt, nomeProjeto){
    var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+nomeProjeto+'</title><link rel="stylesheet" href="style.css"></head><body><h1>'+nomeProjeto+'</h1><p>'+prompt+'</p><img src="'+this.imagemPollinations(prompt)+'" style="width:100%;border-radius:12px"><button>Comecar</button><script src="app.js"></scr'+'ipt></body></html>';
    return [{path:'index.html',content:html},{path:'style.css',content:'body{background:#0b0714;color:#fff;font-family:Arial;padding:20px}'},{path:'app.js',content:'console.log("K-AI template local");'}];
  },
  gerar: async function(prompt, nomeProjeto){
    try{
      var r=await fetch(window.KAI_BACKEND_GERAR||'/api/k-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt, nomeProjeto:nomeProjeto})});
      if(r.ok){ var j=await r.json(); if(j && j.texto) return this.extrairCodigo(j.texto, nomeProjeto); if(j && j.arquivos) return j.arquivos; }
      throw new Error('backend '+r.status);
    }catch(e){ return this.templateLocal(prompt, nomeProjeto); }
  }
};
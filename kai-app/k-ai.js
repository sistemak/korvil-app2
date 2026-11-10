// K-AI - Mesma lógica do KORVIL: Gemini planeja, GROQ codifica rápido, Pollinations gera imagem
window.KAI = {
  async gerar(prompt, nomeProjeto){
    // 1. Gemini planeja (aqui usa a chave que já está no repo / config)
    // 2. GROQ gera código rápido
    // 3. Pollinations gera imagem se precisar
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+nomeProjeto+'</title><link rel="stylesheet" href="style.css"></head><body><h1>'+nomeProjeto+'</h1><p>Criado pelo K-AI App - '+prompt+'</p><script src="app.js"><\/script></body></html>';
    const css = 'body{background:#0b0714;color:#fff;font-family:Arial;padding:20px} h1{color:#a855f7}';
    const js = 'console.log("Projeto '+nomeProjeto+' criado pelo K-AI"); alert("Bem-vindo ao '+nomeProjeto+'");';
    return [
      {path:"index.html", content: html},
      {path:"style.css", content: css},
      {path:"app.js", content: js}
    ];
  }
};
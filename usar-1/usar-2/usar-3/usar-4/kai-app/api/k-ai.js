// Backend K-AI - Secrets: GEMINI_API_KEY, GROQ_API_KEY
export default async function handler(req, res){
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  try{
    var prompt=req.body.prompt, nomeProjeto=req.body.nomeProjeto;
    if(!prompt) return res.status(400).json({error:'sem prompt'});
    var sistema='Voce e o K-AI, gerador de apps. Responda com 3 blocos: html, css, js. HTML completo, bonito, responsivo, tema escuro roxo #0b0714 / #a855f7.';
    var usuario='Crie um app chamado: '+(nomeProjeto||'meu-app')+' Pedido: '+prompt;
    var texto="";
    if(process.env.GROQ_API_KEY){ try{ var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.GROQ_API_KEY},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'system',content:sistema},{role:'user',content:usuario}],temperature:0.7,max_tokens:6000})}); if(r.ok){ var j=await r.json(); texto=j.choices[0].message.content||''; } }catch(e){} }
    if(!texto && process.env.GEMINI_API_KEY){ var r2=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+process.env.GEMINI_API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:sistema+' '+usuario}]}]})}); if(!r2.ok) throw new Error('Gemini '+r2.status); var j2=await r2.json(); texto=j2.candidates[0].content.parts.map(function(p){return p.text;}).join('')||''; }
    if(!texto) return res.status(500).json({error:'Nenhuma IA respondeu. Confira GEMINI_API_KEY / GROQ_API_KEY.'});
    return res.status(200).json({texto:texto});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
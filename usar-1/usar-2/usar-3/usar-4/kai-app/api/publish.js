// Backend Publish - Secrets: GH_TOKEN / REPO_TOKEN
export default async function handler(req, res){
  if(req.method!=='POST') return res.status(405).json({error:'POST only'});
  try{
    var token=process.env.GH_TOKEN||process.env.REPO_TOKEN;
    if(!token) return res.status(500).json({error:'Sem GH_TOKEN / REPO_TOKEN no backend'});
    var path=req.body.path, content=req.body.content, message=req.body.message;
    var base='https://api.github.com/repos/sistemak/korvil-app2/contents/'+path.split('/').map(encodeURIComponent).join('/');
    var sha=null; var get=await fetch(base,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'}}); if(get.ok){ var j=await get.json(); sha=j.sha; }
    var put=await fetch(base,{method:'PUT',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({message:message||('K-AI: '+path),content:Buffer.from(content,'utf-8').toString('base64'),sha:sha||undefined,branch:'main'})});
    if(!put.ok) return res.status(put.status).json({error:await put.text()});
    return res.status(200).json({ok:true});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
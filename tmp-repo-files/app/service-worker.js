const CACHE='korvil-v2';
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/app/index.html','/app/manifest.json'])).catch(()=>{})); self.skipWaiting();});
self.addEventListener('activate', e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// NetworkFirst: conteúdo e ícones novos entram assim que publicados, sem reinstalar.
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res&&res.status===200){const cl=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)).catch(()=>{});}
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/app/index.html')))
  );
});

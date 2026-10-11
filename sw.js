// Carioca: funciona sin internet. Sube el número de versión al cambiar archivos.
const CACHE='carioca-v1';
const APP=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // usa la copia guardada y la actualiza en segundo plano cuando hay internet
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(req,{ignoreSearch:true});
      const net=fetch(req).then(r=>{ if(r.ok) c.put(req,r.clone()); return r; }).catch(()=>hit);
      return hit||net;
    }));
  } else if(url.host.endsWith('fonts.googleapis.com')||url.host.endsWith('fonts.gstatic.com')){
    // tipografías: se guardan la primera vez que se abre con internet
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match(req); if(hit) return hit;
      try{ const r=await fetch(req); c.put(req,r.clone()); return r; }catch(err){ return new Response('',{status:504}); }
    }));
  }
});

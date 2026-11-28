// Showcall service worker: offline cache, push notifications and notification taps.
const CACHE='showcall-v3-8';
const FILES=['./','index.html','app.html','owner.html','beo.html','store.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return; // never cache push-server or other sites
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match('app.html'))))});

// Web Push (for a future Showcall push server). Payload: {title, body, sev, id}
self.addEventListener('push',e=>{
 let m={};try{m=e.data?e.data.json():{}}catch(_){m={title:'Showcall',body:e.data?e.data.text():''}}
 const sev=m.sev||'warn',pat=sev==='stop'?[400,150,400,150,400]:sev==='go'?[150,80,150]:[250,120,250];
 const title=(sev==='stop'?'⛔ ':sev==='go'?'✅ ':'⚠️ ')+(m.title||'Showcall');
 e.waitUntil(self.registration.showNotification(title,{body:m.body||'',tag:m.id||'showcall',renotify:true,vibrate:pat,icon:'icon-192.png',badge:'icon-192.png',
  requireInteraction:sev==='stop',data:{id:m.id||null},actions:String(m.id||'').startsWith('late-')?[{action:'ack',title:'Got it'}]:[{action:'open',title:'Open'}]}));
});

// Tap a notification: "Got it" acknowledges without opening; anything else opens the app.
self.addEventListener('notificationclick',e=>{
 const n=e.notification,id=n.data&&n.data.id;n.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
  const app=cs.find(c=>/app\.html/.test(c.url))||cs[0];
  if(e.action==='ack'&&id){cs.forEach(c=>c.postMessage({type:'ack',id}));if(app)return;}
  if(app){app.postMessage(e.action==='ack'?{type:'ack',id}:{type:'open',id});return app.focus()}
  return self.clients.openWindow('app.html'+(e.action==='ack'&&id?'#ack='+encodeURIComponent(id):''));
 }));
});

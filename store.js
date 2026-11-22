/* Showcall store: one interface over where event data lives.
   Today every page reads and writes through the local adapter (this device's localStorage, same keys as before:
   'em-v2-crew-watch', 'showcall-owner', 'showcall-beo', 'showcall-events').
   The cloud adapter is a stub with the exact shape a hosted database needs. When Dana picks a backend, fill in
   cloud.connect/push/pull and call ShowcallStore.useCloud(config). Local stays the source of truth on each device:
   every set() writes locally first, then queues the change for the cloud, so the app keeps working offline.

   API (synchronous, so pages need no rewrite):
     ShowcallStore.get(key, fallback)      -> parsed value or fallback
     ShowcallStore.set(key, value)         -> true if saved on this device
     ShowcallStore.remove(key)
     ShowcallStore.subscribe(key, fn)      -> fn(value) when another tab or the cloud changes it; returns unsubscribe
     ShowcallStore.status()                -> {adapter, cloud, pending}
     ShowcallStore.events                  -> event codes: create(meta), find(code), list(), valid(code)
   No secrets, codes for doors or parking, or phone numbers belong in this store's shared keys. */
(function(g){
 'use strict';
 const local={
  name:'local',
  get(k){try{const r=g.localStorage.getItem(k);return r==null?undefined:JSON.parse(r)}catch(e){return undefined}},
  set(k,v){try{g.localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},
  remove(k){try{g.localStorage.removeItem(k)}catch(e){}}
 };
 /* Cloud adapter stub. Each method returns a Promise so a real database (REST, Supabase, Firebase...) can slot in.
    Until configured it rejects, and changes stay queued in memory for this session only. */
 const cloud={
  name:'cloud',ready:false,config:null,
  connect(config){return Promise.reject(new Error('No cloud backend configured yet'))},
  push(key,value,meta){return Promise.reject(new Error('Cloud not connected'))},
  pull(key){return Promise.reject(new Error('Cloud not connected'))},
  onRemoteChange(fn){/* a real adapter calls fn(key,value) when another device writes */}
 };
 const SHARED=['em-v2-crew-watch','showcall-owner','showcall-beo','showcall-events'];
 const subs={},pending=[];
 function emit(k,v){(subs[k]||[]).slice().forEach(fn=>{try{fn(v)}catch(e){}})}
 function get(k,fb){const v=local.get(k);return v===undefined||v===null?fb:v}
 function set(k,v){const ok=local.set(k,v);
  if(SHARED.includes(k)){pending.push({k,at:Date.now()});if(pending.length>50)pending.splice(0,pending.length-50);flush()}
  return ok}
 let flushing=false;
 function flush(){if(!cloud.ready||flushing||!pending.length)return;flushing=true;
  const p=pending.shift();
  cloud.push(p.k,local.get(p.k),{at:p.at}).then(()=>{flushing=false;flush()},()=>{pending.unshift(p);flushing=false})}
 function remove(k){local.remove(k)}
 function subscribe(k,fn){(subs[k]=subs[k]||[]).push(fn);return()=>{subs[k]=(subs[k]||[]).filter(f=>f!==fn)}}
 try{g.addEventListener('storage',e=>{if(e.key&&subs[e.key])emit(e.key,local.get(e.key))})}catch(e){}
 cloud.onRemoteChange((k,v)=>{local.set(k,v);emit(k,v)});
 function useCloud(config){return cloud.connect(config).then(()=>{cloud.ready=true;cloud.config=config;flush();return true})}
 function status(){return {adapter:cloud.ready?'local+cloud':'local',cloud:cloud.ready?'connected':'not set up',pending:pending.length}}

 /* Event codes: 6 letters, no I, L, O or U so they read cleanly aloud and on a watch. */
 const ABC='ABCDEFGHJKMNPQRSTVWXYZ',EK='showcall-events';
 const norm=c=>String(c||'').toUpperCase().replace(/[^A-Z]/g,'');
 const valid=c=>{c=norm(c);return c.length===6&&[...c].every(x=>ABC.includes(x))};
 function newCode(){const a=new Uint32Array(6);(g.crypto||g.msCrypto).getRandomValues(a);return [...a].map(x=>ABC[x%ABC.length]).join('')}
 const events={
  valid,norm,
  list(){return get(EK,{})},
  find(code){code=norm(code);return valid(code)?(this.list()[code]||null):null},
  create(meta){const all=this.list();let c;do{c=newCode()}while(all[c]);
   all[c]=Object.assign({code:c,created:Date.now()},meta||{});set(EK,all);return all[c]},
  close(code){const all=this.list();code=norm(code);if(all[code]){all[code].closed=true;set(EK,all)}}
 };
 g.ShowcallStore={get,set,remove,subscribe,status,useCloud,events,adapters:{local,cloud}};
})(window);

/* Questions libres : aucun indice ni solution envoyé au serveur. */
(()=>{
const API='https://brigade36-interrogatoires.matthieujb1.workers.dev/interroger';
const CASES_AI=new Set(['f1','f2','m1','m2','c1','c2']);
const original=persTab;
let busy=false;
const eligible=g=>g&&g.level===3&&g.sus&&CASES_AI.has(g.c.id);
persTab=function(g){
 const html=original(g);
 if(!eligible(g))return html;
 return html+'<section class="brief" style="margin-top:16px"><h2>Interrogatoire libre · Commissaire</h2><p>Questions complémentaires sur la déclaration initiale. Les questions du dossier restent nécessaires pour obtenir des indices.</p><form id="b36-ai-form"><label for="b36-ai-question">Votre question</label><textarea id="b36-ai-question" required minlength="5" maxlength="240" rows="3" style="display:block;width:100%;box-sizing:border-box;font:inherit;background:var(--bg);color:var(--ink);padding:10px"></textarea><div id="b36-ai-turnstile"></div><p id="b36-ai-status" role="status" aria-live="polite"></p><button class="btn p" type="submit">Envoyer</button></form></section>';
};
let scriptPromise;
function loadTurnstile(){
 if(window.turnstile)return Promise.resolve();
 return scriptPromise??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=resolve;script.onerror=()=>{scriptPromise=null;reject(new Error('Vérification indisponible'));};document.head.append(script);});
}
app.addEventListener('submit',async e=>{
 if(e.target.id!=='b36-ai-form')return;
 e.preventDefault();
 const g=S.g,form=e.target,sus=g?.sus,turn=g?.turn;
 if(busy||S.view!=='case'||!eligible(g))return;
 const status=form.querySelector('#b36-ai-status'),button=form.querySelector('button'),question=form.querySelector('textarea').value.trim();
 if(question.length<5||question.length>240)return;
 const siteKey=window.B36_TURNSTILE_SITE_KEY || '0x4AAAAAAF_3GHNV5j8Rqbeu';
 if(!siteKey){status.textContent='Interrogatoire libre non configuré. Utilisez les questions du dossier.';return;}
 busy=true;button.disabled=true;status.textContent='Vérification de sécurité…';
 let widget;
 try{
 await loadTurnstile();
 const token=await new Promise((resolve,reject)=>{
 const timer=setTimeout(()=>reject(new Error('Vérification expirée')),120000);
 const done=(fn,v)=>{clearTimeout(timer);fn(v);};
 widget=turnstile.render(form.querySelector('#b36-ai-turnstile'),{sitekey:siteKey,callback:t=>done(resolve,t),'error-callback':()=>done(reject,new Error('Vérification refusée')),'expired-callback':()=>done(reject,new Error('Vérification expirée'))});
 });
 if(S.g!==g||S.view!=='case'||g.sus!==sus||g.turn!==turn||!form.isConnected)return;
 status.textContent='Le suspect réfléchit…';
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:g.c.id,suspect:sus,question,turnstileToken:token}),signal:AbortSignal.timeout(30000)});
 const data=await r.json();
 if(!r.ok||typeof data.reponse!=='string')throw new Error(r.status===429?'Trop de questions. Réessayez dans une minute.':'Interrogatoire indisponible. Utilisez les questions du dossier.');
 if(S.g!==g||S.view!=='case'||g.sus!==sus||g.turn!==turn||!form.isConnected)return;
 g.log[sus].push({k:'q',q:B36.escape(question),a:B36.escape(data.reponse)});
 B36.action(g);B36.save();render();
 }catch(err){status.textContent=err.message||'Interrogatoire indisponible';}
 finally{if(widget!==undefined)try{turnstile.remove(widget)}catch{}busy=false;button.disabled=false;}
});
render();
})();

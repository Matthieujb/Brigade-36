
/* Brigade 36 : configuration et tours locaux, sans modification des six dossiers. */
const B36 = {
 setup:null, games: S.games,
 escape(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
 level(g){return LV[g.level||g.c.niv]},
 current(g){return g.players[g.turn]},
 remaining(g){return g.hintsAllowed?Math.max(0,g.hintLimit-g.hints):0},
 save(){try{const o={};for(const [id,g] of Object.entries(S.games)){const {c,...state}=g;o[id]=state}localStorage.setItem('brigade36_games_v3',JSON.stringify(o))}catch(e){}},
 next(g){for(let i=1;i<=g.players.length;i++){const n=(g.turn+i)%g.players.length;if(!g.players[n].out)return n}return g.turn},
 action(g){if(g.players.length<2)return;g.actions++;if(g.actions>=2){g.actions=0;g.turn=this.next(g);g.passing=true;S.view='pass'}},
 hint(g){if(!this.remaining(g))return;const id=g.c.solution.preuves[0],place=g.c.lieux.find(x=>x.objets.includes(id)),person=g.c.suspects.find(x=>x.id===g.c.solution.coupable);const hints=['Comparez les alibis et les déplacements.','Explorez '+(place?place.nom:'les lieux')+' et interrogez '+(person?person.nom:'les témoins')+'.','Examinez la pièce « '+g.c.indices[id].n+' ».'];g.hints++;(g.hintLog=g.hintLog||[]).push(hints[Math.min(2,g.hints-1)]);g.tab='carnet'},
 prep(c){return {id:c.id,level:c.niv,hintsAllowed:true,hintLimit:LV[c.niv].conseils,count:1,mode:'coop',names:['Joueur 1']}},
 setupView(){
 const q=this.setup,c=CASES.find(x=>x.id===q.id),e=v=>this.escape(v);
 const rules={1:'Stagiaire — essais illimités, accusation simple',2:'Inspecteur — 3 essais, 1 preuve',3:'Commissaire — 2 essais, 2 preuves, lieux verrouillés'};
 return topbar(null)+'<main class="wrap b36-setup"><p class="kick">Préparation du dossier</p><h1>'+e(c.titre)+'</h1><p class="lead">Choisissez les règles de cette partie.</p><fieldset><legend>Difficulté</legend>'+[1,2,3].map(n=>'<label class="b36-choice"><input type="radio" name="b36-level" value="'+n+'" '+(q.level===n?'checked':'')+'> '+rules[n]+'</label>').join('')+'</fieldset><fieldset><legend>Indices</legend><label class="b36-choice"><input id="b36-hints" type="checkbox" '+(q.hintsAllowed?'checked':'')+'> Autoriser les indices</label><label for="b36-limit">Nombre de conseils (1 à 5)</label><select id="b36-limit" '+(!q.hintsAllowed?'disabled':'')+'>'+[1,2,3,4,5].map(n=>'<option '+(q.hintLimit===n?'selected':'')+' value="'+n+'">'+n+'</option>').join('')+'</select></fieldset><fieldset><legend>Joueurs</legend><label for="b36-count">Nombre de joueurs (1 à 6)</label><select id="b36-count">'+[1,2,3,4,5,6].map(n=>'<option value="'+n+'" '+(q.count===n?'selected':'')+'>'+n+'</option>').join('')+'</select>'+Array.from({length:q.count},(_,i)=>'<label for="b36-name-'+i+'">Prénom du joueur '+(i+1)+'</label><input id="b36-name-'+i+'" data-b36-name="'+i+'" maxlength="24" value="'+e(q.names[i]||'Joueur '+(i+1))+'">').join('')+'<label for="b36-mode">Mode</label><select id="b36-mode" '+(q.count===1?'disabled':'')+'><option value="coop" '+(q.mode==='coop'?'selected':'')+'>Coopératif — équipe commune</option><option value="versus" '+(q.mode==='versus'?'selected':'')+'>Compétitif — première bonne accusation gagnante</option></select></fieldset><div class="cta"><button class="btn p" data-b36="launch">Ouvrir le dossier</button><button class="btn g" data-b36="home">Retour</button></div></main>';
 },
 passView(g){return topbar(null)+'<main class="wrap b36-setup"><p class="kick">Passage du téléphone</p><h1>Tour de '+this.escape(this.current(g).name)+'</h1><p class="lead">Passez le téléphone à cette personne. Le dossier reste masqué jusqu’à sa confirmation.</p><button class="btn p" data-b36="ready">Je suis prêt</button></main>'}
};
try{const raw=JSON.parse(localStorage.getItem('brigade36_games_v3')||'{}');for(const [id,g] of Object.entries(raw)){const c=CASES.find(x=>x.id===id);if(c&&Array.isArray(g.players)&&g.players.length>=1&&g.players.length<=6)S.games[id]={...g,c}}}catch(e){}
const b36Original={
 newGame,topbar,render,start,caseV,endV,lieuxTab,carnetTab,resolve,addClue
};
newGame=function(c,config){
 const g=b36Original.newGame(c),q=config||B36.prep(c);
 return Object.assign(g,{level:q.level,hintsAllowed:q.hintsAllowed,hintLimit:q.hintsAllowed?q.hintLimit:0,players:q.names.slice(0,q.count).map(name=>({name,found:0,accusations:0,out:false})),mode:q.count===1?'coop':q.mode,turn:0,actions:0,passing:false,hintLog:[]});
};
start=function(id,fresh){
 const c=CASES.find(x=>x.id===id);if(!c)return;
 if(fresh){delete S.games[id];B36.save()}
 if(S.games[id]){S.g=S.games[id];S.view=S.g.passing?'pass':'case'}
 else {B36.setup=B36.prep(c);S.view='setup'}
};
topbar=function(g){
 const html=b36Original.topbar(g);
 if(!g||!g.players)return html;
 const left=B36.remaining(g),button='<button class="chip b36-hint" data-b36="hint" '+(!left?'disabled title="'+(g.hintsAllowed?'Plus de conseils':'Indices désactivés')+'"':'')+'>Demander un indice ('+left+')</button>';
 return html.replace('</div></header>',button+'</div></header>');
};
lieuxTab=function(g){
 const html=b36Original.lieuxTab(g);
 if(g.level!==3)return html;
 // Respecter les verrouillages du dossier en mode Commissaire.
 return html;
};
carnetTab=function(g){
 let html=b36Original.carnetTab(g);
 if(!g.players)return html;
 const remaining=B36.remaining(g);
 html=html.replace(/<h2 class="sec">Conseils du chef<\/h2>[\s\S]*?(?=return h;)/,'');
 // Les conseils progressifs sont affichés au-dessus du carnet.
 return '<section class="b36-hints"><h2 class="sec">Indices demandés</h2>'+(g.hintLog||[]).map((x,i)=>'<p class="hint"><b>Palier '+Math.min(i+1,3)+'</b> '+B36.escape(x)+'</p>').join('')+'<button class="btn g" data-b36="hint" '+(!remaining?'disabled':'')+'>Demander un indice ('+remaining+')</button></section>'+html;
};
caseV=function(){
 const html=b36Original.caseV(),g=S.g;
 if(!g.players||g.players.length===1)return html;
 const band='<div class="b36-turn" role="status">Tour de '+B36.escape(B36.current(g).name)+' · '+(2-g.actions)+' action(s) restante(s) · '+(g.mode==='coop'?'Coopératif':'Compétitif')+'</div>';
 return html.replace('<main class="wrap main ', '<main class="wrap main ').replace(/(<main class="wrap main [^"]*">)/,'$1'+band);
};
endV=function(){
 let html=b36Original.endV(),g=S.g;
 if(!g.players)return html;
 const detail='<section class="brief"><h2>Résultats des joueurs</h2>'+g.players.map(p=>'<p>'+B36.escape(p.name)+' : '+p.found+' pièce(s), '+p.accusations+' accusation(s)'+(p.out?' · éliminé(e)':'')+(S.res.winner===p.name?' · gagnant(e)':'')+'</p>').join('')+'</section>';
 return html.replace('<div class="cta">',detail+'<div class="cta">');
};
render=function(){
 if(S.view==='setup')app.innerHTML=B36.setupView();
 else if(S.view==='pass')app.innerHTML=B36.passView(S.g);
 else b36Original.render();
};
addClue=function(g,id){const old=g.found.includes(id);b36Original.addClue(g,id);if(!old&&g.players)B36.current(g).found++};
resolve=function(){
 const g=S.g;if(!g.players)return b36Original.resolve();
 const L=LV[g.level],ok=g.sel===g.c.solution.coupable&&g.proofs.length===L.preuves&&g.proofs.every(x=>g.c.solution.preuves.includes(x));
 B36.current(g).accusations++;
 if(ok){
  const winner=B36.current(g).name;
  const score=Math.max(0,3-g.errs-g.hints);
  b36Original.resolve();
  if(S.view==='end'){S.res.stars=score;S.res.winner=g.mode==='versus'?winner:null;const p=prog[g.c.id];if(p&&p.s>score){/* conserver meilleur résultat */}else if(p){p.s=score;saveProg()}}
  return;
 }
 if(g.mode==='versus'){
  B36.current(g).out=true;g.errs++;g.confirm=false;g.proofs=[];
  if(g.players.every(p=>p.out)||g.errs>=L.essais){finish(false,0);return}
  g.turn=B36.next(g);g.actions=0;g.passing=true;S.view='pass';
  g.fb='Accusation incorrecte : joueur éliminé.';
 }else{
  // Résolution existante : essais d'équipe et règles de difficulté.
  const old=g.c.niv;g.c.niv=g.level;try{b36Original.resolve()}finally{g.c.niv=old}
 }
};
document.getElementById('app').addEventListener('click',event=>{
 const el=event.target.closest('[data-b36]');if(!el)return;
 event.preventDefault();event.stopImmediatePropagation();
 const op=el.dataset.b36,g=S.g,q=B36.setup;
 if(op==='home')S.view='home';
 if(op==='ready'){g.passing=false;S.view='case'}
 if(op==='hint'&&g){B36.hint(g)}
 if(op==='launch'&&q){
  const names=q.names.slice(0,q.count).map(x=>x.trim());
  if(names.some(x=>!x)){toast('Renseignez tous les prénoms.');return}
  q.names=names;const c=CASES.find(x=>x.id===q.id);
  S.games[c.id]=newGame(c,q);S.g=S.games[c.id];S.view='case';
 }
 B36.save();render();
},true);
document.getElementById('app').addEventListener('change',event=>{
 if(S.view!=='setup')return;const q=B36.setup,t=event.target;
 if(t.name==='b36-level'){q.level=+t.value;q.hintLimit=LV[q.level].conseils}
 if(t.id==='b36-hints')q.hintsAllowed=t.checked;
 if(t.id==='b36-limit')q.hintLimit=+t.value;
 if(t.id==='b36-count'){q.count=+t.value;while(q.names.length<q.count)q.names.push('Joueur '+(q.names.length+1))}
 if(t.id==='b36-mode')q.mode=t.value;
 if(t.dataset.b36Name!==undefined)q.names[+t.dataset.b36Name]=t.value;
 render();
});
document.getElementById('app').addEventListener('input',event=>{if(S.view==='setup'&&event.target.dataset.b36Name!==undefined)B36.setup.names[+event.target.dataset.b36Name]=event.target.value});
document.getElementById('app').addEventListener('click',event=>{
 const el=event.target.closest('[data-a]');if(!el||!S.g||!S.g.players)return;
 const g=S.g,a=el.dataset.a;
 if(S.view==='case'&&['lieu','examine','ask','show'].includes(a)){B36.action(g);if(g.passing){S.view='pass';render()}}
 if(a==='hint'){/* Ancien bouton du carnet : le remplacer par le système progressif. */}
 B36.save();
});
render();

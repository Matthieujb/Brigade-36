
/* Brigade 36 : configuration et tours locaux, sans modification des six dossiers. */
const B36 = {
 setup:null, games: S.games,
 escape(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
 level(g){return LV[g.level]},
 current(g){return g.players[g.turn]},
 remaining(g){return g.hintsAllowed?Infinity:0},
 save(){try{const o={};for(const [id,g] of Object.entries(S.games)){const {c,...state}=g;o[id]=state}localStorage.setItem('brigade36_games_v3',JSON.stringify(o))}catch(e){}},
 next(g){for(let i=1;i<=g.players.length;i++){const n=(g.turn+i)%g.players.length;if(!g.players[n].out)return n}return g.turn},
 action(g){if(g.players.length<2)return;g.actions++;if(g.actions>=2){g.actions=0;g.turn=this.next(g);g.passing=true;S.view='pass'}},
 hint(g){if(!this.remaining(g))return;const id=g.c.solution.preuves[0],place=g.c.lieux.find(x=>x.objets.includes(id)),person=g.c.suspects.find(x=>x.id===g.c.solution.coupable);const hints=['Comparez les alibis et les déplacements.','Explorez '+(place?place.nom:'les lieux')+' et interrogez '+(person?person.nom:'les témoins')+'.','Examinez la pièce « '+g.c.indices[id].n+' ».'];g.hints++;(g.hintLog=g.hintLog||[]).push(hints[Math.min(2,g.hints-1)]);g.tab='carnet'},
 prep(c){return {id:c.id,level:c.niv,hintsAllowed:true,hintLimit:LV[c.niv].conseils,count:1,mode:'coop',names:['Joueur 1']}},
 setupView(){
 const q=this.setup,c=CASES.find(x=>x.id===q.id),e=v=>this.escape(v);
 const rules={1:'Stagiaire — essais illimités, accusation simple',2:'Inspecteur — 3 essais, 1 preuve',3:'Commissaire — 2 essais, 2 preuves, lieux verrouillés'};
 return topbar(null)+'<main class="wrap b36-setup"><p class="kick">Préparation du dossier</p><h1>'+e(c.titre)+'</h1><p class="lead">Choisissez les règles de cette partie.</p><fieldset><legend>Difficulté</legend>'+[1,2,3].map(n=>'<label class="b36-choice"><input type="radio" name="b36-level" value="'+n+'" '+(q.level===n?'checked':'')+'> '+rules[n]+'</label>').join('')+'</fieldset><fieldset><legend>Indices</legend><label class="b36-choice"><input id="b36-hints" type="checkbox" '+(q.hintsAllowed?'checked':'')+'> Autoriser les indices</label><label for="b36-limit">Nombre de conseils (1 à 5)</label><select id="b36-limit" '+(!q.hintsAllowed?'disabled':'')+'>'+[1,2,3,4,5].map(n=>'<option '+(q.hintLimit===n?'selected':'')+' value="'+n+'">'+n+'</option>').join('')+'</select></fieldset><fieldset><legend>Joueurs</legend><label for="b36-count">Nombre de joueurs (1 à 6)</label><select id="b36-count">'+[1,2,3,4,5,6].map(n=>'<option value="'+n+'" '+(q.count===n?'selected':'')+'>'+n+'</option>').join('')+'</select>'+Array.from({length:q.count},(_,i)=>'<label for="b36-name-'+i+'">Prénom du joueur '+(i+1)+'</label><input id="b36-name-'+i+'" data-b36-name="'+i+'" maxlength="24" value="'+e(q.names[i]||'Joueur '+(i+1))+'">').join('')+'<label for="b36-mode">Mode</label><select id="b36-mode" '+(q.count===1?'disabled':'')+'><option value="coop" '+(q.mode==='coop'?'selected':'')+'>Coopératif — équipe commune</option></select></fieldset><div class="cta"><button class="btn p" data-b36="launch">Ouvrir le dossier</button><button class="btn g" data-b36="home">Retour</button></div></main>';
 },
 passView(g){return topbar(null)+'<main class="wrap b36-setup"><p class="kick">Passage du téléphone</p><h1>Tour de '+this.escape(this.current(g).name)+'</h1><p class="lead">Passez le téléphone à cette personne. Le dossier reste masqué jusqu’à sa confirmation.</p><button class="btn p" data-b36="ready">Je suis prêt</button></main>'}
};
try{const raw=JSON.parse(localStorage.getItem('brigade36_games_v3')||'{}');for(const [id,g] of Object.entries(raw)){const c=CASES.find(x=>x.id===id);if(c&&Array.isArray(g.players)&&g.players.length>=1&&g.players.length<=6)S.games[id]={...g,c}}}catch(e){}

const baseEnd=baseEndV;
function newGame(c,q){
 const log={};c.suspects.forEach(x=>log[x.id]=[]);
 return {c,level:q.level,players:q.names.slice(0,q.count).map(name=>({name,found:0,accusations:0})),hintsAllowed:q.hintsAllowed,hintLimit:Infinity,hints:0,hintLog:[],found:[],log,asked:{},shown:{},errs:0,startedAt:Date.now(),tab:'lieux',lieu:null,sus:null,picker:false,sel:null,proofs:[],confirm:false,brief:true,fb:'',turn:0,actions:0,passing:false};
}
function start(id,fresh){
 const c=CASES.find(x=>x.id===id);if(!c)return;
 if(fresh)delete S.games[id];
 if(S.games[id]){S.g=S.games[id];S.view=S.g.passing?'pass':'case'}
 else {B36.setup=B36.prep(c);S.view='setup'}
}
function caseV(){
 const g=S.g,L=LV[g.level],body=g.tab==='lieux'?lieuxTab(g):g.tab==='carnet'?carnetTab(g):g.tab==='pers'?persTab(g):accTab(g);
 const band=g.players.length>1?'<div class="b36-turn" role="status">Tour de '+B36.escape(g.players[g.turn].name)+' · '+(2-g.actions)+' action(s) restante(s)</div>':'';
 return topbar(g)+'<main class="wrap main '+L.cls+'">'+band+body+'</main>'+nav(g);
}
function endV(){
 const g=S.g,html=baseEnd(),detail='<section class="brief"><h2>Résultats des joueurs</h2>'+g.players.map(p=>'<p>'+B36.escape(p.name)+' : '+p.found+' pièce(s), '+p.accusations+' accusation(s)</p>').join('')+'</section>';
 return html.replace('<div class="cta">',B36Score.summary(g,S.res)+detail+'<div class="cta">');
}
function render(){
 app.innerHTML=S.view==='setup'?B36.setupView():S.view==='pass'?B36.passView(S.g):S.view==='home'?homeV():S.view==='case'?caseV():endV();
}
function addClue(g,id){
 if(g.found.includes(id)||!g.c.indices[id])return;
 g.found.push(id);g.players[g.turn].found++;
 toast('Pièce ajoutée au carnet : '+g.c.indices[id].n);
}
function action(g){
 if(g.players.length<2)return;
 if(++g.actions>=2){g.actions=0;g.turn=(g.turn+1)%g.players.length;g.passing=true;S.view='pass'}
}
app.addEventListener('click',e=>{
 const b=e.target.closest('[data-a],[data-b36]');if(!b||b.disabled)return;
 const a=b.dataset.a||b.dataset.b36,id=b.dataset.id,g=S.g;
 let used=false,top=false;
 if(S.view==='pass'&&!['ready','home'].includes(a))return;
 if(S.view==='setup'&&!['launch','home'].includes(a))return;
 switch(a){
 case 'home':S.view='home';top=true;break;
 case 'open':start(id,false);top=true;break;
 case 'replay':start(id,true);top=true;break;
 case 'launch':{
  const q=B36.setup,c=CASES.find(x=>x.id===q.id),names=q.names.slice(0,q.count).map(x=>x.trim());
  if(names.some(x=>!x)){toast('Renseignez tous les prénoms');return}
  q.names=names;S.g=S.games[c.id]=newGame(c,q);S.view='case';top=true;break;
 }
 case 'ready':g.passing=false;S.view='case';top=true;break;
 case 'tab':
  // Revenir à la liste lorsque l'on sélectionne à nouveau une section.
  // Sinon un lieu ou un suspect déjà ouvert masque les autres entrées.
  if(id==='lieux')g.lieu=null;
  else if(id==='pers'){g.sus=null;g.picker=false;}
  else g.lieu=null;
  g.tab=id;top=true;break;
 case 'lieu':{
  const l=g.c.lieux.find(x=>x.id===id);
  if(!l||(g.level===3&&l.verrou&&!g.found.includes(l.verrou)))break;
  g.lieu=id;used=true;top=true;break;
 }
 case 'lieux':g.lieu=null;top=true;break;
 case 'brief':g.brief=!g.brief;break;
 case 'examine':{
  const l=g.c.lieux.find(x=>x.id===g.lieu);
  if(l&&l.objets.includes(id)&&!g.found.includes(id)){addClue(g,id);used=true}
  break;
 }
 case 'pers':g.sus=id;g.picker=false;top=true;break;
 case 'perslist':g.sus=null;g.picker=false;top=true;break;
 case 'ask':{
  const x=g.c.suspects.find(x=>x.id===g.sus),i=+b.dataset.i,q=x&&x.qs[i];
  if(!q||(g.asked[x.id]||[]).includes(i))break;
  (g.asked[x.id]=g.asked[x.id]||[]).push(i);
  g.log[x.id].push({k:'q',q:q.q,a:q.a});
  if(q.gain)addClue(g,q.gain);
  used=true;break;
 }
 case 'picker':g.picker=!g.picker;break;
 case 'show':{
  const x=g.c.suspects.find(x=>x.id===g.sus),r=x&&x.conf&&x.conf[id];
  if(!x||!g.found.includes(id)||(g.shown[x.id]||[]).includes(id))break;
  (g.shown[x.id]=g.shown[x.id]||[]).push(id);
  g.log[x.id].push({k:'c',n:g.c.indices[id].n,t:r?r.t:'Cette pièce ne semble pas le troubler.'});
  if(r&&r.gain)addClue(g,r.gain);
  g.picker=false;used=true;break;
 }
 case 'hint':B36.hint(g);break;
 case 'sel':g.sel=id;g.proofs=[];g.confirm=false;g.fb='';break;
 case 'proof':{
  const n=LV[g.level].preuves;
  if(!g.found.includes(id))break;
  if(g.proofs.includes(id))g.proofs=g.proofs.filter(x=>x!==id);
  else if(g.proofs.length<n)g.proofs.push(id);
  else toast('Retirez une pièce avant de continuer');
  g.confirm=false;break;
 }
 case 'accuse':{
  if(!g.sel||g.proofs.length!==LV[g.level].preuves)break;
  if(!g.confirm)g.confirm=true;
  else resolve();
  break;
 }
 case 'cancel':g.confirm=false;break;
 default:return;
 }
 if(used&&S.view==='case')action(g);
 B36.save();render();if(top)window.scrollTo(0,0);
});
app.addEventListener('change',e=>{
 if(S.view!=='setup')return;
 const q=B36.setup,t=e.target;
 // Ne jamais reconstruire le formulaire sur le blur d'un prénom :
 // le clic suivant sur « Ouvrir le dossier » serait perdu.
 if(t.dataset.b36Name!==undefined){q.names[+t.dataset.b36Name]=t.value;return}
 if(t.name==='b36-level'){q.level=+t.value;return}
 if(t.id==='b36-hints'){q.hintsAllowed=t.checked;return}
 if(t.id==='b36-count'){
  q.count=+t.value;
  while(q.names.length<q.count)q.names.push('Joueur '+(q.names.length+1));
  render();
 }
});
app.addEventListener('input',e=>{
 if(S.view==='setup'&&e.target.dataset.b36Name!==undefined)B36.setup.names[+e.target.dataset.b36Name]=e.target.value;
});
render();

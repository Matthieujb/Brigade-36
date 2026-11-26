// Structural validation only; narrative approval remains mandatory.
export function validateCase(c) {
 const errors=[];
 const check=(ok,msg)=>{if(!ok)errors.push(msg)};
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const str=x=>typeof x==='string'&&x.trim().length>0;
 if(!obj(c))return ['Dossier invalide'];
 check(/^hebdo-\d{4}-\d{2}-\d{2}$/.test(c.id||''),'Identifiant hebdomadaire invalide');
 check(Number.isInteger(c.niv)&&c.niv>=1&&c.niv<=5,'Difficulté hors limites');
 for(const k of ['titre','intro','accroche'])check(str(c[k]),'Texte manquant : '+k);
 const suspects=Array.isArray(c.suspects)?c.suspects:[], lieux=Array.isArray(c.lieux)?c.lieux:[], indices=obj(c.indices)?c.indices:{};
 const ids=new Set(suspects.map(s=>s?.id)), clues=new Set(Object.keys(indices));
 check(suspects.length>=3&&ids.size===suspects.length,'Suspects insuffisants ou doublons');
 check(lieux.length>0&&new Set(lieux.map(l=>l?.id)).size===lieux.length,'Lieux manquants ou doublons');
 for(const [id,v] of Object.entries(indices))check(obj(v)&&str(v.n)&&str(v.t),'Pièce invalide : '+id);
 const available=new Set();
 for(const s of suspects){
  check(obj(s)&&str(s.id)&&str(s.nom)&&str(s.role)&&str(s.alibi)&&Number.isInteger(s.age),'Suspect incomplet');
  check(Array.isArray(s?.qs)&&s.qs.length>0,'Questions manquantes');
  for(const q of Array.isArray(s?.qs)?s.qs:[]){check(str(q?.q)&&str(q?.a),'Question invalide');if(q?.gain){check(clues.has(q.gain),'Gain inconnu');available.add(q.gain)}}
 }
 let changed=true;
 while(changed){const before=available.size;
 for(const l of lieux){if(!l?.verrou||available.has(l.verrou))for(const id of Array.isArray(l?.objets)?l.objets:[])available.add(id)}
 for(const s of suspects)for(const [id,r] of Object.entries(s?.conf||{}))if(available.has(id)&&r?.gain)available.add(r.gain);
 changed=available.size!==before;}
 for(const l of lieux){check(str(l?.id)&&str(l?.nom)&&str(l?.desc)&&Array.isArray(l?.objets),'Lieu incomplet');for(const id of Array.isArray(l?.objets)?l.objets:[])check(clues.has(id),'Objet inconnu');if(l?.verrou)check(clues.has(l.verrou)&&available.has(l.verrou),'Verrou inaccessible')}
 for(const s of suspects)for(const [id,r] of Object.entries(s?.conf||{})){check(clues.has(id)&&str(r?.t),'Confrontation invalide');if(r?.gain)check(clues.has(r.gain),'Gain inconnu')}
 const sol=c.solution,p=sol?.preuves;
 check(ids.has(sol?.coupable)&&str(sol?.coupable)&&str(sol?.expl),'Solution incomplète');
 check(Array.isArray(p)&&p.length>=2&&new Set(p).size===p.length&&p.every(id=>clues.has(id)&&available.has(id)),'Preuves décisives invalides ou inaccessibles');
 check(Array.isArray(c.hints)&&c.hints.length>=3&&c.hints.every(str),'Indices progressifs manquants');
 return errors;
}

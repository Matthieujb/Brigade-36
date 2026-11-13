/* Brigade 36 — barème configurable. Source : cahier de conception Système de score. */
const B36Score={
 config:{1:{mult:1,hint:5,error:10,reference:15},2:{mult:2,hint:10,error:20,reference:25},3:{mult:3,hint:15,error:30,reference:40}},
 calculate(g,won){
  const cfg=this.config[g.level]||this.config[1];
  const elapsed=Math.max(0,Math.round((Date.now()-(g.startedAt||Date.now()))/60000));
  const total=Object.keys(g.c.indices||{}).length;
  const keys=(g.c.solution.preuves||[]);
  const discovered=keys.filter(id=>g.found.includes(id)).length;
  const investigation=won?100:Math.min(70,Math.round(70*(total?g.found.length/total:0)));
  const time=won?Math.round(50*Math.max(0,Math.min(1,(cfg.reference-elapsed)/(cfg.reference/2)))):0;
  const perfection=won&&g.errs===0&&g.hints===0?30:0;
  const hintsPenalty=Math.min(50,g.hints*cfg.hint);
  const errorsPenalty=g.errs*cfg.error;
  const coop=won&&g.players.length>1&&g.players.every(p=>p.found>0)?20:0;
  const raw=investigation+time+perfection-hintsPenalty-errorsPenalty;
  const points=won?Math.max(10,Math.round(raw*cfg.mult+coop)):0;
  const max=(100+50+30)*cfg.mult+(g.players.length>1?20:0);
  const percent=max?points/max:0;
  const stars=won?(percent>=.85?3:percent>=.65?2:1):0;
  return {points,stars,max,elapsed,investigation,time,perfection,hintsPenalty,errorsPenalty,coop,mult:cfg.mult,discovered};
 },
 rank(points){return points>=6000?'Légende':points>=2000?'Commissaire':points>=500?'Inspecteur':'Stagiaire'},
 summary(g,result){
  const r=result.breakdown;if(!r)return '';
  const e=B36Score.escape;
  return '<section class="brief" aria-label="Détail du score"><h2>Rapport de score</h2><p><strong>'+r.points+' points</strong> · '+r.stars+' étoile(s) · '+r.elapsed+' min</p><ul><li>Enquête : '+r.investigation+' pts</li><li>Temps : +'+r.time+' pts</li><li>Sans faute : +'+r.perfection+' pts</li><li>Indices : −'+r.hintsPenalty+' pts</li><li>Accusations erronées : −'+r.errorsPenalty+' pts</li><li>Multiplicateur : ×'+r.mult+'</li><li>Équipe complète : +'+r.coop+' pts</li></ul><p>Rang : '+e(this.rank(r.points))+'</p></section>';
 },
 escape(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
};

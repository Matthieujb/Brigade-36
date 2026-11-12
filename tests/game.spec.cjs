const {test,expect}=require('@playwright/test');
const cases=['f1','f2','i1','i2','c1','c2'];
for(const id of cases)for(const level of [1,2,3])for(const count of [1,2,6]){
 test(id+' · grade '+level+' · '+count+' joueur(s)',async({page})=>{
  await page.goto('http://127.0.0.1:8765/');
  await page.locator('[data-a="open"][data-id="'+id+'"]').click();
  await expect(page.locator('.b36-setup')).toBeVisible();
  await page.locator('input[name="b36-level"][value="'+level+'"]').check();
  await page.locator('#b36-count').selectOption(String(count));
  for(let i=0;i<count;i++)await page.locator('#b36-name-'+i).fill('Agent '+(i+1));
  await page.locator('[data-b36="launch"]').click();
  const dossier=await page.evaluate(id=>CASES.find(c=>c.id===id),id);
  const ready=async()=>{if(await page.locator('[data-b36="ready"]').count())await page.locator('[data-b36="ready"]').click()};
  const tab=async name=>{await ready();await page.locator('[data-a="tab"][data-id="'+name+'"]').click()};
  const found=async()=>page.evaluate(()=>S.g.found.slice());
  for(let round=0;round<8;round++){
   await tab('lieux');
   for(const loc of dossier.lieux){
    await ready();
    await tab('lieux');
    const btn=page.locator('[data-a="lieu"][data-id="'+loc.id+'"]');
    if(await btn.isDisabled())continue;
    await btn.click();await ready();
    for(const clue of loc.objets){
     const obj=page.locator('[data-a="examine"][data-id="'+clue+'"]');
     if(await obj.count()){await obj.click();await ready()}
    }
   }
   await tab('pers');
   for(const suspect of dossier.suspects){
    await ready();await tab('pers');
    await page.locator('[data-a="pers"][data-id="'+suspect.id+'"]').click();
    for(let j=0;j<suspect.qs.length;j++){
     const q=page.locator('[data-a="ask"][data-i="'+j+'"]');
     if(await q.count()){await q.click();await ready()}
    }
    const pieces=await found();
    for(const clue of pieces){
     const open=page.locator('[data-a="picker"]');
     if(await open.count()&&await open.isEnabled()){
      await open.click();
      const show=page.locator('[data-a="show"][data-id="'+clue+'"]');
      if(await show.count()&&await show.isEnabled()){await show.click();await ready()}
      else if(await page.locator('[data-a="picker"]').count())await page.locator('[data-a="picker"]').click();
     }
    }
   }
   if(dossier.solution.preuves.every(x=>false||x in dossier.indices)&&
      (await found()).filter(x=>dossier.solution.preuves.includes(x)).length>=level-1)break;
  }
  await tab('accuser');
  await page.locator('[data-a="sel"][data-id="'+dossier.solution.coupable+'"]').click();
  for(const clue of dossier.solution.preuves.slice(0,level-1)){
   await page.locator('[data-a="proof"][data-id="'+clue+'"]').click();
  }
  await page.locator('[data-a="accuse"]').click();
  await page.locator('[data-a="accuse"]').click();
  await expect(page.locator('.verdict.win')).toBeVisible();
  await expect(page.getByText('Résultats des joueurs')).toBeVisible();
  const score=await page.evaluate(()=>S.res.stars);
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('brigade36'))[id].s,id);
  expect(saved).toBe(score);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 });
}

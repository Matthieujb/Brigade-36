const {test,expect}=require('@playwright/test');
const DOSSIERS=['f1','f2','m1','m2','c1','c2'];
test.setTimeout(25000);

async function jouer(page,id,grade,joueurs){
  const contexte=id+' / grade '+grade+' / '+joueurs+' joueur(s)';
  const log=(message)=>console.log('[Brigade36] '+contexte+' : '+message);
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-a="open"][data-id="'+id+'"]').click();
  await expect(page.locator('.b36-setup')).toBeVisible();
  await page.locator('input[name="b36-level"][value="'+grade+'"]').check();
  await page.locator('#b36-count').selectOption(String(joueurs));
  for(let i=0;i<joueurs;i++)await page.locator('#b36-name-'+i).fill('Agent '+(i+1));
  await page.locator('[data-b36="launch"]').click();
  const launchState=await page.evaluate(()=>({view:S.view,hasGame:!!S.g,setup:B36.setup,html:document.querySelector('#app')?.innerText.slice(0,300)}));
  expect(launchState.hasGame,'Après ouverture : '+JSON.stringify(launchState)).toBe(true);
  const dossier=await page.evaluate(id=>CASES.find(c=>c.id===id),id);
  expect(dossier).toBeTruthy();
  const ready=async()=>{
    if(await page.locator('[data-b36="ready"]').count()){
      await expect(page.getByText('Passage du téléphone')).toBeVisible();
      await page.locator('[data-b36="ready"]').click();
    }
  };
  const click=async(selector)=>{
    await ready();
    const item=page.locator(selector);
    if(!await item.count()||!await item.isVisible()||!await item.isEnabled())return false;
    await item.click({timeout:1500});
    await ready();
    return true;
  };
  const tab=async(name)=>{await ready();await page.locator('[data-a="tab"][data-id="'+name+'"]').click({timeout:1500})};
  const state=()=>page.evaluate(()=>({found:S.g.found.slice(),asked:JSON.stringify(S.g.asked),shown:JSON.stringify(S.g.shown)}));
  const target=dossier.solution.preuves.slice(0,grade-1);
  log('Début : preuves attendues '+target.join(', '));
  for(let pass=0;pass<5;pass++){
    const before=await state();
    await tab('lieux');
    for(const lieu of dossier.lieux){
      await tab('lieux');
      if(!await click('[data-a="lieu"][data-id="'+lieu.id+'"]'))continue;
      for(const piece of lieu.objets)await click('[data-a="examine"][data-id="'+piece+'"]');
    }
    await tab('pers');
    for(const suspect of dossier.suspects){
      await tab('pers');
      await click('[data-a="pers"][data-id="'+suspect.id+'"]');
      for(let i=0;i<suspect.qs.length;i++)await click('[data-a="ask"][data-i="'+i+'"]');
      const pieces=(await state()).found;
      for(const piece of pieces){
        const picker=page.locator('[data-a="picker"]');
        if(!await picker.count()||!await picker.isEnabled())break;
        await picker.click({timeout:1500});
        const shown=await click('[data-a="show"][data-id="'+piece+'"]');
        if(!shown&&await page.locator('[data-a="picker"]').count())await page.locator('[data-a="picker"]').click({timeout:1500});
      }
    }
    const after=await state();
    log('Passe '+(pass+1)+' : '+after.found.length+' pièces');
    if(target.every(p=>after.found.includes(p)))break;
    if(JSON.stringify(before)===JSON.stringify(after))throw new Error('Enquête bloquée : aucune nouvelle pièce, question ou confrontation. Preuves manquantes : '+target.filter(p=>!after.found.includes(p)).join(', '));
  }
  const found=(await state()).found;
  expect(found,'Preuves accessibles du dossier '+id).toEqual(expect.arrayContaining(target));
  await tab('accuser');
  await click('[data-a="sel"][data-id="'+dossier.solution.coupable+'"]');
  for(const piece of target)expect(await click('[data-a="proof"][data-id="'+piece+'"]')).toBe(true);
  expect(await click('[data-a="accuse"]')).toBe(true);
  expect(await click('[data-a="accuse"]')).toBe(true);
  await expect(page.locator('.verdict.win')).toBeVisible();
  await expect(page.getByText('Résultats des joueurs')).toBeVisible();
  const result=await page.evaluate(id=>({score:S.res.stars,saved:JSON.parse(localStorage.getItem('brigade36'))[id]?.s,width:document.documentElement.scrollWidth,viewport:window.innerWidth}),id);
  expect(result.saved,'Score sauvegardé identique au score affiché').toBe(result.score);
  expect(result.width,'Aucun débordement horizontal').toBeLessThanOrEqual(result.viewport);
  log('SUCCÈS · '+result.score+' étoile(s)');
}
for(const id of DOSSIERS)for(const grade of [1,2,3])for(const joueurs of [1,2,6]){
  test(id+' · grade '+grade+' · '+joueurs+' joueur(s)',async({page})=>jouer(page,id,grade,joueurs));
}

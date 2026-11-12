const { test, expect } = require('@playwright/test');
for (const level of [1,2,3]) for (const count of [1,2,6]) {
 test('parcours complet niveau '+level+', '+count+' joueur(s)', async ({page})=>{
  await page.goto('http://127.0.0.1:8765/');
  await page.locator('[data-a="open"][data-id="f1"]').click();
  await expect(page.locator('.b36-setup')).toBeVisible();
  await page.locator('input[name="b36-level"][value="'+level+'"]').check();
  await page.locator('#b36-count').selectOption(String(count));
  for(let i=0;i<count;i++) await page.locator('#b36-name-'+i).fill('Agent '+(i+1));
  await page.locator('[data-b36="launch"]').click();
  await expect(page.locator('[data-a="tab"][data-id="lieux"]')).toBeVisible();
  const dossier=await page.evaluate(()=>CASES.find(c=>c.id==='f1'));
  const ready=async()=>{if(await page.locator('[data-b36="ready"]').count())await page.locator('[data-b36="ready"]').click()};
  for(const place of dossier.lieux){
   await ready();
   await page.locator('[data-a="tab"][data-id="lieux"]').click();
   await page.locator('[data-a="lieu"][data-id="'+place.id+'"]').click();
   await ready();
   for(const clue of place.objets){
    const button=page.locator('[data-a="examine"][data-id="'+clue+'"]');
    if(await button.count()){await button.click();await ready()}
   }
  }
  await page.locator('[data-a="tab"][data-id="accuser"]').click();
  await page.locator('[data-a="sel"][data-id="'+dossier.solution.coupable+'"]').click();
  for(const id of dossier.solution.preuves.slice(0,level-1)){
   await page.locator('[data-a="proof"][data-id="'+id+'"]').click();
  }
  await page.locator('[data-a="accuse"]').click();
  await page.locator('[data-a="accuse"]').click();
  await expect(page.locator('.verdict.win')).toBeVisible();
  await expect(page.locator('text=Résultats des joueurs')).toBeVisible();
  for(let i=0;i<count;i++)await expect(page.locator('text=Agent '+(i+1)+' :')).toBeVisible();
  const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  expect(horizontal).toBe(false);
 });
}

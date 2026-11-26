import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8'), game=fs.readFileSync('game-extension.js','utf8');
test('scripts parse',()=>{for(const p of ['game-extension.js','interrogations.js','score.js'])new vm.Script(fs.readFileSync(p,'utf8'));for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);});
test('no embedded legacy catalogue',()=>{assert.match(html,/const CASES=\[\]/);assert.match(html,/B36API.call\('\/cases'\)/)});
test('server action routing',()=>{for(const route of ['start','evidence','question','confront','hint','accuse','report'])assert.ok(game.includes("'/session/"+route+"'"));assert.ok(!game.includes('else resolve();'))});
test('diagnostic expected report refusal',()=>assert.ok(fs.readFileSync('test-moteur.html','utf8').includes("kind==='report'&&r.status===409")));

test('restore active game and multiplayer turn from storage',()=>{
 const storage=new Map(),ctx=vm.createContext({structuredClone,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},toast:()=>{},app:{addEventListener(){},innerHTML:''},S:{games:{},view:'home'},CASES:[{id:'f1',indices:{e:{n:'Evidence'}},suspects:[]}],baseEndV(){},homeV(){return ''}});
 new vm.Script(game).runInContext(ctx);
 vm.runInContext("S.g=S.games.f1={c:CASES[0],token:'test',players:[{name:'A',found:1},{name:'B',found:0}],turn:0,actions:1,evidenceTexts:{e:'text'},found:['e']};S.view='case';B36.action(S.g);B36.save();S.games={};S.g=null;S.view='home';restoreServerGames();",ctx);
 assert.equal(vm.runInContext('S.view',ctx),'pass');
 assert.equal(vm.runInContext('S.g.turn',ctx),1);
 assert.equal(vm.runInContext('S.g.c.indices.e.t',ctx),'text');
 assert.equal(vm.runInContext('S.g.token',ctx),'test');
});
test('multiplayer score bonus and penalties',()=>{
 const ctx=vm.createContext({});new vm.Script(fs.readFileSync('score.js','utf8')).runInContext(ctx);
 const result=vm.runInContext("B36Score.calculate({level:2,c:{indices:{a:{},b:{}},solution:{preuves:['a']}},found:['a','b'],players:[{found:1},{found:1}],errs:1,hints:1,startedAt:Date.now()},true)",ctx);
 assert.equal(result.coop,20);assert.equal(result.errorsPenalty,20);assert.equal(result.hintsPenalty,10);assert.ok(Number.isFinite(result.points));
});

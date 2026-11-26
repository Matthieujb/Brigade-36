import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8'), game=fs.readFileSync('game-extension.js','utf8');
test('scripts parse',()=>{for(const p of ['game-extension.js','interrogations.js','score.js'])new vm.Script(fs.readFileSync(p,'utf8'));for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);});
test('no embedded legacy catalogue',()=>{assert.match(html,/const CASES=\[\]/);assert.match(html,/B36API.call\('\/cases'\)/)});
test('server action routing',()=>{for(const route of ['start','evidence','question','confront','hint','accuse','report'])assert.ok(game.includes("'/session/"+route+"'"));assert.ok(!game.includes('else resolve();'))});
test('diagnostic expected report refusal',()=>assert.ok(fs.readFileSync('test-moteur.html','utf8').includes("kind==='report'&&r.status===409")));

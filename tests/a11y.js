/* Showcall accessibility check (axe-core, WCAG 2 A/AA + best practice). Run from the repo folder:
     python3 -m http.server 8765 &
     npm i --no-save axe-core playwright     (or set NODE_PATH to where they are installed)
     node tests/a11y.js
   Scans the website, owner portal, BEO Studio and every app view (start, crew tabs, planner, manager, Live Mode)
   at 390 px and 1300 px. Fails (exit 1) on any serious or critical issue; moderate ones are listed only. */
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/';
let pw, AXE;
try { pw = require('playwright'); AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'); }
catch (e) { console.error('Install first: npm i --no-save axe-core playwright'); process.exit(2); }

const VIEWS = [
  ['website', 'index.html'], ['owner portal', 'owner.html'], ['BEO Studio', 'beo.html'], ['app start', 'app.html'],
  ...['shift', 'team', 'chat', 'tasks', 'games', 'watch'].map(t => ['crew ' + t, 'app.html', async p => { await p.click('[data-lay=floor]'); await p.click(`[data-tab=${t}]`); }]),
  ['planner', 'app.html', async p => p.click('[data-lay=planner]')],
  ['manager', 'app.html', async p => p.click('[data-lay=manager]')],
  ['live (crew)', 'app.html', async p => { await p.click('[data-lay=floor]'); await p.click('[data-tab=shift]'); await p.selectOption('#me', 'Dana'); await p.click('[data-act=live-on]'); }],
  ['live (manager)', 'app.html', async p => { await p.click('[data-lay=planner]'); await p.click('[data-act=live-on]'); }],
];

(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  let bad = 0;
  for (const width of [390, 1300]) {
    const ctx = await browser.newContext({ viewport: { width, height: 860 } });
    const p = await ctx.newPage();
    for (const [name, url, go] of VIEWS) {
      await p.goto(BASE + url); await p.waitForTimeout(250);
      if (go) {
        await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('em-v2-crew-watch') || '{}'); s.started = true; s.live = false; localStorage.setItem('em-v2-crew-watch', JSON.stringify(s)); });
        await p.reload(); await p.waitForTimeout(250); await go(p);
      }
      await p.addScriptTag({ content: AXE });
      const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'best-practice'] })).violations
        .map(x => ({ id: x.id, impact: x.impact, n: x.nodes.length, at: x.nodes.slice(0, 3).map(n => n.target.join(' ')) })));
      const serious = v.filter(x => x.impact === 'serious' || x.impact === 'critical');
      bad += serious.length;
      console.log((serious.length ? 'FAIL ' : 'PASS ') + `${name} @${width}` + (v.length ? '  ' + v.map(x => `${x.impact}:${x.id}(${x.n}) ${x.at.join(', ')}`).join(' | ') : ''));
    }
    await ctx.close();
  }
  await browser.close();
  console.log(bad ? `\n${bad} serious/critical issue types` : '\nNo serious or critical accessibility issues');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

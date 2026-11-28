/* Showcall smoke tests. Run from the repo folder:
     python3 -m http.server 8765 &      (serve the folder)
     node tests/smoke.js                (needs Playwright: npm i -D playwright, or puppeteer-core with CHROME=/path)
   Checks: no page errors on all four pages, Live Mode, event codes, store.js, running late, crew locator,
   quotes, payroll export, BEO Studio, Ready taps, skip links and focus, no sideways scroll at 390 px and 1300 px,
   and Live Mode on a 1024 x 768 landscape tablet. Exit code 1 on any failure. */
const BASE = process.env.BASE || 'http://localhost:8765/';
let pw;
try { pw = require('playwright'); } catch (e) { console.error('Install Playwright first: npm i -D playwright'); process.exit(2); }

const results = [];
const ok = (name, cond, extra) => { results.push({ name, pass: !!cond, extra }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra && !cond ? '  ' + extra : '')); };

async function page(browser, width, errors) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, acceptDownloads: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  return { ctx, p };
}
const noSideScroll = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const state = (p, k) => p.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), k);

(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  for (const width of [390, 1300]) {
    const errors = [];
    const { ctx, p } = await page(browser, width, errors);
    const W = ` @${width}`;

    // Website
    await p.goto(BASE + 'index.html'); await p.waitForTimeout(300);
    ok('website loads' + W, await p.title());
    ok('website no sideways scroll' + W, await noSideScroll(p));

    // App: store.js present
    await p.goto(BASE + 'app.html'); await p.waitForTimeout(300);
    ok('store.js loaded' + W, await p.evaluate(() => !!window.ShowcallStore && ShowcallStore.status().adapter === 'local'));
    ok('start screen' + W, await p.locator('[data-start=crew]').count());
    await p.click('[data-start=crew]');
    ok('crew shift tab' + W, await p.locator('text=My shift').count());
    ok('app no sideways scroll (crew)' + W, await noSideScroll(p));

    // Live Mode
    await p.click('[data-act=live-on]');
    ok('live mode opens' + W, await p.locator('main.live').count());
    const cd1 = await p.locator('#lcd').textContent();
    ok('live countdown shows m:ss' + W, /^\d+:\d{2}(:\d{2})?$/.test(cd1.trim()), cd1);
    ok('live specials verbatim' + W, await p.locator('.live .verb', { hasText: 'free from all nuts, all seeds (sesame etc.) tomatoes, hummus, gluten, lactose and egg derived products' }).count());
    ok('crew cannot advance specials in live' + W, (await p.locator('.live [data-spec]').count()) === 0);
    ok('live no sideways scroll' + W, await noSideScroll(p));
    await p.click('[data-act=play]'); await p.waitForTimeout(1600);
    const cd2 = await p.locator('#lcd').textContent();
    ok('live countdown ticks' + W, cd1 !== cd2, cd1 + ' -> ' + cd2);
    await p.click('[data-act=play]');
    await p.click('[data-act=live-off]');
    ok('live mode exits' + W, (await p.locator('main.live').count()) === 0 && await p.locator('nav.tabs').count());
    // jump into the documentary pause (7:30 PM = 1170 min) with the app's own jump handler
    await p.evaluate(() => { const b = document.createElement('button'); b.dataset.jump = '1170'; document.body.appendChild(b); b.click(); b.remove(); });
    await p.click('[data-act=live-on]');
    ok('live shows pause red' + W, await p.locator('.lnow.stop', { hasText: 'SERVICE STOPS' }).count());
    await p.keyboard.press('Escape');
    ok('Escape leaves live' + W, (await p.locator('main.live').count()) === 0);

    // Event codes: crew bad code, manager creates, crew joins
    await p.fill('#jcode', 'abc'); await p.click('#jform button[type=submit]');
    ok('join rejects short code' + W, await p.locator('text=Codes are 6 letters').count());
    await p.click('[data-lay=manager]');
    await p.click('[data-act=code-new]');
    const code = (await p.locator('.codebig').textContent()).trim();
    ok('manager creates 6-letter code' + W, /^[A-HJKMNP-TV-Z]{6}$/.test(code), code);
    ok('manager no sideways scroll' + W, await noSideScroll(p));
    await p.click('[data-lay=floor]');
    await p.selectOption('#me', 'Dana');
    await p.fill('#jcode', code.toLowerCase()); await p.click('#jform button[type=submit]');
    ok('crew joins with code' + W, await p.locator('h2', { hasText: 'Joined event' }).count());
    await p.click('[data-act=code-leave]');
    await p.fill('#jcode', 'ZZZZZZ'); await p.click('#jform button[type=submit]');
    ok('unknown code explained' + W, await p.locator('text=No event with that code').count());

    // Running late (planner)
    await p.click('[data-lay=planner]');
    const lateBefore = (await state(p, 'em-v2-crew-watch')).late.length;
    await p.click('[data-latemin="10"]').catch(() => {});
    await p.click('[data-act=late-preview]');
    await p.click('[data-act=late-apply]');
    const s1 = await state(p, 'em-v2-crew-watch');
    ok('running late applies' + W, s1.late.length === lateBefore + 1);
    ok('planner live button' + W, await p.locator('[data-act=live-on]').count());
    await p.click('[data-act=live-on]');
    ok('manager can advance specials in live' + W, await p.locator('.live [data-spec]').count());
    await p.locator('.live [data-spec]').first().click();
    ok('special advances' + W, (await state(p, 'em-v2-crew-watch')).specials[0].status === 1);
    ok('late Got it in live' + W, await p.locator('.live [data-ack]').count());
    // Ready tap: managers see the count and who isn't ready
    ok('manager sees ready count in live' + W, await p.locator('.live .lrdy .st', { hasText: /of \d+ ready/ }).count());
    await p.click('[data-act=simready]');
    ok('demo crew taps fill ready list' + W, /[1-9]\d* of \d+ ready/.test(await p.locator('.live .lrdy .st').textContent()));
    await p.click('[data-act=live-off]');
    ok('focus returns to Open Live Mode' + W, await p.evaluate(() => document.activeElement && document.activeElement.dataset.act === 'live-on'));
    ok('planner no sideways scroll' + W, await noSideScroll(p));
    // Crew taps Ready for the next beat, and can undo
    await p.click('[data-lay=floor]'); await p.selectOption('#me', 'Dana');
    await p.click('[data-act=live-on]');
    const danaReady = async () => Object.values((await state(p, 'em-v2-crew-watch')).ready || {}).some(v => v.includes('Dana'));
    if (await danaReady()) await p.click('[data-act=ready]'); // the demo fill-in above may have marked Dana ready
    await p.click('[data-act=ready]');
    ok('crew Ready tap saves' + W, await danaReady());
    ok('Ready keeps keyboard focus' + W, await p.evaluate(() => document.activeElement && document.activeElement.dataset.act === 'ready'));
    ok('crew does not see others\' names' + W, (await p.locator('.live .lrdy .names').count()) === 0);
    await p.click('[data-act=ready]');
    ok('crew Ready undo' + W, !(await danaReady()));
    if (width >= 960) ok('live two columns on wide landscape' + W, await p.evaluate(() => getComputedStyle(document.querySelector('main.live')).display === 'grid' && document.querySelector('.lspc').getBoundingClientRect().left > innerWidth / 2 - 40));
    else ok('live one column on phone' + W, await p.evaluate(() => getComputedStyle(document.querySelector('main.live')).display === 'flex'));
    await p.click('[data-act=live-off]');
    // Accessibility basics: skip link, one h1, main landmark, tab clicks keep focus
    ok('app skip link + main + h1' + W, await p.evaluate(() => !!document.querySelector('a.skip[href="#main"]') && !!document.querySelector('main#main') && document.querySelectorAll('h1').length === 1));
    await p.focus('[data-tab=chat]'); await p.keyboard.press('Enter');
    ok('tab change keeps focus on tab' + W, await p.evaluate(() => document.activeElement && document.activeElement.dataset.tab === 'chat'));
    await p.click('[data-tab=shift]');

    // Crew locator
    await p.click('[data-lay=floor]'); await p.selectOption('#me', 'Dana'); await p.click('[data-tab=team]');
    const ci = p.locator('[data-act=clockin]');
    if (await ci.count()) { await ci.first().click(); await p.click('[data-act=clockin-share]'); }
    const s2 = await state(p, 'em-v2-crew-watch');
    ok('crew locator: clock in + opt-in share' + W, s2.onClock.Dana === true && s2.sharing.Dana === true);
    ok('crew map renders' + W, await p.locator('svg.map, .map').count());

    // Owner portal: quotes + payroll export
    await p.goto(BASE + 'owner.html#quotes'); await p.waitForTimeout(300);
    ok('owner store ok' + W, await p.evaluate(() => !!window.ShowcallStore));
    await p.fill('[data-q=name]', 'Test Gala'); await p.fill('[data-q=guests]', '150');
    await p.click('#qsave');
    ok('quote saves' + W, ((await state(p, 'showcall-owner')).quotes || []).length > 0);
    ok('owner no sideways scroll' + W, await noSideScroll(p));
    await p.goto(BASE + 'owner.html#payroll'); await p.waitForTimeout(300);
    await p.click('#payapprove');
    const dl = p.waitForEvent('download', { timeout: 3000 }).catch(() => null);
    await p.click('#payexport');
    const d = await dl;
    ok('payroll CSV export' + W, d && /\.csv$/.test(d.suggestedFilename()));

    // BEO Studio
    await p.goto(BASE + 'beo.html'); await p.waitForTimeout(300);
    ok('BEO Studio loads' + W, await p.locator('#paper').count());
    await p.click('[data-tpl=wedding]').catch(() => {});
    await p.waitForTimeout(200);
    ok('BEO template saves through store' + W, ((await state(p, 'showcall-beo')) || {}).name === 'Wedding reception');
    ok('BEO no sideways scroll' + W, await noSideScroll(p));

    for (const u of ['index.html', 'owner.html', 'beo.html']) {
      await p.goto(BASE + u); await p.waitForTimeout(200);
      ok(u + ' skip link + main' + W, await p.evaluate(() => !!document.querySelector('a.skip[href="#main"]') && !!document.querySelector('main#main')));
    }

    ok('no page errors' + W, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  // Tablet on the pass: 1024 x 768 landscape Live Mode
  {
    const errors = [];
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(String(e)));
    await p.goto(BASE + 'app.html'); await p.waitForTimeout(300);
    await p.click('[data-start=planner]'); await p.click('[data-act=live-on]');
    ok('tablet landscape: two columns', await p.evaluate(() => { const a = document.querySelector('.lcol').getBoundingClientRect(), b = document.querySelector('.lspc').getBoundingClientRect(); return b.left >= a.right - 1 && Math.abs(a.top - b.top) < 4; }));
    ok('tablet landscape: countdown above the fold', await p.evaluate(() => document.querySelector('#lcd').getBoundingClientRect().bottom < innerHeight));
    ok('tablet landscape: no sideways scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    ok('tablet landscape: no page errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

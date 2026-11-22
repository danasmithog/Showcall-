# Showcall roadmap to a fully live app

The daily build task works from the top of "Next up". Move an item to "Done" with the date when it ships.
Items marked **(Dana)** need Dana to do something, such as create an account, approve a cost or flip a setting. The task never does those.

## Next up
1. Accessibility pass: contrast, focus order, screen-reader labels on every page (Live Mode already has a timer role and labelled buttons).
2. Web Push server design (VAPID). The service worker already handles `push`. Write the server as a small, documented function ready to deploy (code only, nothing deployed). **(Dana)**: choose a host to run it.
3. Quote builder: menu items from BEO Studio templates, and an e-sign-ready proposal layout.
4. Live Mode follow-ups: a crew "Ready" tap per beat for managers to see, and a landscape layout for a tablet on the pass.
5. Cloud adapter for `store.js`: write the adapter for whichever backend Dana picks (connect/push/pull already stubbed). **(Dana)**: pick the backend.
6. Extend `tests/smoke.js`: chat, tasks, games, watch voice questions, owner portal sections, website request form.
7. Website request form: wire it to a form endpoint. **(Dana)**: pick Formspree, Basin or a Google Form.
8. Nowsta connection research: what their API or partner program allows. Ask, don't sign up.
9. Native watch apps: a Wear OS tile and an AsteroidOS QML app, built as separate folders with build instructions.

## Waiting on Dana
- Turn on GitHub Pages: Settings › Pages › main / root.
- Pick a backend host for shared logins (Supabase, Firebase or similar). Each needs Dana's account. This is now the one thing that makes event codes work across phones: `store.js` is ready for it.
- No "Daily Research" report was in the Drive folder on 2026-11-22; check the research task is running.
- Approve any paid service before it's added.

## Done
- 2026-11-22: `store.js` storage layer (local adapter + cloud stub); app, owner portal and BEO Studio all read and write through it, same keys.
- 2026-11-22: Event codes: manager creates a 6-letter code (no I, L, O, U), crew join on the Shift tab. Works on one device until the cloud adapter is filled in.
- 2026-11-22: Live Mode: big-target screen with current beat, live m:ss countdown, pause in red, latest cue, "Got it" for delays, verbatim specials checklist (only points, expeditors and managers can advance it), screen kept awake, Esc to exit.
- 2026-11-22: Automated smoke tests in `tests/smoke.js` (72 checks across 390 px and 1300 px).
- 2026-11-22: Fixed phone-width top bar (the "Viewing as" picker was hidden and the layout buttons were crushed) and sideways scroll in the planner cue list and manager close-out.
- 2026-11-22: Live push through ntfy, notification "Got it" acknowledgements, service worker push handler.
- 2026-11-22: Quote builder (price book, margin, good-better-best, quote to BEO).
- 2026-11-22: Only managers can create tasks.
- 2026-11-22: AI sales desk, legal department, BEO Studio, payroll, shift management.

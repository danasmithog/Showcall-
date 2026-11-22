# Showcall roadmap to a fully live app

The daily build task works from the top of "Next up". Move an item to "Done" with the date when it ships.
Items marked **(Dana)** need Dana to do something, such as create an account, approve a cost or flip a setting. The task never does those.

## Next up
1. Cloud sync layer, behind one interface: `store.js` with a localStorage adapter (today) and a stub for a hosted database. No account needed yet; it unblocks shared events later.
2. Event join by code: a manager creates a 6-letter event code and crew join with it. Works locally first, then syncs once a backend exists.
3. Web Push server design (VAPID). The service worker already handles `push`. Write the server as a small, documented function ready to deploy. **(Dana)**: choose a host.
4. Live Mode: big-target screen with the current beat, a countdown to the next one, and the specials checklist (Phase 6 of the build prompt).
5. Accessibility pass: contrast, focus order, screen-reader labels on every page.
6. Quote builder: menu items from BEO Studio templates, and an e-sign-ready proposal layout.
7. Website request form: wire it to a form endpoint. **(Dana)**: pick Formspree, Basin or a Google Form.
8. Nowsta connection research: what their API or partner program allows. Ask, don't sign up.
9. Native watch apps: a Wear OS tile and an AsteroidOS QML app, built as separate folders with build instructions.
10. Automated test suite: puppeteer smoke tests in `tests/`, run before every push.

## Waiting on Dana
- Turn on GitHub Pages: Settings › Pages › main / root.
- Pick a backend host for shared logins (Supabase, Firebase or similar). Each needs Dana's account.
- Approve any paid service before it's added.

## Done
- 2026-11-22: Live push through ntfy, notification "Got it" acknowledgements, service worker push handler.
- 2026-11-22: Quote builder (price book, margin, good-better-best, quote to BEO).
- 2026-11-22: Only managers can create tasks.
- 2026-11-22: AI sales desk, legal department, BEO Studio, payroll, shift management.

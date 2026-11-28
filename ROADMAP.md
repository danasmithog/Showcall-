# Showcall roadmap to a fully live app

The daily build task works from the top of "Next up". Move an item to "Done" with the date when it ships.
Items marked **(Dana)** need Dana to do something, such as create an account, approve a cost or flip a setting. The task never does those.

## Next up
1. Quote builder: menu items from BEO Studio templates, and an e-sign-ready proposal layout (signature lines only; no e-sign service).
2. Extend `tests/smoke.js`: chat, tasks, games, watch voice questions, owner portal sections, website request form.
3. Web Push server design (VAPID). The service worker already handles `push`. Write the server as a small, documented function ready to deploy (code only, nothing deployed). **(Dana)**: choose a host to run it.
4. Accessibility follow-ups: owner portal has one h1 per section (fine, but consider h2 under one page h1); BEO Studio form fields rely on placeholder-style labels in places, check with a screen reader; announce cue changes politely without re-reading the whole Now card each sim-minute.
5. Ready taps: reset or carry over when a beat is moved by "Running late"; show ready counts per team (A/B) for points.
6. Cloud adapter for `store.js`: write the adapter for whichever backend Dana picks (connect/push/pull already stubbed). Ready taps and event codes need it to work across phones. **(Dana)**: pick the backend.
7. Website request form: wire it to a form endpoint. **(Dana)**: pick Formspree, Basin or a Google Form.
8. Nowsta connection research: what their API or partner program allows. Ask, don't sign up.
9. Native watch apps: a Wear OS tile and an AsteroidOS QML app, built as separate folders with build instructions.

## Waiting on Dana
- Turn on GitHub Pages: Settings › Pages › main / root.
- Pick a backend host for shared logins (Supabase, Firebase or similar). Each needs Dana's account. This is now the one thing that makes event codes work across phones: `store.js` is ready for it.
- No "Daily Research" report is in the Drive folder (checked 2026-11-22 and again 2026-11-28). The research task doesn't seem to be saving there; check it is running and pointed at folder "Showcall (Event Manager app)".
- The daily build also had no runs between 2026-11-23 and 2026-11-27 (no commits or build notes); check the schedule if that wasn't intended.
- Approve any paid service before it's added.

## Done
- 2026-11-28: Accessibility pass on all four pages: skip links, main landmarks, one h1 per page, labelled sliders and selects, heading order, contrast fixes, focusable BEO preview, keyboard-usable crew map pins, and the app keeps keyboard focus when it re-renders. New `tests/a11y.js` (axe-core, 30 views at 390 and 1300 px): no serious or critical issues.
- 2026-11-28: Live Mode "Ready" tap: crew tap once when set for the next beat (status only, nothing sent, undo any time); managers see "N of M ready" and who isn't, in Live Mode and on the Now card.
- 2026-11-28: Live Mode tablet layout: two columns on landscape screens 960 px and up (countdown and Ready on the left, specials on the right). Smoke tests now 102 checks incl. 1024 x 768.
- 2026-11-22: `store.js` storage layer (local adapter + cloud stub); app, owner portal and BEO Studio all read and write through it, same keys.
- 2026-11-22: Event codes: manager creates a 6-letter code (no I, L, O, U), crew join on the Shift tab. Works on one device until the cloud adapter is filled in.
- 2026-11-22: Live Mode: big-target screen with current beat, live m:ss countdown, pause in red, latest cue, "Got it" for delays, verbatim specials checklist (only points, expeditors and managers can advance it), screen kept awake, Esc to exit.
- 2026-11-22: Automated smoke tests in `tests/smoke.js` (72 checks across 390 px and 1300 px).
- 2026-11-22: Fixed phone-width top bar (the "Viewing as" picker was hidden and the layout buttons were crushed) and sideways scroll in the planner cue list and manager close-out.
- 2026-11-22: Live push through ntfy, notification "Got it" acknowledgements, service worker push handler.
- 2026-11-22: Quote builder (price book, margin, good-better-best, quote to BEO).
- 2026-11-22: Only managers can create tasks.
- 2026-11-22: AI sales desk, legal department, BEO Studio, payroll, shift management.

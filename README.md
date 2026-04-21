# Ria Wallet

**Design Engineer Challenge &nbsp;·&nbsp; Seth Lukin &nbsp;·&nbsp; April 2026**

[Live prototype](https://ria-test-assignment.vercel.app/) &nbsp;·&nbsp; [Figma](https://www.figma.com/design/3Y1AYFvMISAjGPVlfQrw98/Untitled?node-id=88-9750&t=jwcYoK2BlgyMM669-1)

---

## Quick start

No install needed. Open the [live prototype](https://ria-test-assignment.vercel.app/) in a desktop browser. Right panel = demo toggles. If the device doesn't fit your screen, zoom out.

## Suggested flows

**Card Management**
1. **Home** → swipe carousel
2. **Tap a card / Manage Card** → try different actions — freeze, view PIN, rename
3. Try arranging cards — drag to reorder
4. Try adding or removing a card

**Send Money**
1. **Send Money** → calculate amount → pick source → pick recipient → select bank / cash → slide to confirm — happy or sad path depending on panel settings
2. **Panel: New-contact precaution = On** → send again — "Just making sure" gate; precautions only show if you haven't met them

**Bonus:** IBAN = Invalid on the bank step, or Reset wallet → Empty.

---

## What I built

An interactive prototype covering all three flows — Card Management, Wallet Home, Send Money P2P — running inside a simulated iPhone 15 Pro (393×852px) centered on a dark desktop background. A scenarios panel sits beside the device so reviewers can toggle every non-happy-path state without hunting: add-card failure, send pending/failed, promo valid/invalid, IBAN error, new-contact precaution gate. The edge cases are the first thing visible in a review, not the last.

**Stack:** Next.js + TypeScript · Tailwind 4 · Framer Motion · Phosphor Icons · Vercel · Mocked data

---

## How I got here

1. Made a Ria account and walked through the actual app. Not to copy it — to understand what I was designing into. Their home is a transfer calculator with a promo banner on top. No sense of "here's your money." That audit shaped every hierarchy decision I made.
2. Quick sketches to get the layout logic out of my head, then a style pass in Google Stitch to lock a visual direction fast.
3. Draft flows in Figma — kept deliberately lightweight, used as a flow map rather than a pixel-perfect spec.
4. Moved into Claude Code to decompose components and normalize them under a shared primitive set. Goal was consistency across all three flows without re-solving the same layout problems mid-build.
5. High-fidelity prototype pass in Claude Code, using Figma frames as design reference. Built and confirmed each screen before moving on.
6. Edge case pass: cross-referenced the brief and what I know about the TA, then built out every non-happy path. Tested locale readiness using German — long compound words like *Empfängerauswahl* are my go-to stress test for truncation and layout overflow.

---

## Five decisions worth explaining

**01 — Wallet-first home**

Ria's current home asks where you want to send money before you've even oriented yourself. For a wallet, that's backwards. The balance has to come first — it's what the user opens the app to check. Everything else descends from that. It also meant cards needed to live on the home screen rather than buried behind a profile icon. Flow 1 and Flow 2 ended up as a single screen — not a scope cut, but a product call: in a wallet, the card is the home screen's primary object.

**02 — Form-centric send flow**

The send flow is one persistent form that reveals itself in stages rather than a sequence of disconnected screens. From and To are micro-flows within the same surface — identity first, then delivery details as sub-steps inside a curtain sheet that grows and shrinks in place. Anything can be revised mid-flow without starting over. For Ria's users — who may be correcting a recipient's bank details while the sheet is already open — a linear step-by-step flow punishes the correction more than the mistake.

**03 — Stories strip: kept, repositioned**

Ria uses horizontal story cards for onboarding nudges and account prompts. I kept the pattern — users who open with intent and leave benefit from dismissible contextual nudges — but compressed them to a slim strip so they don't compete with the balance. Recent Activity is filtered per active card, which means the card and its feed need to stay coupled. Stories sit above that block, not between it.

**04 — Motion signals state, not decoration**

Every animation is tied to something changing: screen transitions, freeze overlay, PIN reveal countdown, confirmation. Spring physics for moments that deserve weight — confirmation, card drop-in, success. Fast cubic-bezier (200ms, 0.32, 0.72, 0, 1) for utility interactions. The rule was: if removing the animation makes the interface harder to read, it stays; if it just makes it feel nicer, it goes.

**05 — New-contact precaution gate**

Slide-to-confirm hands off to a "just making sure" screen before sending — but only for new recipients. The precaution block only appears if the user selects "I haven't met them in person"; for everyone else the gate is frictionless. The logic is that the risk signal isn't "new contact" by itself — it's whether there's been any physical verification. Remittance fraud often targets users sending to someone they've only interacted with online. Adding friction unconditionally would punish the majority to catch a minority; making it conditional means it's only present where it's actually warranted.

---

## Edge cases covered

| State | Behavior |
|---|---|
| Send-money pending | 4.5s processing with copy that shifts from "Sending your transfer…" to "Hang tight, this can take a moment…" so silence doesn't feel like a freeze. |
| Empty wallet | No cards: home swaps to an empty slot, reorder/add buttons disappear, Recent Activity hides. Nothing that depends on a card stays visible in a broken state. |
| Add card failure | Spinner resolves to error, wallet unchanged. |
| Send-money failure | Dedicated result screen with a retry path. Not a toast. |
| IBAN validation | Inline error on country code, check digits, and minimum length before anything gets submitted. |
| Promo invalid | Red border, "Code invalid or expired," typed value preserved so the user edits rather than re-enters. |
| Amount guards | Blocks values over 1M, enforces a single decimal, thousands separator on blur. |
| Send-to-self lock | Auto-fills preset details, locks name and city inputs with a padlock glyph. |
| Slider label cycling | Cycles through "Select a payment method / recipient / amount" before becoming "Slide to confirm." One control, four honest states. |
| Crypto splash | Picking Crypto surfaces a panel explaining it isn't built yet. A dead button would be worse. |

---

## What I'd do differently

- Tidy up the Figma file. I was moving fast and iterating in code more than in the design tool, and it shows.
- Build out a proper token system in Figma — color, spacing, type, and radius all wired to variables so design changes cascade through components automatically. The prototype already uses a token-like structure in code; the Figma should mirror that so it's actually useful as a handoff artifact rather than just a flow reference.
- Real biometric gate on confirmation instead of the slider — Face ID or fingerprint on the device level, not a gesture.
- Multi-currency balance with live FX on the home screen.
- `prefers-reduced-motion` — currently everything uses springs; those should crossfade for users who need it.
- Proper App Router routing so each screen has its own URL and the browser back button navigates through the app rather than leaving it.
- A short usability session with someone from the actual TA. Some copy and interaction patterns that feel clear to me might not land the same way for a user sending money home in a second language. The precaution gate copy especially is worth pressure-testing.
- Broader accessibility and localization pass: screen reader support, keyboard navigation, and more locale coverage beyond German. German is a good truncation stress test but doesn't cover RTL languages like Arabic, which matters given Ria's corridors.

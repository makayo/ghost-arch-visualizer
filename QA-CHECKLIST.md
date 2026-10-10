# QA Checklist: Ghost Architecture Visualizer

Run every test on the **live GitHub Pages URL**, then fill in the **Result** column (Pass / Fail plus a short note). Keep DevTools open (F12) with the **Console** and **Network** tabs visible while testing.

Tested by: ____________ Date: ____________ URL: ____________

---

## 1. Functional testing

### Core user flows

| # | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| F1 | Navigation | Click Overview, Components, Request flows, AI audit in the header | Each view appears; the clicked link is highlighted; the tab title changes | |
| F2 | Direct URL | Open `<url>#audit` in a new tab | AI audit view loads directly | |
| F3 | Browser back/forward | Visit two views, press Back, then Forward | The previous view shows each time | |
| F4 | Map → details | On Overview, click "Stripe" on the map | Components view opens with Stripe's details shown | |
| F5 | Search | Type `database`, press Search | Database appears; status says how many components match | |
| F6 | Filters | Set Layer = External services, press Search | Only Mailgun, Stripe, Tinybird analytics, ActivityPub service, and Error monitoring appear | |
| F7 | Reset | Press Reset | Form clears and all 24 components return | |
| F8 | Flow stepper | On Request flows, press Next through every step | Step text, step count, and highlighted map node update each time | |
| F9 | Change flow | Pick a different flow | Starts at Step 1 of the new flow | |
| F10 | Audit data | Open AI audit | Table shows 14 claims; summary shows 7 verified, 6 corrected, 1 partly verified, 0 still unverified | |
| F11 | Status filter | Set Source status = AI knowledge only, press Search | Only Reader's browser appears | |

### Edge cases

| # | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| E1 | Empty search | Clear the box, press Search | All components shown; no error | |
| E2 | Spaces only | Type 5 spaces, press Search | Message says the search was empty; all components shown | |
| E3 | No results | Search `zzzz` | "No components match" box and a "No results" message | |
| E4 | Long string | Paste a 300-character string | Input stops at 100 characters; message text is shortened with "…"; layout doesn't stretch | |
| E5 | Special characters | Search `<script>alert(1)</script>` | Shown as plain text in the message; nothing runs | |
| E6 | Filters with no matches | Layer = Tooling, Status = AI knowledge only | "No components match these filters." | |
| E7 | Click past the ends | On Step 1, try Previous; on the last step, try Next | Buttons are disabled; nothing breaks | |
| E8 | Rapid clicks | Click Next very quickly 10 times | Stops at the last step with no errors | |
| E9 | Unknown URL | Open `<url>#nonsense` | "Page not found" view with a link back | |

---

## 2. UI and responsive design

Use DevTools device toolbar (Ctrl + Shift + M in Chrome/Edge, Ctrl + Shift + M in Firefox).

| # | Viewport | Check | Result |
|---|---|---|---|
| R1 | Desktop 1920×1080 | All views: no overlapping text, no clipped labels, layout uses the width sensibly | |
| R2 | Tablet 768×1024 | Components and flows stack into one column; form fields wrap neatly | |
| R3 | Mobile 375×667 | Header wraps; map rows stack; buttons fit; no sideways page scroll | |
| R4 | Audit table on mobile | Table scrolls sideways inside its box, not the whole page | |
| R5 | Long text | After test E4, the status message wraps instead of overflowing | |

---

## 3. Cross-browser and console health

| # | Check | Chromium (Chrome/Edge) | Firefox or Safari |
|---|---|---|---|
| B1 | Every view loads and works | | |
| B2 | Console: zero uncaught errors after running F1–F10 and E1–E9 | | |
| B3 | Network tab: zero 404s after a hard reload (Ctrl + Shift + R) | | |
| B4 | Search, filters, and flow stepper behave the same | | |

---

## 4. Accessibility and performance

| # | Check | Steps | Expected result | Result |
|---|---|---|---|---|
| A1 | Labels | Click each form label | Focus moves into its field | |
| A2 | Tab order | Press Tab from the top of the page | Skip link → nav → page controls, in reading order, with a visible outline | |
| A3 | Keyboard use | Use only Tab, Enter, and Space to search and step through a flow | Everything works without a mouse | |
| A4 | Skip link | Press Tab once on page load, then Enter | Focus jumps to the main content | |
| A5 | Lighthouse | DevTools → Lighthouse → Accessibility + Performance → Analyze | Record both scores here: Accessibility ___ Performance ___ | |
| A6 | Load speed | Network tab, hard reload | Page finishes loading quickly; only 4 files (HTML, CSS, 2 JS) | |

---

## Issues found and fixed

| Issue | Fix | Retest result |
|---|---|---|
| | | |
